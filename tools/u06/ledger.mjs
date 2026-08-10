import { createHash } from "node:crypto";
import { closeSync, existsSync, fstatSync, fsyncSync, ftruncateSync, openSync, readFileSync, readSync, writeSync } from "node:fs";
import { canonicalStringify, validateEvidenceRecord } from "./contracts.mjs";

const HASH_BYTES = 64;
const MAX_RECORD_BYTES = 1024 * 1024;

export class LedgerIntegrityError extends Error {
  constructor(message) { super(message); this.name = "LedgerIntegrityError"; this.status = "FAIL"; }
}

export class DurableLedger {
  constructor(filePath) {
    this.filePath = filePath;
    this.fd = openSync(filePath, existsSync(filePath) ? "r+" : "wx+", 0o600);
    const recovered = recoverLedgerFd(this.fd);
    this.records = recovered.records;
    this.byId = new Map(this.records.map((record) => [record.recordId, canonicalRecord(record)]));
    this.offset = recovered.validBytes;
  }

  append(record, crashPoint) {
    if (!record?.recordId || typeof record.recordId !== "string") throw new LedgerIntegrityError("recordId required");
    if (!["PASS", "FAIL", "BLOCKED", "SKIPPED"].includes(record.status)) throw new LedgerIntegrityError("immutable terminal status required");
    try { validateEvidenceRecord(record); } catch (error) { throw new LedgerIntegrityError(`invalid evidence record: ${error.message}`); }
    const canonical = canonicalRecord(record);
    const existing = this.byId.get(record.recordId);
    if (existing) {
      if (existing !== canonical) throw new LedgerIntegrityError(`divergent duplicate record ${record.recordId}`);
      return { duplicate: true, offset: this.offset };
    }
    const frame = encodeFrame(canonical);
    if (crashPoint === "before-frame") throw new Error("U06_INJECTED_CRASH:before-frame");
    writeSync(this.fd, frame, 0, frame.length, this.offset);
    if (crashPoint === "after-frame-before-flush") throw new Error("U06_INJECTED_CRASH:after-frame-before-flush");
    fsyncSync(this.fd);
    this.offset += frame.length;
    this.records.push(record);
    this.byId.set(record.recordId, canonical);
    return { duplicate: false, offset: this.offset };
  }

  close() { if (this.fd !== undefined) { closeSync(this.fd); this.fd = undefined; } }
}

export class OrderedLedgerQueue {
  constructor(ledger, { capacity = 256 } = {}) { this.ledger = ledger; this.capacity = capacity; this.pending = 0; this.tail = Promise.resolve(); }
  enqueue(record) {
    if (this.pending >= this.capacity) { const error = new Error(`writer queue exceeds ${this.capacity}`); error.status = "BLOCKED"; throw error; }
    this.pending++;
    const task = this.tail.then(() => this.ledger.append(record)).finally(() => { this.pending--; });
    this.tail = task.catch(() => undefined);
    return task;
  }
  async drain() { await this.tail; }
}

export function recoverLedger(filePath) {
  const fd = openSync(filePath, "r+");
  try { return recoverLedgerFd(fd); } finally { closeSync(fd); }
}

export function encodeFrame(canonical) {
  const body = Buffer.from(canonical, "utf8");
  if (body.length > MAX_RECORD_BYTES) throw new LedgerIntegrityError("ledger record exceeds 1 MiB");
  const length = Buffer.from(`${body.length}:`, "ascii");
  const digest = Buffer.from(createHash("sha256").update(body).digest("hex"), "ascii");
  return Buffer.concat([length, body, Buffer.from(":"), digest, Buffer.from("\n")]);
}

function recoverLedgerFd(fd) {
  const size = fstatSync(fd).size;
  const bytes = Buffer.alloc(size);
  if (size) readSync(fd, bytes, 0, size, 0);
  const records = [];
  const ids = new Map();
  let offset = 0;
  while (offset < bytes.length) {
    const colon = bytes.indexOf(58, offset);
    if (colon < 0) break;
    const lengthText = bytes.subarray(offset, colon).toString("ascii");
    if (!/^(?:0|[1-9]\d*)$/.test(lengthText)) break;
    const length = Number(lengthText);
    if (!Number.isSafeInteger(length) || length > MAX_RECORD_BYTES) throw new LedgerIntegrityError("invalid ledger frame length");
    const bodyStart = colon + 1;
    const separator = bodyStart + length;
    const digestStart = separator + 1;
    const end = digestStart + HASH_BYTES + 1;
    if (end > bytes.length || bytes[separator] !== 58 || bytes[end - 1] !== 10) break;
    const body = bytes.subarray(bodyStart, separator);
    const expected = bytes.subarray(digestStart, end - 1).toString("ascii");
    const actual = createHash("sha256").update(body).digest("hex");
    if (expected !== actual) throw new LedgerIntegrityError("ledger frame hash mismatch");
    let record;
    try { record = JSON.parse(body.toString("utf8")); } catch { throw new LedgerIntegrityError("invalid canonical ledger JSON"); }
    if (!record.recordId) throw new LedgerIntegrityError("ledger recordId missing");
    try { validateEvidenceRecord(record); } catch (error) { throw new LedgerIntegrityError(`invalid persisted evidence record: ${error.message}`); }
    const canonical = canonicalRecord(record);
    if (canonical !== body.toString("utf8")) throw new LedgerIntegrityError("non-canonical ledger record");
    if (ids.has(record.recordId) && ids.get(record.recordId) !== canonical) throw new LedgerIntegrityError("divergent duplicate ledger record");
    if (!ids.has(record.recordId)) { ids.set(record.recordId, canonical); records.push(record); }
    offset = end;
  }
  if (offset < size) { ftruncateSync(fd, offset); fsyncSync(fd); }
  return { records, validBytes: offset, truncatedBytes: size - offset };
}

function canonicalRecord(record) { return canonicalStringify(record, record.recordKind).trimEnd(); }

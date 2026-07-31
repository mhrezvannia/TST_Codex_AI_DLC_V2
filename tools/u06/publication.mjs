import { createHash } from "node:crypto";

const KIND = /^[a-z0-9-]+$/;

export class PublicationCapability {
  #issued = new WeakSet();

  constructor({ writer, runPrefix = "evidence" }) {
    if (!writer?.commit) throw new Error("evidence writer capability required");
    this.writer = writer;
    this.runPrefix = runPrefix;
  }

  publishCell({ registryKey, producingGate, payloads }) {
    if (!registryKey || !producingGate || !payloads || typeof payloads !== "object") {
      throw new Error("typed publication request required");
    }
    const kinds = Object.keys(payloads).sort();
    if (!kinds.length || kinds.some((kind) => !KIND.test(kind))) throw new Error("artifact kinds required");
    const envelope = {
      schemaVersion: 1,
      registryKey,
      artifacts: kinds.map((kind) => ({
        kind,
        encoding: "base64",
        bytes: toBuffer(payloads[kind]).toString("base64"),
      })),
    };
    const committed = this.writer.commit(registryKey, `${JSON.stringify(envelope)}\n`);
    const receiptBody = {
      ...committed,
      relativePath: `${this.runPrefix}/${committed.relativePath}`,
    };
    const receipt = Object.freeze({ ...receiptBody,
      receiptId: createHash("sha256").update(stableJson(receiptBody)).digest("hex") });
    validateCommitReceipt(receipt);
    const records = kinds.map((kind) => Object.freeze({
      recordKind: "artifact",
      schemaVersion: 1,
      recordId: `artifact:${registryKey}:${kind}`,
      artifactId: `artifact:${registryKey}:${kind}`,
      registryKey,
      kind,
      relativePath: receipt.relativePath,
      sha256: receipt.sha256,
      bytes: receipt.bytes,
      mediaType: kind === "screenshot" ? "application/json" : "application/json",
      producingGate,
      status: "PASS",
      commitReceipt: receipt,
    }));
    for (const record of records) this.#issued.add(record);
    return {
      refs: records.map(({ kind, sha256, bytes }) => ({ kind, sha256, bytes })),
      records,
    };
  }

  assertIssued(records) {
    if (!Array.isArray(records) || records.some((record) => !this.#issued.has(record))) {
      throw new Error("adapter returned artifact outside writer publication capability");
    }
    return records;
  }
}

export function validateCommitReceipt(receipt) {
  const { receiptId, ...receiptBody } = receipt ?? {};
  if (receipt?.schemaVersion !== 1
    || !["win32-handle-relative-no-replace-v1", "u06-writer-test-seam-v1"].includes(receipt.capability)
    || receipt.registryKey == null
    || !/^[a-f0-9]{64}$/.test(receipt.sha256)
    || !Number.isSafeInteger(receipt.bytes)
    || receipt.bytes <= 0
    || !receipt.nativeIdentity
    || !Number.isSafeInteger(receipt.nativeIdentity.volumeSerial)
    || !Number.isSafeInteger(receipt.nativeIdentity.rootIndexHigh)
    || !Number.isSafeInteger(receipt.nativeIdentity.rootIndexLow)
    || !Number.isSafeInteger(receipt.nativeIdentity.parentIndexHigh)
    || !Number.isSafeInteger(receipt.nativeIdentity.parentIndexLow)
    || receipt.nativeIdentity.links !== 1
    || !Number.isSafeInteger(receipt.nativeIdentity.fileIndexHigh)
    || !Number.isSafeInteger(receipt.nativeIdentity.fileIndexLow)
    || !/^[a-f0-9]{64}$/.test(receiptId)
    || receiptId !== createHash("sha256").update(stableJson(receiptBody)).digest("hex")) {
    throw new Error("invalid native writer commit receipt");
  }
  return receipt;
}

function toBuffer(value) {
  if (Buffer.isBuffer(value)) return value;
  return Buffer.from(typeof value === "string" ? value : JSON.stringify(value), "utf8");
}

function stableJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
}

import assert from "node:assert/strict";
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { DurableLedger, LedgerIntegrityError, OrderedLedgerQueue, recoverLedger } from "../../tools/u06/ledger.mjs";
import { compileManifest, publishManifest, reconcileArtifacts, recoverManifestPublication } from "../../tools/u06/manifest.mjs";
import registry from "./acceptance-registry.json" with { type: "json" };

let sequence = 0;
function fixture(label) { const root = path.resolve(`artifacts/u06/ledger-test-${label}-${process.pid}-${sequence++}`); mkdirSync(root, { recursive: true }); return root; }
function gate(id, status = "PASS") { return { recordKind: "gate", schemaVersion: 1, recordId: id, gateId: id, startedAt: "2026-07-29T00:00:00.000Z", completedAt: "2026-07-29T00:00:01.000Z", status, exitCode: status === "PASS" ? 0 : 1, blockerId: status === "BLOCKED" ? `B-${id}` : undefined }; }

test("length/hash frames are durable, exactly-once, and immutable", () => {
  const file = path.join(fixture("append"), "ledger.log");
  const ledger = new DurableLedger(file);
  assert.equal(ledger.append(gate("g1")).duplicate, false);
  assert.equal(ledger.append(gate("g1")).duplicate, true);
  assert.throws(() => ledger.append({ ...gate("g1"), status: "FAIL", exitCode: 1 }), LedgerIntegrityError);
  ledger.close();
  assert.deepEqual(recoverLedger(file).records.map((record) => record.recordId), ["g1"]);
});

test("torn tails truncate to the last complete hash boundary", () => {
  const file = path.join(fixture("torn"), "ledger.log");
  const ledger = new DurableLedger(file); ledger.append(gate("g1")); ledger.close();
  appendFileSync(file, "100:{\"torn\":");
  const recovered = recoverLedger(file);
  assert.equal(recovered.records.length, 1);
  assert.ok(recovered.truncatedBytes > 0);
  assert.equal(recoverLedger(file).truncatedBytes, 0);
});

test("crash before frame is empty; complete unflushed frame remains hash-valid", () => {
  const file = path.join(fixture("crash"), "ledger.log");
  let ledger = new DurableLedger(file);
  assert.throws(() => ledger.append(gate("g1"), "before-frame"), /INJECTED_CRASH/); ledger.close();
  assert.equal(recoverLedger(file).records.length, 0);
  ledger = new DurableLedger(file);
  assert.throws(() => ledger.append(gate("g1"), "after-frame-before-flush"), /INJECTED_CRASH/); ledger.close();
  assert.equal(recoverLedger(file).records.length, 1);
});

test("ordered writer queue enforces the reviewed 256 cap", async () => {
  const fake = { append: () => true };
  const queue = new OrderedLedgerQueue(fake);
  const tasks = Array.from({ length: 256 }, (_, index) => queue.enqueue(gate(`g${index}`)));
  assert.throws(() => queue.enqueue(gate("overflow")), (error) => error.status === "BLOCKED");
  await Promise.all(tasks);
  assert.equal(queue.pending, 0);
});

test("immutable manifest versions recover pointer crashes and finalize idempotently", () => {
  const root = fixture("manifest");
  const manifest = compileManifest({ runId: "20260729T000000.000Z-deadbeef", ledgerRecords: [gate("g1")], registry, runRoot: root });
  const first = publishManifest(root, manifest);
  const repeat = publishManifest(root, manifest);
  assert.equal(repeat.sequence, first.sequence);
  assert.deepEqual(JSON.parse(readFileSync(path.join(root, "manifest.json"))), JSON.parse(JSON.stringify(manifest)));
  const changed = { ...manifest, completedAt: "2026-07-29T00:00:02.000Z" };
  assert.throws(() => publishManifest(root, changed, { crashPoint: "after-pointer-temp" }), /INJECTED_CRASH/);
  const recovered = recoverManifestPublication(root);
  assert.equal(recovered.sequence, 2);
  assert.deepEqual(JSON.parse(readFileSync(path.join(root, "manifest.json"))), JSON.parse(JSON.stringify(changed)));
});

test("renamed-but-unindexed artifacts are quarantined in the recovery plan", () => {
  const root = fixture("orphan");
  mkdirSync(path.join(root, "results/quality"), { recursive: true });
  writeFileSync(path.join(root, "results/quality/git-diff.json"), "orphan");
  const registry = { members: [{ key: "QUALITY:GIT_DIFF", destination: "results/quality/git-diff.json" }] };
  assert.deepEqual(reconcileArtifacts(root, registry, []), [{ relativePath: "results/quality/git-diff.json", bytes: 6, status: "QUARANTINED_UNINDEXED" }]);
});

test("FAILED/BLOCKED manifests cannot be upgraded and artifact mismatch blocks", () => {
  const root = fixture("terminal");
  const blocked = compileManifest({ runId: "20260729T000000.000Z-deadbeef", ledgerRecords: [gate("g1", "BLOCKED")], registry, runRoot: root });
  assert.equal(blocked.status, "BLOCKED"); publishManifest(root, blocked);
  assert.throws(() => publishManifest(root, { ...blocked, status: "PASSED" }), /cannot be upgraded/);
  assert.equal(compileManifest({ runId: blocked.runId, ledgerRecords: [gate("g1")], registry, runRoot: root }).status, "BLOCKED");
});

test("ledger rejects malformed typed records before framing", () => {
  const file = path.join(fixture("typed"), "ledger.log"); const ledger = new DurableLedger(file);
  assert.throws(() => ledger.append({ recordKind: "gate", schemaVersion: 99, recordId: "bad", status: "PASS" }), /invalid evidence record/);
  ledger.close();
});

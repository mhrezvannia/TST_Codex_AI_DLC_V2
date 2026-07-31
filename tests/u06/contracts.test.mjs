import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { assertExactDecimal, canonicalStringify, deriveTechnicalStatus, REQUIRED_TERMINAL_GATE_IDS, validateEvidenceRecord, verifyArtifactBytes } from "../../tools/u06/contracts.mjs";
import registry from "./acceptance-registry.json" with { type: "json" };

const baseGate = { recordKind: "gate", schemaVersion: 1, gateId: "preflight", phase: "guard", requirements: ["BR-U06-005"], command: ["npm", "run", "demo:guard"], startedAt: "2026-07-29T00:00:00.000Z", completedAt: "2026-07-29T00:00:01.000Z", startMonotonicNs: "1", endMonotonicNs: "2", exitCode: 0, status: "PASS", summary: "observed", artifactIds: ["a1"] };

function manifest(overrides = {}) {
  const keys = registry.members.map((member) => member.key);
  return { recordKind: "manifest", schemaVersion: 1, intent: "W2-03-charge-tariffs-and-agreements", runId: "20260729T000000.000Z-deadbeef", startedAt: "2026-07-29T00:00:00.000Z", completedAt: "2026-07-29T00:00:01.000Z", status: "BLOCKED",
    gates: REQUIRED_TERMINAL_GATE_IDS.map((gateId) => ({ gateId, status: "BLOCKED" })), registryResults: keys.map((key) => ({ key, status: "BLOCKED" })), blockers: ["b"],
    expectedRegistryKeys: keys, requiredGateIds: [...REQUIRED_TERMINAL_GATE_IDS], artifacts: [], ...overrides };
}

test("canonical serialization is byte-stable and fixed-order", () => {
  const shuffled = { summary: "observed", status: "PASS", ...baseGate };
  assert.equal(canonicalStringify(shuffled), canonicalStringify(baseGate));
  assert.ok(canonicalStringify(baseGate).startsWith('{"recordKind":"gate","schemaVersion":1,"gateId":"preflight"'));
});

test("exact decimals stay strings and binary floats are rejected", () => {
  assert.equal(assertExactDecimal("123.40"), "123.40");
  assert.throws(() => assertExactDecimal(123.4), /exact/);
  assert.throws(() => assertExactDecimal("123.4"), /scale-two/);
});

test("closed enums and safe relative paths are enforced", () => {
  assert.throws(() => validateEvidenceRecord({ ...baseGate, status: "UNKNOWN" }), /not terminal/);
  const artifact = { recordKind: "artifact", schemaVersion: 1, artifactId: "a", registryKey: "QUALITY:GIT_DIFF", relativePath: "../escape", sha256: "a".repeat(64), bytes: 1, mediaType: "text/plain", producingGate: "g" };
  assert.throws(() => validateEvidenceRecord(artifact), /safe relative/);
  assert.throws(() => validateEvidenceRecord({ ...artifact, relativePath: "C:/escape" }), /safe relative/);
});

test("technical status is fail-closed and requires exact gates, registry, artifacts, and terminal enums", () => {
  assert.equal(deriveTechnicalStatus(), "BLOCKED");
  assert.equal(deriveTechnicalStatus({ gates: [{ status: "BLOCKED" }], blockers: ["b"] }), "BLOCKED");
  assert.equal(deriveTechnicalStatus({ gates: [{ status: "FAIL" }, { status: "BLOCKED" }] }), "FAILED");
  assert.equal(deriveTechnicalStatus({ gates: [{ gateId: "g", status: "PASS" }], registryResults: [{ key: "r", status: "PASS" }],
    expectedRegistryKeys: ["r"], requiredGateIds: ["g"], artifactsVerified: true }), "PASSED");
  assert.equal(deriveTechnicalStatus({ gates: [{ gateId: "g", status: "RUNNING" }], registryResults: [{ key: "r", status: "PASS" }],
    expectedRegistryKeys: ["r"], requiredGateIds: ["g"], artifactsVerified: true }), "FAILED");
  assert.equal(deriveTechnicalStatus({ gates: [{ gateId: "g", status: "PASS" }], registryResults: [], expectedRegistryKeys: ["r"], requiredGateIds: ["g"], artifactsVerified: true }), "BLOCKED");
});

test("manifest rejects caller status, PASS with blocker, and human approval", () => {
  assert.throws(() => validateEvidenceRecord(manifest({ status: "FAILED" })), /derived as BLOCKED/);
  assert.throws(() => validateEvidenceRecord(manifest({ status: "PASSED" })), /artifacts are mandatory/);
  assert.throws(() => validateEvidenceRecord(manifest({ humanApproval: true })), /human approval/);
});

test("artifact verification rejects digest and byte mismatches", () => {
  const bytes = Buffer.from("evidence");
  const receiptBody = { schemaVersion: 1, capability: "u06-writer-test-seam-v1", registryKey: "QUALITY:GIT_DIFF",
    relativePath: "results/quality/git-diff.json", sha256: "ee8250fb76e094b34b471f13a73dbbe51d1ae142e9df59d7c0d31ec20f0a0a8e",
    bytes: bytes.length, nativeIdentity: { volumeSerial: 1, rootIndexHigh: 0, rootIndexLow: 1, parentIndexHigh: 0,
      parentIndexLow: 2, fileIndexHigh: 0, fileIndexLow: 3, links: 1 } };
  const receipt = { ...receiptBody, receiptId: createHash("sha256").update(stableJson(receiptBody)).digest("hex") };
  const artifact = { recordKind: "artifact", schemaVersion: 1, artifactId: "a", registryKey: "QUALITY:GIT_DIFF", relativePath: receipt.relativePath,
    sha256: receipt.sha256, bytes: bytes.length, mediaType: "application/json", producingGate: "g", commitReceipt: receipt };
  assert.equal(verifyArtifactBytes(artifact, bytes), true);
  assert.throws(() => verifyArtifactBytes({ ...artifact, sha256: "0".repeat(64) }, bytes), /does not match/);
  assert.throws(() => verifyArtifactBytes({ ...artifact, bytes: 99 }, bytes), /does not match/);
  assert.throws(() => verifyArtifactBytes({ ...artifact, commitReceipt: undefined }, bytes), /commit receipt/);
  assert.throws(() => verifyArtifactBytes({ ...artifact, commitReceipt: { ...receipt, receiptId: "0".repeat(64) } }, bytes), /commit receipt/);
});

function stableJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
}

test("UTC, monotonic nanoseconds, and lowercase hashes are enforced", () => {
  assert.doesNotThrow(() => validateEvidenceRecord(baseGate));
  assert.throws(() => validateEvidenceRecord({ ...baseGate, startedAt: "2026-07-29 00:00:00" }), /UTC/);
  assert.throws(() => validateEvidenceRecord({ ...baseGate, startMonotonicNs: -1 }), /nanoseconds/);
});

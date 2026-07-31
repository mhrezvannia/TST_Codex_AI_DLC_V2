import { createHash } from "node:crypto";
import { EXPECTED_MEMBER_KEYS_DIGEST } from "./registry.mjs";
import { validateCommitReceipt } from "./publication.mjs";

export const TERMINAL_RESULT_STATUSES = Object.freeze(["PASS", "FAIL", "BLOCKED", "SKIPPED"]);
export const MANIFEST_STATUSES = Object.freeze(["PLANNED", "RUNNING", "BLOCKED", "FAILED", "PASSED"]);
export const RECORD_KINDS = Object.freeze(["manifest", "gate", "guard", "blocker", "protected-artifact",
  "preservation", "security", "migration", "recovery", "scenario", "http", "database", "correlation",
  "browser", "performance-sample", "performance-set", "observability", "audit", "artifact", "registry-result"]);
export const REQUIRED_TERMINAL_GATE_IDS = Object.freeze([
  "resource-preflight", "manager-pre-guard", "manager-inventory-before", "wave-a-isolation-config", "evidence-writer",
  "live-startup", "readiness", "migration-charge", "migration-booking", "restore-charge", "restore-booking",
  "commercial", "browser", "performance", "security", "observability", "preservation", "quality", "audits",
  "teardown", "manager-post-guard", "manager-inventory-after", "manager-unchanged", "ledger-recovery", "artifact-rehash",
]);

const LOWER_SHA256 = /^[a-f0-9]{64}$/;
const EXACT_DECIMAL = /^-?(?:0|[1-9]\d*)\.\d{2}$/;
const MONOTONIC_NS = /^(?:0|[1-9]\d*)$/;
const UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const RUN_ID = /^\d{8}T\d{6}\.\d{3}Z-[a-f0-9]{8}$/;

const ORDER = Object.freeze({
  manifest: ["recordKind", "schemaVersion", "intent", "runId", "startedAt", "completedAt", "status", "supersedesRunId", "provenance", "guards", "gates", "blockers", "protectedArtifacts", "preservationResults", "securityMatrix", "migrations", "recovery", "scenarios", "browserMatrices", "performanceSets", "observability", "audits", "artifacts"],
  gate: ["recordKind", "schemaVersion", "gateId", "phase", "requirements", "command", "startedAt", "completedAt", "startMonotonicNs", "endMonotonicNs", "exitCode", "status", "summary", "artifactIds", "blockerId", "skippedBecause"],
  blocker: ["recordKind", "schemaVersion", "blockerId", "detectedAt", "dependency", "observedFailure", "impact", "nextAction", "owner", "historicalWaiver"],
  artifact: ["recordKind", "schemaVersion", "artifactId", "registryKey", "relativePath", "sha256", "bytes", "mediaType", "producingGate"],
});

export function canonicalStringify(value, recordKind = value?.recordKind) {
  return `${serialize(value, ORDER[recordKind] ?? [])}\n`;
}

export function validateEvidenceRecord(record, { artifactLoader } = {}) {
  if (!record || typeof record !== "object" || !RECORD_KINDS.includes(record.recordKind)) fail("unknown record kind");
  if (record.schemaVersion !== 1) fail("unsupported evidence schema version");
  validateNoAbsoluteOrTraversalPaths(record);
  validateTypedScalars(record);
  if (record.recordKind === "gate") validateGate(record);
  if (record.recordKind === "manifest") validateManifest(record, artifactLoader);
  if (record.recordKind === "artifact") validateArtifact(record);
  if (record.recordKind === "database" && !["CHARGE", "BOOKING"].includes(record.owner)) fail("database evidence must name one owner");
  if (record.recordKind === "performance-sample" && record.replayed !== false) fail("fresh performance sample must not be replayed");
  if (record.recordKind === "registry-result" && (!record.recordId || record.recordId !== record.key || !TERMINAL_RESULT_STATUSES.includes(record.status))) fail("invalid registry result record");
  return record;
}

export function deriveTechnicalStatus({ gates = [], registryResults = [], blockers = [], artifactsVerified = false,
  expectedRegistryKeys = [], requiredGateIds = REQUIRED_TERMINAL_GATE_IDS } = {}) {
  const statuses = [...gates, ...registryResults].map((item) => item.status);
  if (statuses.some((status) => status === "FAIL" || !TERMINAL_RESULT_STATUSES.includes(status))) return "FAILED";
  const gateIds = gates.map((gate) => gate.gateId ?? gate.id);
  const resultKeys = registryResults.map((result) => result.key ?? result.recordId);
  const exactGates = exactSet(gateIds, requiredGateIds);
  const exactResults = expectedRegistryKeys.length > 0 && exactSet(resultKeys, expectedRegistryKeys);
  if (!artifactsVerified || !exactGates || !exactResults || blockers.length || statuses.some((status) => ["BLOCKED", "SKIPPED"].includes(status))) return "BLOCKED";
  return "PASSED";
}

export function verifyArtifactBytes(artifact, bytes) {
  validateArtifact(artifact);
  const actual = createHash("sha256").update(bytes).digest("hex");
  if (actual !== artifact.sha256 || bytes.length !== artifact.bytes) fail(`artifact hash mismatch ${artifact.artifactId}`);
  return true;
}

export function assertExactDecimal(value, label = "decimal") {
  if (typeof value !== "string" || !EXACT_DECIMAL.test(value)) fail(`${label} must be an exact scale-two decimal string`);
  return value;
}

export function assertUtc(value, label = "timestamp") {
  if (typeof value !== "string" || !UTC.test(value) || Number.isNaN(Date.parse(value))) fail(`${label} must be UTC`);
  return value;
}

export function assertRelativePath(value, label = "path") {
  if (typeof value !== "string" || !value || value.includes("\\") || value.startsWith("/") || /^[a-zA-Z]:/.test(value)
    || value.startsWith("//") || value.split("/").some((part) => part === ".." || part === "." || !part)) fail(`${label} must be a safe relative path`);
  return value;
}

function validateManifest(record, artifactLoader) {
  if (record.intent !== "W2-03-charge-tariffs-and-agreements") fail("wrong manifest intent");
  if (!RUN_ID.test(record.runId)) fail("invalid run id");
  if (!MANIFEST_STATUSES.includes(record.status)) fail("closed manifest status required");
  if (Object.hasOwn(record, "humanApproval") || Object.hasOwn(record, "approved")) fail("human approval is excluded from technical evidence");
  if (!Array.isArray(record.expectedRegistryKeys) || record.expectedRegistryKeys.length !== 120) fail("manifest must pin 120 registry keys");
  if (createHash("sha256").update(JSON.stringify(record.expectedRegistryKeys)).digest("hex") !== EXPECTED_MEMBER_KEYS_DIGEST) fail("manifest registry identity digest mismatch");
  if (!Array.isArray(record.requiredGateIds) || !exactSet(record.requiredGateIds, REQUIRED_TERMINAL_GATE_IDS)) fail("manifest terminal gate catalog mismatch");
  if (!Array.isArray(record.artifacts) || (record.status === "PASSED" && record.artifacts.length === 0)) fail("PASSED manifest artifacts are mandatory");
  let artifactsVerified = false;
  if (artifactLoader && record.artifacts.length > 0) {
    artifactsVerified = record.artifacts.every((artifact) => verifyArtifactBytes(artifact, artifactLoader(artifact.relativePath)))
      && record.registryResults.every((result) => Array.isArray(result.artifacts) && result.artifacts.length > 0
        && result.artifacts.every((required) => record.artifacts.some((artifact) => artifact.registryKey === result.key
          && artifact.kind === required.kind && artifact.sha256 === required.sha256 && artifact.bytes === required.bytes)));
  } else if (record.status === "PASSED") fail("PASSED manifest requires reopen/hash/length verification");
  const derived = deriveTechnicalStatus({ gates: record.gates, registryResults: record.registryResults, blockers: record.blockers,
    artifactsVerified, expectedRegistryKeys: record.expectedRegistryKeys, requiredGateIds: record.requiredGateIds });
  if (record.status !== derived) fail(`manifest status must be derived as ${derived}`);
  if (record.status === "PASSED" && record.blockers?.length) fail("PASSED manifest cannot contain blockers");
}

function exactSet(actual, expected) {
  return Array.isArray(actual) && actual.length === expected.length && new Set(actual).size === expected.length
    && actual.every((value, index) => value === expected[index]);
}

function validateGate(record) {
  if (!TERMINAL_RESULT_STATUSES.includes(record.status)) fail("gate status is not terminal");
  if (record.status === "PASS" && (record.exitCode !== 0 || record.blockerId)) fail("PASS gate must be zero-exit and blocker-free");
  if (record.status === "BLOCKED" && !record.blockerId) fail("BLOCKED gate requires blocker");
  if (record.status === "SKIPPED" && !record.skippedBecause) fail("SKIPPED gate requires terminal link");
}

function validateArtifact(record) {
  assertRelativePath(record.relativePath, "artifact relativePath");
  if (!LOWER_SHA256.test(record.sha256)) fail("artifact sha256 must be lowercase");
  if (!Number.isSafeInteger(record.bytes) || record.bytes < 0) fail("artifact byte count invalid");
  validateCommitReceipt(record.commitReceipt);
  if (record.commitReceipt.registryKey !== record.registryKey
    || record.commitReceipt.relativePath !== record.relativePath
    || record.commitReceipt.sha256 !== record.sha256
    || record.commitReceipt.bytes !== record.bytes) fail("artifact does not match native commit receipt");
}

function validateTypedScalars(value, key = "") {
  if (value === null || value === undefined) return;
  if (Array.isArray(value)) { value.forEach((item) => validateTypedScalars(item, key)); return; }
  if (typeof value !== "object") {
    if (/At$/.test(key)) assertUtc(value, key);
    if (/MonotonicNs$/.test(key) && (typeof value !== "string" || !MONOTONIC_NS.test(value))) fail(`${key} must be integer nanoseconds`);
    if (/^(?:unitRate|amount|total|expectedAmount|observedAmount)$/.test(key)) assertExactDecimal(value, key);
    if (/sha256$/i.test(key) && !LOWER_SHA256.test(value)) fail(`${key} must be lowercase SHA-256`);
    return;
  }
  for (const [childKey, child] of Object.entries(value)) validateTypedScalars(child, childKey);
}

function validateNoAbsoluteOrTraversalPaths(value) {
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (typeof child === "string" && /(?:Path|Paths|relativePath)$/.test(key)) assertRelativePath(child, key);
    else validateNoAbsoluteOrTraversalPaths(child);
  }
}

function serialize(value, preferredKeys) {
  if (value === null) return "null";
  if (Array.isArray(value)) return `[${value.map((item) => serialize(item, [])).join(",")}]`;
  if (typeof value !== "object") return JSON.stringify(value);
  const keys = Object.keys(value).filter((key) => value[key] !== undefined);
  const preferred = preferredKeys.filter((key) => keys.includes(key));
  const remaining = keys.filter((key) => !preferred.includes(key)).sort();
  return `{${[...preferred, ...remaining].map((key) => `${JSON.stringify(key)}:${serialize(value[key], [])}`).join(",")}}`;
}

function fail(message) { throw new Error(message); }

import { createHash } from "node:crypto";
import { closeSync, existsSync, fsyncSync, openSync, readFileSync, readdirSync, renameSync, statSync, unlinkSync, writeSync } from "node:fs";
import path from "node:path";
import { canonicalStringify, deriveTechnicalStatus, REQUIRED_TERMINAL_GATE_IDS, validateEvidenceRecord, verifyArtifactBytes } from "./contracts.mjs";

const VERSION = /^manifest\.(\d+)\.([a-f0-9]{64})\.json$/;

export function compileManifest({ runId, ledgerRecords, registry, runRoot, previousTerminalStatus }) {
  if (!registry?.members || registry.members.length !== 120) throw new Error("closed registry required for manifest");
  const gates = ledgerRecords.filter((record) => record.recordKind === "gate");
  const registryResults = ledgerRecords.filter((record) => record.recordKind === "registry-result");
  const blockers = ledgerRecords.filter((record) => record.recordKind === "blocker" || record.status === "BLOCKED").map((record) => record.blockerId ?? record.recordId);
  const artifacts = ledgerRecords.filter((record) => record.recordKind === "artifact");
  const expectedRegistryKeys = registry.members.map((member) => member.key);
  const artifactsVerified = Boolean(runRoot) && artifacts.length > 0 && artifacts.every((artifact) => verifyArtifactBytes(artifact, readFileSync(path.join(runRoot, artifact.relativePath))));
  let status = deriveTechnicalStatus({ gates, registryResults, blockers, artifactsVerified, expectedRegistryKeys, requiredGateIds: REQUIRED_TERMINAL_GATE_IDS });
  if (["BLOCKED", "FAILED"].includes(previousTerminalStatus) && status === "PASSED") status = previousTerminalStatus;
  return {
    recordKind: "manifest", schemaVersion: 1, intent: "W2-03-charge-tariffs-and-agreements", runId,
    startedAt: ledgerRecords[0]?.startedAt ?? "1970-01-01T00:00:00.000Z",
    completedAt: ledgerRecords.at(-1)?.completedAt ?? ledgerRecords.at(-1)?.detectedAt ?? "1970-01-01T00:00:00.000Z",
    status, gates, registryResults, blockers, expectedRegistryKeys, requiredGateIds: [...REQUIRED_TERMINAL_GATE_IDS], artifacts,
  };
}

export function publishManifest(runRoot, manifest, { crashPoint } = {}) {
  const latest = recoverManifestPublication(runRoot, { republish: false });
  if (["BLOCKED", "FAILED"].includes(latest?.manifest.status) && manifest.status === "PASSED") throw new Error("terminal manifest cannot be upgraded");
  validateEvidenceRecord(manifest, { artifactLoader: (relativePath) => readFileSync(path.join(runRoot, relativePath)) });
  const sequence = (latest?.sequence ?? 0) + 1;
  const bytes = Buffer.from(canonicalStringify(manifest), "utf8");
  const digest = createHash("sha256").update(bytes).digest("hex");
  if (latest?.digest === digest) { publishPointer(runRoot, bytes, undefined, true); return latest; }
  const immutable = `manifest.${sequence}.${digest}.json`;
  const immutablePath = path.join(runRoot, immutable);
  writeExclusiveSynced(immutablePath, bytes);
  if (crashPoint === "after-version") throw new Error("U06_INJECTED_CRASH:after-version");
  publishPointer(runRoot, bytes, crashPoint);
  const immutableBytes = readFileSync(immutablePath); const pointerBytes = readFileSync(path.join(runRoot, "manifest.json"));
  if (immutableBytes.length !== bytes.length || pointerBytes.length !== bytes.length
    || createHash("sha256").update(immutableBytes).digest("hex") !== digest
    || createHash("sha256").update(pointerBytes).digest("hex") !== digest) throw new Error("manifest reopen/hash/length verification failed");
  return { sequence, digest, immutable, manifest, published: true, reopenedBytes: bytes.length };
}

export function recoverManifestPublication(runRoot, { republish = true } = {}) {
  if (!existsSync(runRoot)) return null;
  const candidates = [];
  for (const name of readdirSync(runRoot)) {
    const match = VERSION.exec(name); if (!match) continue;
    const bytes = readFileSync(path.join(runRoot, name));
    if (createHash("sha256").update(bytes).digest("hex") !== match[2]) continue;
    try {
      const manifest = JSON.parse(bytes);
      validateEvidenceRecord(manifest, { artifactLoader: (relativePath) => readFileSync(path.join(runRoot, relativePath)) });
      candidates.push({ sequence: Number(match[1]), digest: match[2], immutable: name, manifest, bytes });
    } catch { /* corrupt or incomplete candidate ignored */ }
  }
  candidates.sort((a, b) => b.sequence - a.sequence);
  const latest = candidates[0] ?? null;
  if (latest && republish) publishPointer(runRoot, latest.bytes, undefined, true);
  return latest;
}

export function reconcileArtifacts(runRoot, registry, ledgerRecords) {
  const indexed = new Set(ledgerRecords.flatMap((record) => record.artifacts ?? []).map((artifact) => artifact.relativePath));
  const quarantine = [];
  for (const member of registry.members) {
    const artifactPath = path.join(runRoot, member.destination);
    if (existsSync(artifactPath) && !indexed.has(member.destination)) quarantine.push({ relativePath: member.destination, bytes: statSync(artifactPath).size, status: "QUARANTINED_UNINDEXED" });
  }
  return quarantine;
}

function publishPointer(runRoot, bytes, crashPoint, recovering = false) {
  const temp = path.join(runRoot, "manifest.json.tmp");
  if (existsSync(temp)) {
    if (!recovering) throw new Error("stale manifest publication temp requires recovery");
    unlinkSync(temp);
  }
  writeExclusiveSynced(temp, bytes);
  if (crashPoint === "after-pointer-temp") throw new Error("U06_INJECTED_CRASH:after-pointer-temp");
  renameSync(temp, path.join(runRoot, "manifest.json"));
}

function writeExclusiveSynced(filePath, bytes) {
  const fd = openSync(filePath, "wx", 0o600);
  try { writeSync(fd, bytes); fsyncSync(fd); } finally { closeSync(fd); }
}

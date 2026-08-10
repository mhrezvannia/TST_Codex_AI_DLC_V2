import { createHash } from "node:crypto";
import { lstat, mkdir, open, readFile, realpath, rename, stat, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, posix, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { REQUIRED_CASE_IDS, REQUIRED_GATES, REQUIRED_GATE_COMMANDS } from "./w2-02-coverage-ledger.mjs";
import { WAVE_A_BASE_URL, WAVE_A_COMPOSE_PROJECT, validateDirectGuardRecord } from "./w2-02-acceptance-guard.mjs";
import { validatePredecessorDigest, validateStartedAttempt, validateTerminalAttempt } from "./w2-02-attempt-lineage.mjs";
import { validateFixtureManifest } from "./w2-02-fixture-contract.mjs";
import { validateCausalObservation } from "./w2-02-ssr-control-proxy.mjs";
import { assertWorkspaceIdentity, captureWorkspaceIdentity } from "./w2-02-workspace-identity.mjs";
import { validateBrowserCaseChronology, validateBrowserPermit } from "./w2-02-browser-permit.mjs";

const FORBIDDEN = /(authorization|set-cookie|cookie|access[_-]?token|refresh[_-]?token|client[_-]?secret|password|credential|session(?:id|token)?)/i;
const HASH = /^[a-f0-9]{64}$/;
const REQUIRED_ASSERTIONS = ["semantic", "keyboard-focus", "live-region", "reduced-motion", "primary-action", "overflow", "overlap", "clipping", "theme", "axe"];
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

export function containsForbiddenEvidence(value) { return FORBIDDEN.test(typeof value === "string" ? value : JSON.stringify(value)); }
export function sanitizeEvidence(value) {
  if (Array.isArray(value)) return value.map(sanitizeEvidence);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).flatMap(([key, item]) => FORBIDDEN.test(key) ? [] : [[key, sanitizeEvidence(item)]]));
  return typeof value === "string" ? value.replace(/(?:Bearer|Basic)\s+[^\s"',]+/gi, "[REDACTED]").replace(/(?:token|secret|password)[=:]\s*[^\s"',]+/gi, "[REDACTED]") : value;
}

function lexicalPath(runRoot, declaredPath) {
  if (typeof declaredPath !== "string" || !declaredPath || isAbsolute(declaredPath) || declaredPath.includes("\\")) throw new Error("Artifact path must use canonical run-relative POSIX spelling");
  const normalized = posix.normalize(declaredPath);
  if (normalized !== declaredPath || normalized.startsWith("../") || normalized === "." || normalized.includes("/../")) throw new Error(`Artifact path is aliased or escaping: ${declaredPath}`);
  return resolve(runRoot, ...declaredPath.split("/"));
}

async function canonicalArtifact(runRoot, declaredPath) {
  const root = await realpath(resolve(runRoot)); const target = lexicalPath(root, declaredPath);
  let cursor = root;
  for (const part of declaredPath.split("/")) { cursor = resolve(cursor, part); const info = await lstat(cursor); if (info.isSymbolicLink()) throw new Error(`Artifact link/reparse alias is forbidden: ${declaredPath}`); }
  const info = await stat(target); if (!info.isFile()) throw new Error(`Artifact is not a regular file: ${declaredPath}`); if (info.nlink > 1) throw new Error(`Hard-linked artifact is forbidden: ${declaredPath}`);
  const actual = await realpath(target); const rel = relative(root, actual); if (!rel || rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) throw new Error(`Artifact canonical target escapes run root: ${declaredPath}`);
  const key = process.platform === "win32" ? actual.toLowerCase() : actual;
  return { target: actual, key };
}

export async function hashArtifact(runRoot, path, kind) {
  if (typeof kind !== "string" || !kind.trim()) throw new Error("Artifact kind is required");
  const declared = path.replaceAll("\\", "/"); const { target } = await canonicalArtifact(runRoot, declared);
  return { path: declared, kind, sha256: sha256(await readFile(target)) };
}

async function virtualArtifact(runRoot, declaredPath, bytes) {
  const root = await realpath(resolve(runRoot)); const target = lexicalPath(root, declaredPath); const rel = relative(root, target);
  if (!rel || rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) throw new Error(`Prepared artifact escapes run root: ${declaredPath}`);
  let cursor = root; const parts = declaredPath.split("/");
  for (const part of parts.slice(0, -1)) { cursor = resolve(cursor, part); const info = await lstat(cursor); if (info.isSymbolicLink()) throw new Error(`Prepared artifact parent is linked: ${declaredPath}`); }
  return { target, key: process.platform === "win32" ? target.toLowerCase() : target, bytes: Buffer.from(bytes) };
}

async function validateArtifact(runRoot, artifact, artifactOverrides = null) {
  if (!artifact || typeof artifact.kind !== "string" || !artifact.kind.trim() || !HASH.test(artifact.sha256 ?? "")) throw new Error("Artifact declaration is incomplete");
  const override = artifactOverrides instanceof Map ? artifactOverrides.get(artifact.path) : artifactOverrides?.[artifact.path];
  if (override !== undefined) {
    const prepared = await virtualArtifact(runRoot, artifact.path, override); if (sha256(prepared.bytes) !== artifact.sha256) throw new Error(`Prepared artifact hash mismatch: ${artifact.path}`); return prepared;
  }
  let canonical; try { canonical = await canonicalArtifact(runRoot, artifact.path); } catch (error) { throw new Error(`Artifact is missing, linked, or aliased: ${artifact.path}`, { cause: error }); }
  const bytes = await readFile(canonical.target); if (sha256(bytes) !== artifact.sha256) throw new Error(`Artifact hash mismatch: ${artifact.path}`);
  return { ...canonical, bytes };
}

async function validateArtifacts(runRoot, entry, seen, artifactOverrides = null) {
  if (!Array.isArray(entry.artifacts) || entry.artifacts.length === 0) throw new Error(`Evidence entry has no artifacts: ${entry.id ?? "run"}`);
  for (const artifact of entry.artifacts) { const checked = await validateArtifact(runRoot, artifact, artifactOverrides); if (seen.has(checked.key)) throw new Error(`Artifact canonical target is declared more than once: ${artifact.path}`); seen.add(checked.key); }
}

export const serializeEvidenceRecord = (value) => Buffer.from(JSON.stringify(sanitizeEvidence(value), null, 2) + "\n");

export async function prepareEvidenceManifest(manifest, options = {}) {
  const clean = sanitizeEvidence(manifest); if (containsForbiddenEvidence(clean)) throw new Error("Evidence still contains forbidden material");
  if (clean.terminalStatus !== "PREPARED" || clean.commitProtocol !== "terminal-last-v1") throw new Error("Evidence envelope is not prepared for terminal-last commit");
  await validateEvidenceManifestInternal(clean, { runRoot: options.runRoot, currentWorkspaceIdentity: options.currentWorkspaceIdentity, artifactOverrides: options.artifactOverrides });
  return { envelope: clean, bytes: serializeEvidenceRecord(clean) };
}

export async function promotePreparedEvidenceManifest(path, prepared, options = {}) {
  const bytes = Buffer.isBuffer(prepared?.bytes) ? prepared.bytes : null; if (!bytes) throw new Error("Prepared evidence bytes are required");
  await mkdir(dirname(path), { recursive: true }); const pendingPath = `${path}.pending`;
  const handle = await open(pendingPath, "wx");
  try { await handle.writeFile(bytes); await handle.sync(); } finally { await handle.close(); }
  if (options.beforePromote) await options.beforePromote({ pendingPath, path });
  await lstat(path).then(() => { throw new Error("Final evidence manifest already exists"); }, (error) => { if (error.code !== "ENOENT") throw error; });
  await (options.promote ?? rename)(pendingPath, path);
  return path;
}

export async function writeEvidenceManifest(path, manifest, options = {}) {
  const clean = sanitizeEvidence(manifest); if (containsForbiddenEvidence(clean)) throw new Error("Evidence still contains forbidden material");
  const runRoot = options.runRoot ?? dirname(resolve(path)); await validateEvidenceManifest(clean, { runRoot, currentWorkspaceIdentity: options.currentWorkspaceIdentity });
  await mkdir(dirname(path), { recursive: true }); await writeFile(path, JSON.stringify(clean, null, 2) + "\n", "utf8");
}

async function validateEvidenceManifestInternal(envelope, { runRoot, currentWorkspaceIdentity, artifactOverrides = null } = {}) {
  if (!envelope || typeof envelope !== "object" || envelope.schemaVersion !== 3 || !/^[a-zA-Z0-9._-]+$/.test(envelope.runId ?? "") || envelope.terminalStatus !== "PREPARED" || envelope.commitProtocol !== "terminal-last-v1") throw new Error("Final evidence envelope is invalid or not terminal-last prepared");
  if (!runRoot) throw new Error("Evidence validation requires exact run root");
  const seen = new Set();
  await validateArtifacts(runRoot, { id: "envelope", artifacts: [envelope.evidencePayload, envelope.terminalAttempt] }, seen, artifactOverrides);
  const payloadChecked = await validateArtifact(runRoot, envelope.evidencePayload, artifactOverrides); const terminalChecked = await validateArtifact(runRoot, envelope.terminalAttempt, artifactOverrides);
  const payload = JSON.parse(payloadChecked.bytes); const terminal = JSON.parse(terminalChecked.bytes);
  if (payload.runId !== envelope.runId || terminal.runId !== envelope.runId || envelope.reproducesRun !== terminal.reproducesRun || terminal.evidencePayloadSha256 !== envelope.evidencePayload.sha256) throw new Error("Final envelope is not hash-bound to its payload and terminal attempt");
  await validateEvidencePayload(payload, { runRoot, currentWorkspaceIdentity }); validateTerminalAttempt(terminal, payload.attempt);
  if (terminal.status !== "COMPLETED" || terminal.event !== "COMPLETED") throw new Error("Final evidence terminal attempt is not COMPLETED");
  return envelope;
}

export async function validateEvidenceManifest(envelope, { runRoot, currentWorkspaceIdentity } = {}) {
  return validateEvidenceManifestInternal(envelope, { runRoot, currentWorkspaceIdentity, artifactOverrides: null });
}

export async function validateEvidencePayload(manifest, { runRoot, currentWorkspaceIdentity } = {}) {
  if (!manifest || typeof manifest !== "object") throw new Error("Evidence payload must be an object");
  for (const key of ["schemaVersion", "runId", "workspaceIdentity", "attempt", "composeProject", "baseURL", "startedAt", "finishedAt", "cases", "gates", "runRecord", "workspaceRecord", "fixtureRecord", "setupRecord", "startedAttemptRecord", "reproductionRecord", "playwrightRecord", "playwrightDirectRecord", "browserPermitRecord", "w1LiveProof"]) if (!(key in manifest)) throw new Error(`Missing evidence payload key: ${key}`);
  if (manifest.schemaVersion !== 3 || !/^[a-zA-Z0-9._-]+$/.test(manifest.runId)) throw new Error("Evidence run identity is invalid");
  const start = Date.parse(manifest.startedAt); const finish = Date.parse(manifest.finishedAt); if (!Number.isFinite(start) || !Number.isFinite(finish) || finish < start) throw new Error("Evidence timestamps are invalid");
  if (!runRoot) throw new Error("Evidence validation requires exact run root");
  if (manifest.composeProject !== WAVE_A_COMPOSE_PROJECT || manifest.baseURL !== WAVE_A_BASE_URL) throw new Error("Evidence target is not exact isolated Wave A");
  if (manifest.w1LiveProof?.status !== "BLOCKED/WAIVED" || !manifest.w1LiveProof?.reason?.trim()) throw new Error("W1 live proof must remain BLOCKED/WAIVED, never PASS");
  validateStartedAttempt(manifest.attempt); if (manifest.attempt.runId !== manifest.runId) throw new Error("Attempt/rerun lineage is foreign");
  assertWorkspaceIdentity(manifest.workspaceIdentity, currentWorkspaceIdentity ?? manifest.workspaceIdentity);

  const seen = new Set();
  for (const artifact of [manifest.runRecord, manifest.workspaceRecord, manifest.fixtureRecord, manifest.setupRecord, manifest.startedAttemptRecord, manifest.reproductionRecord, manifest.playwrightRecord, manifest.playwrightDirectRecord, manifest.browserPermitRecord]) await validateArtifacts(runRoot, { artifacts: [artifact] }, seen);
  const workspaceRecord = JSON.parse((await validateArtifact(runRoot, manifest.workspaceRecord)).bytes); assertWorkspaceIdentity(manifest.workspaceIdentity, workspaceRecord);
  const fixture = JSON.parse((await validateArtifact(runRoot, manifest.fixtureRecord)).bytes); validateFixtureManifest(fixture);
  const setup = JSON.parse((await validateArtifact(runRoot, manifest.setupRecord)).bytes); if (setup.runId !== manifest.runId || setup.workspaceDigest !== manifest.workspaceIdentity.workspaceDigest || JSON.stringify(setup.fixtures) !== JSON.stringify(fixture)) throw new Error("Fixture producer/consumer record is foreign or divergent");
  const startedRecord = JSON.parse((await validateArtifact(runRoot, manifest.startedAttemptRecord)).bytes); if (JSON.stringify(startedRecord) !== JSON.stringify(manifest.attempt)) throw new Error("Immutable attempt start record diverges from the evidence payload");
  if (manifest.attempt.rerunOf) {
    const priorRoot = resolve(runRoot, "..", manifest.attempt.rerunOf); const priorTerminalBytes = await readFile(resolve(priorRoot, "attempt", "terminal.json")); const priorStarted = JSON.parse(await readFile(resolve(priorRoot, "attempt", "started.json"), "utf8")); const priorTerminal = validateTerminalAttempt(JSON.parse(priorTerminalBytes), priorStarted);
    validatePredecessorDigest(manifest.attempt, priorTerminalBytes); if (priorTerminal.status !== manifest.attempt.predecessor.status || priorTerminal.sequence !== manifest.attempt.predecessor.sequence) throw new Error("Rerun predecessor digest/status is not preserved");
  }
  const reproduction = JSON.parse((await validateArtifact(runRoot, manifest.reproductionRecord)).bytes); if (!reproduction.node || !reproduction.npm || !reproduction.yarn || !reproduction.compose || JSON.stringify(reproduction.profiles) !== JSON.stringify(["app", "w2-02-acceptance"]) || !Number.isInteger(reproduction.localIdentityCount) || reproduction.localIdentityCount < 1 || !HASH.test(reproduction.localIdentityConfigurationDigest ?? "")) throw new Error("Reproduction/tool/local-identity record is incomplete");
  const runRecord = JSON.parse((await validateArtifact(runRoot, manifest.runRecord)).bytes); if (runRecord.runId !== manifest.runId || runRecord.status !== "READY_FOR_PROMOTION" || runRecord.startedAt !== manifest.startedAt || runRecord.finishedAt !== manifest.finishedAt || runRecord.lifecycle?.cleaned !== true || runRecord.lifecycle?.ownership !== "THIS_ATTEMPT" || runRecord.lifecycle?.preExistingResources !== 0 || runRecord.lifecycle?.wrapper !== "scripts/wave-a-compose.mjs" || JSON.stringify(runRecord.attempt) !== JSON.stringify(manifest.attempt)) throw new Error("Run/lifecycle ownership record is incomplete or foreign");
  const browser = JSON.parse((await validateArtifact(runRoot, manifest.playwrightRecord)).bytes); if (!browser.suites || browser.errors?.length) throw new Error("Playwright report is missing or has run errors");
  const browserDirect = JSON.parse((await validateArtifact(runRoot, manifest.playwrightDirectRecord)).bytes); if (browserDirect.runId !== manifest.runId || browserDirect.workspaceDigest !== manifest.workspaceIdentity.workspaceDigest || browserDirect.result !== "PASS" || browserDirect.exitCode !== 0 || browserDirect.directExit !== true) throw new Error("Playwright direct record is foreign or non-green");
  const browserPermit = JSON.parse((await validateArtifact(runRoot, manifest.browserPermitRecord)).bytes);

  const cases = new Map(manifest.cases.map((entry) => [entry.id, entry])); if (cases.size !== REQUIRED_CASE_IDS.length || manifest.cases.length !== REQUIRED_CASE_IDS.length) throw new Error("Evidence case ledger has omissions or duplicates");
  for (const id of REQUIRED_CASE_IDS) {
    const entry = cases.get(id); if (!entry || entry.result !== "PASS" || entry.runId !== manifest.runId || JSON.stringify(entry.browserPermit) !== JSON.stringify(browserPermit)) throw new Error(`Case missing/foreign/non-green or not permit-bound: ${id}`); await validateArtifacts(runRoot, entry, seen);
    const [kind, discriminator, theme, width] = id.split(":");
    if ((kind === "state" || kind === "visual") && (REQUIRED_ASSERTIONS.some((name) => entry.assertions?.[name] !== "PASS") || entry[kind === "state" ? "state" : "route"] !== discriminator || entry.theme !== theme || entry.width !== Number(width))) throw new Error(`UI identity/assertion omitted or aliased: ${id}`);
    if (entry.control?.verified !== true || entry.control?.causal !== true || entry.control?.kind !== "ssr-proxy" || entry.control.appliedCount < 1) throw new Error(`Causal SSR control missing: ${id}`);
    validateCausalObservation(id, entry.control);
  }
  const mutation = cases.get("keyboard:create-to-confirm"); if (mutation?.mutation !== true || mutation?.skipped) throw new Error("Mutation proof is missing/skipped");
  const trace = mutation.artifacts.find(({ kind }) => kind === "sanitized-trace"); const reportArtifact = mutation.artifacts.find(({ kind }) => kind === "trace-sanitizer-report"); if (!trace || !reportArtifact) throw new Error("Sanitized trace/report missing");
  const report = JSON.parse((await validateArtifact(runRoot, reportArtifact)).bytes); if (report.closureStatus !== "PASS" || report.secondScan !== "PASS" || !String(report.traceOpenValidation).startsWith("PASS:") || report.localIdentityScan !== "PASS" || !Number.isInteger(report.localIdentityCount) || report.localIdentityCount < 1 || report.localIdentityCount !== reproduction.localIdentityCount || report.localIdentityConfigurationDigest !== reproduction.localIdentityConfigurationDigest || report.rawInputRemoved !== true || report.promotedHash !== trace.sha256) throw new Error("Trace sanitizer/local-identity closure is incomplete");

  const gates = new Map(manifest.gates.map((entry) => [entry.id, entry])); if (gates.size !== REQUIRED_GATES.length || manifest.gates.length !== REQUIRED_GATES.length || JSON.stringify(manifest.gates.map(({ id }) => id)) !== JSON.stringify(REQUIRED_GATES)) throw new Error("Gate ledger has omissions, duplicates, or chronology drift");
  const gateRecords = {};
  for (const id of REQUIRED_GATES) {
    const entry = gates.get(id); if (!entry || entry.runId !== manifest.runId || entry.workspaceDigest !== manifest.workspaceIdentity.workspaceDigest || entry.command !== REQUIRED_GATE_COMMANDS[id] || entry.result !== "PASS" || entry.exitCode !== 0 || entry.directExit !== true) throw new Error(`Gate missing/foreign/non-green: ${id}`); await validateArtifacts(runRoot, entry, seen);
    const record = JSON.parse((await validateArtifact(runRoot, entry.artifacts[0])).bytes); if (record.runId !== manifest.runId || record.command !== REQUIRED_GATE_COMMANDS[id] || record.result !== "PASS" || record.exitCode !== 0 || record.directExit !== true) throw new Error(`Gate artifact is not direct PASS: ${id}`);
    gateRecords[id] = record;
    if (id === "demo-guard-pre-lifecycle") validateDirectGuardRecord(record, { runId: manifest.runId, workspaceDigest: manifest.workspaceIdentity.workspaceDigest, producer: "acceptance-parent", phase: "pre-lifecycle", requireFresh: false });
    if (id === "demo-guard-pre-browser") validateDirectGuardRecord(record, { runId: manifest.runId, workspaceDigest: manifest.workspaceIdentity.workspaceDigest, producer: "playwright-global-setup", phase: "pre-browser", requireFresh: false });
    if (id === "wave-a-ownership" && (record.preExistingResources !== 0 || record.cleanupArmed !== false || record.ownership !== "UNCLAIMED" || record.wrapperOnly !== true)) throw new Error("Wave A pre-start ownership proof is unsafe");
    if (id === "wave-a-config" && (record.composeProject !== WAVE_A_COMPOSE_PROJECT || record.edgeURL !== WAVE_A_BASE_URL || JSON.stringify(record.profiles) !== JSON.stringify(["app", "w2-02-acceptance"]) || !record.services?.includes("w2-02-ssr-control"))) throw new Error("Wave A config proof is incomplete");
    if (["wave-a-up", "wave-a-cleanup"].includes(id) && record.wrapperOnly !== true) throw new Error(`Lifecycle bypassed wrapper: ${id}`);
    if (id === "wave-a-status" && !record.services?.some(({ Service, State }) => Service === "w2-02-ssr-control" && State === "running")) throw new Error("Wave A status lacks running SSR control proxy");
    if (id === "wave-a-readiness" && !record.observations?.some(({ url, status }) => url === WAVE_A_BASE_URL && status === 200)) throw new Error("Wave A edge readiness is unproven");
  }
  const chronology = ["demo-guard-pre-lifecycle", "wave-a-ownership", "wave-a-config", "wave-a-up", "wave-a-status", "wave-a-readiness", "demo-guard-pre-browser"];
  for (let index = 1; index < chronology.length; index += 1) if (Date.parse(gateRecords[chronology[index]].startedAt) < Date.parse(gateRecords[chronology[index - 1]].finishedAt)) throw new Error(`Gate chronology is invalid before ${chronology[index]}`);
  validateBrowserPermit(browserPermit, gateRecords["demo-guard-pre-browser"], { runId: manifest.runId, workspaceDigest: manifest.workspaceIdentity.workspaceDigest });
  validateBrowserCaseChronology({ browserDirect, preBrowserGuard: gateRecords["demo-guard-pre-browser"], browserPermit, cases: manifest.cases, cleanup: gateRecords["wave-a-cleanup"], postGuard: gateRecords["demo-guard-post"] });
  return manifest;
}

async function main() { const path = resolve(process.argv[2] ?? "artifacts/w2-02-live/manifest.json"); const manifest = JSON.parse(await readFile(path, "utf8")); if (containsForbiddenEvidence(manifest)) throw new Error(`Forbidden evidence content in ${path}`); await validateEvidenceManifest(manifest, { runRoot: dirname(path), currentWorkspaceIdentity: await captureWorkspaceIdentity(resolve(dirname(path), "..", "..", "..", "..")) }); console.log(`W2-02 evidence manifest: PASS (${path})`); }
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) await main();

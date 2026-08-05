import { createHash, randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { appendFile, mkdir, open, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createStartedAttempt, createTerminalAttempt, persistStartedAttempt, persistTerminalAttempt, sha256Bytes, sha256Record, validateIndexRecovery, validateStartedAttempt, validateTerminalAttempt } from "./w2-02-attempt-lineage.mjs";
import { PROTECTED_DEMO, WAVE_A_BASE_URL, WAVE_A_COMPOSE_PROJECT, validateDirectGuardRecord, validateWaveAEnvironment } from "./w2-02-acceptance-guard.mjs";
import { REQUIRED_CASE_IDS, REQUIRED_GATE_COMMANDS } from "./w2-02-coverage-ledger.mjs";
import { writeProductionFixture } from "./w2-02-fixture-contract.mjs";
import { hashArtifact, prepareEvidenceManifest, promotePreparedEvidenceManifest, sanitizeEvidence, serializeEvidenceRecord } from "./w2-02-evidence.mjs";
import { deriveLocalIdentityConfiguration } from "./w2-02-local-identities.mjs";
import { assertWorkspaceIdentity, captureWorkspaceIdentity } from "./w2-02-workspace-identity.mjs";
import { validateBrowserCaseChronology, validateBrowserPermit } from "./w2-02-browser-permit.mjs";
import { executeTerminalLastTransaction } from "./w2-02-completion-transaction.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const overrideFile = "infrastructure/compose/w2-02-acceptance.compose.yaml";
export const WAVE_A_COMPOSE_GLOBAL_ARGS = Object.freeze(["--parallel", "1"]);
export const WINDOWS_AUDIT_IMAGE = "linercore/w2-02-audit-tools:1";
const wrapperPrefix = ["scripts/wave-a-compose.mjs", ...WAVE_A_COMPOSE_GLOBAL_ARGS, "-f", "compose.yaml", "-f", overrideFile];
const hash = (value) => createHash("sha256").update(value).digest("hex");
const iso = () => new Date().toISOString();
const executable = (name) => process.platform === "win32" ? `${name}.cmd` : name;

function parseArgs(argv) {
  const value = {};
  for (let index = 0; index < argv.length; index += 2) {
    if (!["--storage-state", "--rerun-of"].includes(argv[index]) || !argv[index + 1]) throw new Error("Usage: node scripts/w2-02-live-acceptance.mjs --storage-state <state.json> [--rerun-of <run-id>]");
    value[argv[index].slice(2)] = argv[index + 1];
  }
  if (!value["storage-state"]) throw new Error("--storage-state is required");
  return value;
}

async function writeJson(path, value) { await mkdir(dirname(path), { recursive: true }); await writeFile(path, JSON.stringify(sanitizeEvidence(value), null, 2) + "\n", "utf8"); }
async function writeJsonImmutable(path, value) {
  await mkdir(dirname(path), { recursive: true });
  const handle = await open(path, "wx");
  try { await handle.writeFile(JSON.stringify(sanitizeEvidence(value), null, 2) + "\n", "utf8"); await handle.sync(); }
  finally { await handle.close(); }
}
export function direct(command, args, env) {
  const isWindowsShim = process.platform === "win32" && /\.(?:cmd|bat)$/i.test(command);
  const invokedCommand = isWindowsShim ? (env.ComSpec || process.env.ComSpec || "cmd.exe") : command;
  const invokedArgs = isWindowsShim ? ["/d", "/s", "/c", command, ...args] : args;
  const startedAt = iso(); const result = spawnSync(invokedCommand, invokedArgs, { cwd: root, env, encoding: "utf8", windowsHide: true, maxBuffer: 50 * 1024 * 1024 }); const finishedAt = iso();
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  return { startedAt, finishedAt, exitCode: result.status ?? 1, directExit: true, result: result.status === 0 && !result.error ? "PASS" : "FAIL", outputHash: hash(output), outputBytes: Buffer.byteLength(output), _stdout: result.stdout ?? "" };
}
export function auditInvocation(detector, platform = process.platform, workspaceRoot = root) {
  if (platform !== "win32") return { command: "bash", args: [detector], executable: `bash ${detector}` };
  return {
    command: "docker",
    args: ["run", "--rm", "--mount", `type=bind,source=${workspaceRoot},target=/workspace,readonly`, "--workdir", "/workspace", "--entrypoint", "/bin/bash", WINDOWS_AUDIT_IMAGE, detector],
    executable: `docker run --rm --mount <workspace>:/workspace:ro --workdir /workspace --entrypoint /bin/bash ${WINDOWS_AUDIT_IMAGE} ${detector}`
  };
}
const publicRecord = (value) => Object.fromEntries(Object.entries(value).filter(([key]) => !key.startsWith("_")));
const wrapperCommand = (args, env) => direct(process.execPath, [...wrapperPrefix, ...args], env);

export function parseComposeRows(source) {
  const text = String(source ?? "").trim(); if (!text) return [];
  try { const value = JSON.parse(text); return Array.isArray(value) ? value : [value]; }
  catch { return text.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line)); }
}

export function validateNoPreExistingWaveAStatus(value) {
  const rows = Array.isArray(value) ? value : parseComposeRows(value);
  if (rows.length !== 0) throw new Error("A pre-existing linercore-wave-a stack is not owned by this attempt");
  return rows;
}

export function cleanupIsAuthorized({ upInvocationOwned, cleaned }) { return upInvocationOwned === true && cleaned !== true; }

export function validateWaveAComposeConfig(config) {
  if (config?.name !== WAVE_A_COMPOSE_PROJECT) throw new Error("Effective Compose config is not linercore-wave-a");
  for (const service of ["nginx", "apps-shell", "apps-booking", "w2-02-ssr-control"]) if (!config.services?.[service]) throw new Error(`Effective Compose config is missing ${service}`);
  if (config.services["apps-shell"].environment?.BOOKING_APP_URL !== "http://w2-02-ssr-control:43102") throw new Error("apps-shell is not causally wired through the SSR control proxy");
  if (!(config.services.nginx.ports ?? []).some((port) => String(port.published) === "18088" && String(port.target) === "80")) throw new Error("Effective Wave A edge is not exclusively published on 18088");
  if (!(config.services["w2-02-ssr-control"].ports ?? []).some((port) => String(port.published) === "14312" && String(port.target) === "43102" && (!port.host_ip || port.host_ip === "127.0.0.1"))) throw new Error("SSR control proxy is not loopback-bound on the required port");
  return config;
}

export function validateWaveAStatus(value) {
  const rows = Array.isArray(value) ? value : [value];
  for (const service of ["nginx", "apps-shell", "apps-booking", "w2-02-ssr-control"]) {
    const row = rows.find((item) => item.Service === service);
    if (!row || row.State !== "running" || row.Health === "unhealthy") throw new Error(`Wave A service is not ready: ${service}`);
  }
  return rows;
}

export function validateLifecycleOrdering(records, browserDirect, browserPermit, cases) {
  const ordered = ["demo-guard-pre-lifecycle", "wave-a-ownership", "wave-a-config", "wave-a-up", "wave-a-status", "wave-a-readiness", "pricing-fixture", "demo-guard-pre-browser"];
  for (let index = 1; index < ordered.length; index += 1) {
    if (Date.parse(records[ordered[index]].startedAt) < Date.parse(records[ordered[index - 1]].finishedAt)) throw new Error(`Lifecycle chronology is invalid before ${ordered[index]}`);
  }
  validateBrowserPermit(browserPermit, records["demo-guard-pre-browser"], { runId: browserPermit?.runId, workspaceDigest: browserPermit?.workspaceDigest });
  return validateBrowserCaseChronology({ browserDirect, preBrowserGuard: records["demo-guard-pre-browser"], browserPermit, cases, cleanup: records["wave-a-cleanup"], postGuard: records["demo-guard-post"] });
}

export function collectPlaywrightCaseResults(report) {
  const statuses = new Map();
  const visit = (suite) => { for (const spec of suite.specs ?? []) { const id = REQUIRED_CASE_IDS.find((candidate) => spec.title === candidate || spec.title.startsWith(`${candidate} `)); if (!id) continue; const runs = (spec.tests ?? []).flatMap((item) => item.results ?? []); const pass = runs.length > 0 && runs.every(({ status }) => status === "passed"); statuses.set(id, statuses.has(id) ? false : pass); } for (const child of suite.suites ?? []) visit(child); };
  for (const suite of report.suites ?? []) visit(suite); return statuses;
}

async function withAttemptLock(liveRoot, action) {
  const lockPath = join(liveRoot, ".attempt-allocation-lock"); await mkdir(dirname(lockPath), { recursive: true });
  let acquired = false;
  for (let count = 0; count < 200 && !acquired; count += 1) {
    try { await mkdir(lockPath); acquired = true; } catch (error) { if (error.code !== "EEXIST") throw error; await new Promise((resolveWait) => setTimeout(resolveWait, 25)); }
  }
  if (!acquired) throw new Error("Could not serialize W2-02 attempt allocation");
  try { return await action(); } finally { await rm(lockPath, { recursive: true, force: true }); }
}

const readOptional = async (path) => readFile(path).catch((error) => { if (error.code === "ENOENT") return null; throw error; });

async function readLocalAttempts(liveRoot) {
  const runsRoot = join(liveRoot, "runs");
  const entries = await readdir(runsRoot, { withFileTypes: true }).catch((error) => { if (error.code === "ENOENT") return []; throw error; });
  const attempts = [];
  for (const entry of entries.filter((item) => item.isDirectory()).sort((left, right) => left.name.localeCompare(right.name))) {
    const attemptRoot = join(runsRoot, entry.name, "attempt");
    const [startedBytes, terminalBytes, recoveryBytes] = await Promise.all([readOptional(join(attemptRoot, "started.json")), readOptional(join(attemptRoot, "terminal.json")), readOptional(join(attemptRoot, "index-recovery.json"))]);
    if (!startedBytes) {
      if (terminalBytes || recoveryBytes) throw new Error(`Attempt ${entry.name} has terminal lineage without STARTED`);
      continue;
    }
    const started = validateStartedAttempt(JSON.parse(startedBytes));
    if (started.runId !== entry.name) throw new Error(`Attempt directory identity diverged: ${entry.name}`);
    const terminal = terminalBytes ? validateTerminalAttempt(JSON.parse(terminalBytes), started) : null;
    const recovery = recoveryBytes ? validateIndexRecovery(JSON.parse(recoveryBytes), started, terminal) : null;
    attempts.push({ started, terminal, recovery, terminalArtifactSha256: terminalBytes ? sha256Bytes(terminalBytes) : null });
  }
  return attempts;
}

export function reconcileAttemptHistory(sharedEvents, localAttempts) {
  const byRun = new Map(); const sequenceOwner = new Map();
  const registerStarted = (started, source) => {
    validateStartedAttempt(started); const digest = sha256Record(started); const sequenceRun = sequenceOwner.get(started.sequence);
    if (sequenceRun && sequenceRun !== started.runId) throw new Error(`Conflicting duplicate attempt sequence ${started.sequence}`);
    sequenceOwner.set(started.sequence, started.runId);
    const prior = byRun.get(started.runId);
    if (prior && (prior.startedDigest !== digest || prior.started.sequence !== started.sequence)) throw new Error(`Conflicting STARTED digest for ${started.runId}`);
    if (!prior) byRun.set(started.runId, { started, startedDigest: digest, startedSources: [source], terminal: null, terminalDigest: null, terminalArtifactSha256: null, recovery: null });
    else prior.startedSources.push(source);
  };
  for (const event of sharedEvents.filter((item) => item.event === "STARTED")) registerStarted(event, "shared");
  for (const local of localAttempts) registerStarted(local.started, "local");
  const registerTerminal = (terminal, source, artifactSha256 = null) => {
    const prior = byRun.get(terminal.runId); if (!prior) throw new Error(`Terminal attempt has no STARTED record: ${terminal.runId}`);
    validateTerminalAttempt(terminal, prior.started); const digest = sha256Record(terminal);
    if (prior.terminalDigest && prior.terminalDigest !== digest) throw new Error(`Conflicting terminal digest for ${terminal.runId}`);
    prior.terminal = terminal; prior.terminalDigest = digest;
    if (artifactSha256) {
      if (prior.terminalArtifactSha256 && prior.terminalArtifactSha256 !== artifactSha256) throw new Error(`Conflicting terminal artifact digest for ${terminal.runId}`);
      prior.terminalArtifactSha256 = artifactSha256;
    }
    prior.terminalSources = [...(prior.terminalSources ?? []), source];
  };
  for (const event of sharedEvents.filter((item) => item.event !== "STARTED")) {
    if (!['COMPLETED', 'FAILED'].includes(event.event)) throw new Error(`Unsupported shared attempt event: ${event.event}`);
    registerTerminal(event, "shared");
  }
  for (const local of localAttempts) {
    if (local.terminal) registerTerminal(local.terminal, "local", local.terminalArtifactSha256);
    if (local.recovery) { validateIndexRecovery(local.recovery, local.started, local.terminal); byRun.get(local.started.runId).recovery = local.recovery; }
  }
  const attempts = [...byRun.values()].sort((left, right) => left.started.sequence - right.started.sequence);
  const terminalAttempts = attempts.filter((item) => item.terminal);
  for (const item of terminalAttempts) if (!item.terminalArtifactSha256) throw new Error(`Terminal attempt lacks its immutable run-local artifact: ${item.started.runId}`);
  return { attempts, terminalAttempts, maxSequence: attempts.reduce((maximum, item) => Math.max(maximum, item.started.sequence), 0), latestTerminal: terminalAttempts.at(-1) ?? null };
}

export async function allocateAttempt({ runId, runRoot, requestedRerun, startedAt, liveRoot = join(root, "artifacts", "w2-02-live"), appendEvent }) {
  return withAttemptLock(liveRoot, async () => {
    const logPath = join(liveRoot, "attempts.jsonl");
    const sharedEvents = await readFile(logPath, "utf8").then((text) => text.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line)), (error) => { if (error.code === "ENOENT") return []; throw error; });
    const history = reconcileAttemptHistory(sharedEvents, await readLocalAttempts(liveRoot));
    if (history.attempts.some((item) => item.started.runId === runId)) throw new Error(`Attempt run already exists: ${runId}`);
    const predecessorAttempt = requestedRerun ? history.terminalAttempts.find((item) => item.started.runId === requestedRerun) : history.latestTerminal;
    if (requestedRerun && !predecessorAttempt) throw new Error(`Requested rerun has no preserved terminal attempt: ${requestedRerun}`);
    const rerunOf = predecessorAttempt?.started.runId ?? null;
    const predecessor = predecessorAttempt ? { runId: rerunOf, sequence: predecessorAttempt.terminal.sequence, status: predecessorAttempt.terminal.status, terminalSha256: predecessorAttempt.terminalArtifactSha256 } : null;
    const sequence = history.maxSequence + 1;
    const started = createStartedAttempt({ sequence, runId, rerunOf, startedAt, predecessor }); const startedPath = join(runRoot, "attempt", "started.json");
    const append = appendEvent ?? ((event) => appendFile(logPath, JSON.stringify(event) + "\n", "utf8"));
    const persisted = await persistStartedAttempt({ startedAttempt: started, startedPath, terminalPath: join(runRoot, "attempt", "terminal.json"), recoveryPath: join(runRoot, "attempt", "index-recovery.json"), writeRecord: writeJsonImmutable, writeRecoveryRecord: writeJsonImmutable, appendEvent: append });
    return { ...persisted, startedPath, logPath };
  });
}

async function terminalizeAttempt({ attempt, runRoot, logPath, status, finishedAt = iso(), evidencePayloadSha256, diagnosticHash, terminalAttempt = null, terminalAlreadyPersisted = false }) {
  return withAttemptLock(join(root, "artifacts", "w2-02-live"), () => persistTerminalAttempt({ startedAttempt: attempt, terminalPath: join(runRoot, "attempt", "terminal.json"), recoveryPath: join(runRoot, "attempt", "index-recovery.json"), writeRecord: writeJsonImmutable, writeRecoveryRecord: writeJsonImmutable, appendEvent: (event) => appendFile(logPath, JSON.stringify(event) + "\n", "utf8"), finishedAt, status, evidencePayloadSha256, diagnosticHash, terminalAttempt, terminalAlreadyPersisted }));
}

export async function createRunRoot(liveRoot, runId) {
  const runsRoot = join(liveRoot, "runs");
  await mkdir(runsRoot, { recursive: true });
  const runRoot = join(runsRoot, runId);
  await mkdir(runRoot, { recursive: false });
  return runRoot;
}

async function main() {
  const cli = parseArgs(process.argv.slice(2)); validateWaveAEnvironment({ W2_02_BASE_URL: WAVE_A_BASE_URL, W2_02_COMPOSE_PROJECT: WAVE_A_COMPOSE_PROJECT });
  const workspaceIdentity = await captureWorkspaceIdentity(root); const startedAt = iso(); const runId = `${startedAt.replace(/[-:.TZ]/g, "").slice(0, 14)}-${workspaceIdentity.workspaceDigest.slice(0, 12)}-${randomBytes(4).toString("hex")}`;
  const storageStatePath = resolve(root, cli["storage-state"]); const identityConfiguration = deriveLocalIdentityConfiguration(process.env, { workspaceRoot: root, runId, workspaceDigest: workspaceIdentity.workspaceDigest, storageStatePath });
  const liveRoot = join(root, "artifacts", "w2-02-live"); const runRoot = await createRunRoot(liveRoot, runId); const stagingRoot = join(root, ".w2-02-traces", "staged", runId);
  const allocation = await allocateAttempt({ runId, runRoot, requestedRerun: cli["rerun-of"], startedAt });
  if (allocation.error) throw allocation.error;
  const { started: attempt, startedPath, logPath } = allocation;
  const identityPath = join(runRoot, "source", "workspace-identity.json"); const fixturePath = join(runRoot, "setup", "fixture-manifest.json"); const setupPath = join(runRoot, "setup", "control-record.json"); let fixture;
  try { await writeJson(identityPath, workspaceIdentity); fixture = await writeProductionFixture(fixturePath); await writeJson(setupPath, { schemaVersion: 3, runId, workspaceDigest: workspaceIdentity.workspaceDigest, fixtures: fixture }); }
  catch (error) { await terminalizeAttempt({ attempt, runRoot, logPath, status: "FAILED", diagnosticHash: hash(error instanceof Error ? error.message : String(error)) }); throw error; }
  const proxyToken = randomBytes(32).toString("hex");
  const env = { ...process.env, W2_02_BASE_URL: WAVE_A_BASE_URL, W2_02_COMPOSE_PROJECT: WAVE_A_COMPOSE_PROJECT, W2_02_RUN_ID: runId, W2_02_RUN_ROOT: runRoot, W2_02_FIXTURE_MANIFEST: fixturePath, W2_02_STORAGE_STATE: storageStatePath, W2_02_WORKSPACE_IDENTITY_FILE: identityPath, W2_02_CONTROL_URL: fixture.controlURL, W2_02_PROXY_CONTROL_TOKEN: proxyToken, W2_02_LOCAL_IDENTITIES_JSON: JSON.stringify(identityConfiguration.identities), WAVE_A_COMPOSE_PROFILES: "app,w2-02-acceptance" };
  const guardEnv = { ...env, DEMO_COMPOSE_PROJECT: PROTECTED_DEMO.composeProject, DEMO_IMAGE_TAG: PROTECTED_DEMO.imageTag, DEMO_EDGE_URL: PROTECTED_DEMO.edgeURL };
  const lifecycleLockPath = join(root, "artifacts", "w2-02-live", ".wave-a-lifecycle-lock");
  const gates = []; const gateRecords = {}; let lifecycleLockAcquired = false; let cleanupOwned = false; let cleaned = false; let lifecycleMutationAttempted = false; let terminalError = null; let prepareCompletion = null;
  const recordGate = async (id, result, extra = {}, fileName = `${id}.json`) => { const path = join(runRoot, "gates", fileName); const record = { schemaVersion: 3, runId, workspaceDigest: workspaceIdentity.workspaceDigest, command: REQUIRED_GATE_COMMANDS[id], ...publicRecord(result), ...extra }; await writeJson(path, record); if (!gates.some((item) => item.id === id)) { gates.push({ id, path, record }); gateRecords[id] = record; } return record; };
  try {
    const preLifecycleRun = direct(executable("npm"), ["run", "demo:guard"], guardEnv);
    const preLifecycle = await recordGate("demo-guard-pre-lifecycle", preLifecycleRun, { producer: "acceptance-parent", phase: "pre-lifecycle", waveTarget: { baseURL: WAVE_A_BASE_URL, composeProject: WAVE_A_COMPOSE_PROJECT }, protectedDemoInputs: PROTECTED_DEMO });
    validateDirectGuardRecord(preLifecycle, { runId, workspaceDigest: workspaceIdentity.workspaceDigest, producer: "acceptance-parent", phase: "pre-lifecycle" });

    try { await mkdir(lifecycleLockPath); lifecycleLockAcquired = true; await writeJson(join(lifecycleLockPath, "owner.json"), { schemaVersion: 3, runId, acquiredAt: iso() }); }
    catch (error) { if (error.code === "EEXIST") throw new Error("Another W2-02 attempt owns the Wave A lifecycle lock"); throw error; }

    const ownershipRun = wrapperCommand(["ps", "--all", "--format", "json"], env); if (ownershipRun.result !== "PASS") throw new Error("Wave A ownership status command failed"); const preExisting = validateNoPreExistingWaveAStatus(parseComposeRows(ownershipRun._stdout));
    await recordGate("wave-a-ownership", ownershipRun, { preExistingResources: preExisting.length, ownership: "UNCLAIMED", cleanupArmed: false, wrapperOnly: true });

    const configRun = wrapperCommand(["config", "--format", "json"], env); if (configRun.result !== "PASS") throw new Error("Wave A config command failed");
    const config = validateWaveAComposeConfig(JSON.parse(configRun._stdout)); await recordGate("wave-a-config", configRun, { composeProject: WAVE_A_COMPOSE_PROJECT, profiles: ["app", "w2-02-acceptance"], services: Object.keys(config.services).sort(), edgeURL: WAVE_A_BASE_URL });

    cleanupOwned = true; lifecycleMutationAttempted = true;
    const up = wrapperCommand(["acceptance-up", "--wait-timeout", "360"], env); await recordGate("wave-a-up", up, {
      wrapperOnly: true,
      ownership: "THIS_ATTEMPT",
      imageMode: env.WAVE_A_ACCEPTANCE_USE_PREBUILT === "1" ? "PREBUILT" : "BUILD"
    });
    if (up.result !== "PASS") {
      const failureStatus = wrapperCommand(["ps", "--all", "--format", "json"], env);
      await recordGate("wave-a-up-failure-status", failureStatus, { wrapperOnly: true, ownership: "THIS_ATTEMPT", services: failureStatus.result === "PASS" ? parseComposeRows(failureStatus._stdout) : [] });
      throw new Error("Wave A start failed");
    }
    const statusRun = wrapperCommand(["ps", "--format", "json"], env); if (statusRun.result !== "PASS") throw new Error("Wave A status failed"); const status = validateWaveAStatus(parseComposeRows(statusRun._stdout)); await recordGate("wave-a-status", statusRun, { services: status.map(({ Service, State, Health }) => ({ Service, State, Health })) });
    const readyStarted = iso(); const [edge, control] = await Promise.all([fetch(`${WAVE_A_BASE_URL}/health`), fetch(`${fixture.controlURL}/__w2-02/health`)]); const readyFinished = iso();
    const readiness = { startedAt: readyStarted, finishedAt: readyFinished, directExit: true, exitCode: edge.status === 200 && control.status === 200 ? 0 : 1, result: edge.status === 200 && control.status === 200 ? "PASS" : "FAIL", outputHash: hash(`${edge.status}:${control.status}`), outputBytes: 0 };
    await recordGate("wave-a-readiness", readiness, { observations: [{ url: WAVE_A_BASE_URL, status: edge.status }, { url: fixture.controlURL, status: control.status }] }); if (readiness.result !== "PASS") throw new Error("Wave A readiness failed");

    const pricing = direct(process.execPath, ["scripts/w2-02-pricing-fixture.mjs", "--json"], env);
    const pricingFixture = pricing.result === "PASS" ? JSON.parse(pricing._stdout) : null;
    await recordGate("pricing-fixture", pricing, { fixture: pricingFixture });
    if (pricing.result !== "PASS") throw new Error("W2-02 pricing fixture failed");

    const browser = direct(executable("corepack"), ["yarn", "playwright", "test", "--config", "playwright.config.ts"], env); const browserDirectPath = join(runRoot, "results", "playwright-direct.json"); await writeJson(browserDirectPath, { schemaVersion: 3, runId, workspaceDigest: workspaceIdentity.workspaceDigest, command: "corepack yarn playwright test --config playwright.config.ts", ...publicRecord(browser) });
    if (browser.result !== "PASS") throw new Error("Playwright acceptance failed");
    const preBrowserPath = join(runRoot, "gates", "demo-guard-pre-browser.json"); const preBrowser = validateDirectGuardRecord(JSON.parse(await readFile(preBrowserPath, "utf8")), { runId, workspaceDigest: workspaceIdentity.workspaceDigest, producer: "playwright-global-setup", phase: "pre-browser", requireFresh: false }); gates.push({ id: "demo-guard-pre-browser", path: preBrowserPath, record: preBrowser }); gateRecords["demo-guard-pre-browser"] = preBrowser;
    const browserPermitPath = join(runRoot, "gates", "browser-authorized.json"); const browserPermit = validateBrowserPermit(JSON.parse(await readFile(browserPermitPath, "utf8")), preBrowser, { runId, workspaceDigest: workspaceIdentity.workspaceDigest });

    const cleanup = wrapperCommand(["down", "--volumes", "--remove-orphans"], env); await recordGate("wave-a-cleanup", cleanup, { wrapperOnly: true, ownership: "THIS_ATTEMPT" }); cleaned = cleanup.result === "PASS"; if (!cleaned) throw new Error("Wave A cleanup failed"); cleanupOwned = false;
    const post = direct(executable("npm"), ["run", "demo:guard"], guardEnv); await recordGate("demo-guard-post", post, { producer: "acceptance-parent", phase: "post", waveTarget: { baseURL: WAVE_A_BASE_URL, composeProject: WAVE_A_COMPOSE_PROJECT }, protectedDemoInputs: PROTECTED_DEMO }); if (post.result !== "PASS") throw new Error("Post-acceptance manager guard failed");
    for (const [id, detector] of [["aidlc-audit", ".claude/skills/aidlc-audit/detectors.sh"], ["erp-fidelity-audit", ".claude/skills/erp-fidelity-audit/detectors.sh"]]) { const invocation = auditInvocation(detector); const audit = direct(invocation.command, invocation.args, env); await recordGate(id, audit, { executable: invocation.executable }); if (audit.result !== "PASS") throw new Error(`${id} failed`); }

    assertWorkspaceIdentity(workspaceIdentity, await captureWorkspaceIdentity(root));
    const browserReportPath = join(runRoot, "results", "playwright.json"); const browserReport = JSON.parse(await readFile(browserReportPath, "utf8")); const statuses = collectPlaywrightCaseResults(browserReport); const cases = [];
    for (const id of REQUIRED_CASE_IDS) { if (statuses.get(id) !== true) throw new Error(`Playwright did not report exact PASS: ${id}`); const stem = id.replaceAll(":", "-"); const recordPath = join(runRoot, "case-records", `${stem}.json`); const screenshotPath = join(runRoot, "cases", `${stem}.png`); const record = JSON.parse(await readFile(recordPath, "utf8")); const artifacts = [await hashArtifact(runRoot, relative(runRoot, recordPath), "case-record"), await hashArtifact(runRoot, relative(runRoot, screenshotPath), "screenshot")]; if (id === "keyboard:create-to-confirm") artifacts.push(await hashArtifact(runRoot, "traces/mutation-sanitized.zip", "sanitized-trace"), await hashArtifact(runRoot, "traces/mutation-sanitizer-report.json", "trace-sanitizer-report")); cases.push({ ...record, artifacts }); }
    validateLifecycleOrdering(gateRecords, browser, browserPermit, cases);
    const finishedAt = iso(); const runRecordPath = join(runRoot, "run-complete.json"); const toolsPath = join(runRoot, "reproduction", "tools.json");
    const npmVersion = direct(executable("npm"), ["--version"], env); const yarnVersion = direct(executable("corepack"), ["yarn", "--version"], env); const composeVersion = wrapperCommand(["version"], env);
    await writeJson(toolsPath, { node: process.version, npm: npmVersion._stdout.trim(), yarn: yarnVersion._stdout.trim(), compose: composeVersion._stdout.trim(), profiles: ["app", "w2-02-acceptance"], wrapperPrefix, localIdentityCount: identityConfiguration.count, localIdentityConfigurationDigest: identityConfiguration.configurationDigest });
    await writeJson(runRecordPath, { schemaVersion: 3, runId, status: "READY_FOR_PROMOTION", startedAt, finishedAt, workspaceIdentity, attempt, lifecycle: { wrapper: "scripts/wave-a-compose.mjs", profiles: ["app", "w2-02-acceptance"], ownership: "THIS_ATTEMPT", preExistingResources: 0, cleaned: true } });
    const manifestGates = await Promise.all(gates.map(async ({ id, path, record }) => ({ id, runId, workspaceDigest: workspaceIdentity.workspaceDigest, command: REQUIRED_GATE_COMMANDS[id], result: record.result, exitCode: record.exitCode, directExit: record.directExit, artifacts: [await hashArtifact(runRoot, relative(runRoot, path), "direct-gate-record")] })));
    const payload = { schemaVersion: 3, runId, workspaceIdentity, attempt, composeProject: WAVE_A_COMPOSE_PROJECT, baseURL: WAVE_A_BASE_URL, startedAt, finishedAt, setupRecord: await hashArtifact(runRoot, relative(runRoot, setupPath), "fixture-control-record"), fixtureRecord: await hashArtifact(runRoot, relative(runRoot, fixturePath), "fixture-manifest"), workspaceRecord: await hashArtifact(runRoot, relative(runRoot, identityPath), "workspace-identity"), startedAttemptRecord: await hashArtifact(runRoot, relative(runRoot, startedPath), "attempt-start-record"), reproductionRecord: await hashArtifact(runRoot, relative(runRoot, toolsPath), "reproduction-record"), playwrightRecord: await hashArtifact(runRoot, relative(runRoot, browserReportPath), "playwright-json-report"), playwrightDirectRecord: await hashArtifact(runRoot, relative(runRoot, browserDirectPath), "playwright-direct-command-record"), browserPermitRecord: await hashArtifact(runRoot, relative(runRoot, browserPermitPath), "browser-permit"), runRecord: await hashArtifact(runRoot, relative(runRoot, runRecordPath), "run-completion-record"), cases, gates: manifestGates, w1LiveProof: { status: "BLOCKED/WAIVED", reason: "The approved W1 live-proof waiver remains unresolved and is not a PASS." } };
    const payloadPath = join(runRoot, "evidence-payload.json"); await writeJson(payloadPath, payload); const payloadArtifact = await hashArtifact(runRoot, "evidence-payload.json", "immutable-evidence-payload");
    const terminal = createTerminalAttempt({ startedAttempt: attempt, startedRecordSha256: sha256Record(attempt), finishedAt, status: "COMPLETED", evidencePayloadSha256: payloadArtifact.sha256 });
    const terminalBytes = serializeEvidenceRecord(terminal); const terminalPath = join(runRoot, "attempt", "terminal.json"); const terminalCandidatePath = join(runRoot, "attempt", ".terminal-completed.pending");
    const terminalArtifact = { path: relative(runRoot, terminalPath).split(sep).join("/"), kind: "terminal-attempt-record", sha256: sha256Bytes(terminalBytes) };
    const envelope = { schemaVersion: 3, runId, terminalStatus: "PREPARED", commitProtocol: "terminal-last-v1", reproducesRun: attempt.reproducesRun, evidencePayload: payloadArtifact, terminalAttempt: terminalArtifact };
    prepareCompletion = async () => {
      await writeJsonImmutable(terminalCandidatePath, terminal);
      const preparedManifest = await prepareEvidenceManifest(envelope, { runRoot, currentWorkspaceIdentity: workspaceIdentity, artifactOverrides: new Map([[terminalArtifact.path, terminalBytes]]) });
      await promotePreparedEvidenceManifest(join(runRoot, "manifest.json"), preparedManifest);
      return { terminal, terminalBytes, terminalPath, terminalCandidatePath, terminalArtifact, payloadArtifact, finishedAt, preparedManifest };
    };
  } catch (error) { terminalError = error; }
  finally {
    try {
      if (cleanupIsAuthorized({ upInvocationOwned: cleanupOwned, cleaned })) {
        const cleanup = wrapperCommand(["down", "--volumes", "--remove-orphans"], env); await writeJson(join(runRoot, "gates", "wave-a-cleanup-owned-retry.json"), { schemaVersion: 3, runId, command: REQUIRED_GATE_COMMANDS["wave-a-cleanup"], ...publicRecord(cleanup), wrapperOnly: true, ownership: "THIS_ATTEMPT" });
        if (cleanup.result !== "PASS") terminalError = new Error("Owned Wave A cleanup failed terminally", { cause: terminalError }); else { cleaned = true; cleanupOwned = false; }
      }
      if (lifecycleMutationAttempted && !gateRecords["demo-guard-post"]) { const post = direct(executable("npm"), ["run", "demo:guard"], guardEnv); await writeJson(join(runRoot, "gates", "demo-guard-post-finally.json"), { schemaVersion: 3, runId, command: "npm run demo:guard", producer: "acceptance-parent", phase: "post", ...publicRecord(post) }); if (post.result !== "PASS") terminalError = new Error("Post-mutation manager guard failed terminally", { cause: terminalError }); }
    } catch (error) { terminalError = new Error("Acceptance cleanup/final guard failed terminally", { cause: terminalError ?? error }); }
  }
  const missingPreparation = !terminalError && !prepareCompletion ? new Error("Completion preparation was not produced") : null;
  const outcome = await executeTerminalLastTransaction({
    initialError: terminalError ?? missingPreparation,
    prepareEnvelope: prepareCompletion ?? (async () => null),
    cleanupTraceStaging: () => rm(stagingRoot, { recursive: true, force: true }),
    releaseLifecycleLock: async () => { if (lifecycleLockAcquired) { await rm(lifecycleLockPath, { recursive: true, force: true }); lifecycleLockAcquired = false; } },
    publishCompletedTerminal: ({ terminalCandidatePath, terminalPath }) => rename(terminalCandidatePath, terminalPath),
    persistFailedTerminal: (error) => terminalizeAttempt({ attempt, runRoot, logPath, status: "FAILED", diagnosticHash: hash(error instanceof Error ? error.message : String(error)) }),
    indexCompletedNonThrowing: ({ terminal, payloadArtifact, finishedAt }) => terminalizeAttempt({ attempt, runRoot, logPath, status: "COMPLETED", finishedAt, evidencePayloadSha256: payloadArtifact.sha256, terminalAttempt: terminal, terminalAlreadyPersisted: true })
  });
  if (outcome.status === "FAILED") throw outcome.error;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) await main();

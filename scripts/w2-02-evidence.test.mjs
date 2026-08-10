import assert from "node:assert/strict";
import { link, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { createStartedAttempt, createTerminalAttempt, sha256Bytes, sha256Record, validatePredecessorDigest, validateStartedAttempt } from "./w2-02-attempt-lineage.mjs";
import { containsForbiddenEvidence, hashArtifact, prepareEvidenceManifest, promotePreparedEvidenceManifest, sanitizeEvidence, validateEvidenceManifest, validateEvidencePayload, writeEvidenceManifest } from "./w2-02-evidence.mjs";
import { REQUIRED_CASE_IDS, REQUIRED_GATES, REQUIRED_GATE_COMMANDS } from "./w2-02-coverage-ledger.mjs";
import { createFixtureManifest } from "./w2-02-fixture-contract.mjs";
import { controlModeForCaseId } from "./w2-02-ssr-control-proxy.mjs";
import { createBrowserPermit } from "./w2-02-browser-permit.mjs";

const ASSERTIONS = Object.fromEntries(["semantic", "keyboard-focus", "live-region", "reduced-motion", "primary-action", "overflow", "overlap", "clipping", "theme", "axe"].map((key) => [key, "PASS"]));
const IDENTITY_DIGEST = "i".repeat(64).replaceAll("i", "a");
async function write(root, path, value) { const target = join(root, path); await mkdir(dirname(target), { recursive: true }); await writeFile(target, typeof value === "string" || Buffer.isBuffer(value) ? value : JSON.stringify(value, null, 2) + "\n"); return target; }

function controlFor(id) {
  const item = (method, path, action, status) => ({ method, path, action, status }); let observations;
  if (/^visual:create:/.test(id)) observations = [item("GET", "/api/reference-options", "passthrough", 200)];
  else if (id === "keyboard:create-to-confirm") observations = [item("GET", "/api/reference-options", "passthrough", 200), item("POST", "/api/bookings", "passthrough", 201), ...["validate", "price", "confirm"].map((action) => item("POST", `/api/bookings/BKG-1/${action}`, "passthrough", 200))];
  else if (/^visual:list:|^keyboard:list-filter$/.test(id)) observations = [item("GET", "/api/bookings", "synthetic-list", 200)];
  else if (/^visual:detail:/.test(id)) observations = [item("GET", "/api/bookings/W2-02-DETAIL", "synthetic-detail", 200)];
  else {
    const state = id.split(":")[1]; const byState = {
      loading: item("GET", "/api/bookings", "delayed-response", 200), populated: item("GET", "/api/bookings", "synthetic-list", 200), empty: item("GET", "/api/bookings", "synthetic-empty", 200),
      "error-retry": item("GET", "/api/bookings", "synthetic-error", 503), denied: item("GET", "/api/bookings", "synthetic-denied", 403), degraded: item("GET", "/api/bookings/W2-02-DEGRADED", "synthetic-degraded", 200),
      validation: item("GET", "/api/bookings/W2-02-VALIDATION", "synthetic-validation", 200), success: item("GET", "/api/bookings/W2-02-SUCCESS", "synthetic-success", 200)
    };
    observations = state === "pending" ? [item("GET", "/api/bookings/W2-02-PENDING", "synthetic-pending-base", 200), item("POST", "/api/bookings/W2-02-PENDING/validate", "delayed-action", 200)] : [byState[state]];
  }
  return { kind: "ssr-proxy", mode: controlModeForCaseId(id), causal: true, verified: true, appliedCount: observations.length, observations };
}

async function validEvidence(root) {
  const runId = "run-abc"; const base = Date.now() - 60_000; const startedAt = new Date(base).toISOString(); const workspaceDigest = "d".repeat(64);
  const workspaceIdentity = { schemaVersion: 1, baselineCommit: "c2f13dd", headCommit: "abc", trackedDiffSha256: "a".repeat(64), untracked: [], workspaceDigest };
  const attempt = createStartedAttempt({ sequence: 1, runId, rerunOf: null, startedAt, predecessor: null });
  const fixture = createFixtureManifest();
  await write(root, "source/workspace.json", workspaceIdentity); await write(root, "attempt/started.json", attempt); await write(root, "setup/fixture.json", fixture); await write(root, "setup/setup.json", { schemaVersion: 3, runId, workspaceDigest, fixtures: fixture });
  await write(root, "reproduction/tools.json", { node: "v22", npm: "10", yarn: "4.5.3", compose: "v2", profiles: ["app", "w2-02-acceptance"], localIdentityCount: 12, localIdentityConfigurationDigest: IDENTITY_DIGEST });
  const browserStart = new Date(base + 7_900).toISOString(); const browserFinish = new Date(base + 8_500).toISOString(); const finishedAt = new Date(base + 13_000).toISOString();
  await write(root, "run.json", { runId, status: "READY_FOR_PROMOTION", startedAt, finishedAt, workspaceIdentity, attempt, lifecycle: { cleaned: true, ownership: "THIS_ATTEMPT", preExistingResources: 0, wrapper: "scripts/wave-a-compose.mjs" } });
  await write(root, "playwright.json", { suites: [], errors: [] }); await write(root, "playwright-direct.json", { runId, workspaceDigest, result: "PASS", exitCode: 0, directExit: true, startedAt: browserStart, finishedAt: browserFinish });
  const cases = [];
  for (const id of REQUIRED_CASE_IDS) {
    const path = `cases/${id.replaceAll(":", "-")}.txt`; await write(root, path, id); const [kind, discriminator, theme, width] = id.split(":");
    const entry = { id, runId, result: "PASS", assertions: ASSERTIONS, control: controlFor(id), artifacts: [await hashArtifact(root, path, "case-record")], ...(kind === "visual" ? { route: discriminator, theme, width: Number(width) } : kind === "state" ? { state: discriminator, theme, width: Number(width) } : {}) };
    if (id === "keyboard:create-to-confirm") { entry.mutation = true; await write(root, "trace.zip", "safe"); const trace = await hashArtifact(root, "trace.zip", "sanitized-trace"); await write(root, "trace-report.json", { closureStatus: "PASS", secondScan: "PASS", traceOpenValidation: "PASS: model", localIdentityScan: "PASS", localIdentityCount: 12, localIdentityConfigurationDigest: IDENTITY_DIGEST, rawInputRemoved: true, promotedHash: trace.sha256 }); entry.artifacts.push(trace, await hashArtifact(root, "trace-report.json", "trace-sanitizer-report")); }
    cases.push(entry);
  }
  const gates = []; let preBrowserGuard;
  for (let index = 0; index < REQUIRED_GATES.length; index += 1) {
    const id = REQUIRED_GATES[index]; const gateStarted = new Date(base + (index + 1) * 1_000).toISOString(); const gateFinished = new Date(base + (index + 1) * 1_000 + 100).toISOString();
    const lifecycleExtra = id === "wave-a-ownership" ? { preExistingResources: 0, cleanupArmed: false, ownership: "UNCLAIMED", wrapperOnly: true }
      : id === "wave-a-config" ? { composeProject: "linercore-wave-a", edgeURL: "http://127.0.0.1:18088", profiles: ["app", "w2-02-acceptance"], services: ["w2-02-ssr-control"] }
        : ["wave-a-up", "wave-a-cleanup"].includes(id) ? { wrapperOnly: true }
          : id === "wave-a-status" ? { services: [{ Service: "w2-02-ssr-control", State: "running", Health: "healthy" }] }
            : id === "wave-a-readiness" ? { observations: [{ url: "http://127.0.0.1:18088", status: 200 }] } : {};
    const guardExtra = id === "demo-guard-pre-lifecycle" ? { producer: "acceptance-parent", phase: "pre-lifecycle", waveTarget: { baseURL: "http://127.0.0.1:18088", composeProject: "linercore-wave-a" }, protectedDemoInputs: { composeProject: "linercore-shared-platform", imageTag: "demo-20260721", edgeURL: "http://127.0.0.1:8088" } }
      : id === "demo-guard-pre-browser" ? { producer: "playwright-global-setup", phase: "pre-browser", waveTarget: { baseURL: "http://127.0.0.1:18088", composeProject: "linercore-wave-a" }, protectedDemoInputs: { composeProject: "linercore-shared-platform", imageTag: "demo-20260721", edgeURL: "http://127.0.0.1:8088" } } : {};
    const record = { schemaVersion: 3, command: REQUIRED_GATE_COMMANDS[id], runId, workspaceDigest, result: "PASS", exitCode: 0, directExit: true, startedAt: gateStarted, finishedAt: gateFinished, ...lifecycleExtra, ...guardExtra };
    if (id === "demo-guard-pre-browser") preBrowserGuard = record;
    const path = `gates/${id}.json`; await write(root, path, record); gates.push({ id, runId, workspaceDigest, command: REQUIRED_GATE_COMMANDS[id], result: "PASS", exitCode: 0, directExit: true, artifacts: [await hashArtifact(root, path, "direct-gate-record")] });
  }
  const browserPermit = createBrowserPermit({ guard: preBrowserGuard, runId, workspaceDigest, authorizedAt: new Date(base + 8_150).toISOString() }); await write(root, "gates/browser-authorized.json", browserPermit);
  for (const entry of cases) Object.assign(entry, { startedAt: new Date(base + 8_200).toISOString(), actionAt: new Date(base + 8_250).toISOString(), capturedAt: new Date(base + 8_300).toISOString(), browserPermit });
  const payload = { schemaVersion: 3, runId, workspaceIdentity, attempt, composeProject: "linercore-wave-a", baseURL: "http://127.0.0.1:18088", startedAt, finishedAt,
    workspaceRecord: await hashArtifact(root, "source/workspace.json", "workspace-identity"), fixtureRecord: await hashArtifact(root, "setup/fixture.json", "fixture-manifest"), setupRecord: await hashArtifact(root, "setup/setup.json", "fixture-control-record"), startedAttemptRecord: await hashArtifact(root, "attempt/started.json", "attempt-start-record"), reproductionRecord: await hashArtifact(root, "reproduction/tools.json", "reproduction-record"), runRecord: await hashArtifact(root, "run.json", "run-record"), playwrightRecord: await hashArtifact(root, "playwright.json", "playwright-report"), playwrightDirectRecord: await hashArtifact(root, "playwright-direct.json", "playwright-direct"), browserPermitRecord: await hashArtifact(root, "gates/browser-authorized.json", "browser-permit"), cases, gates, w1LiveProof: { status: "BLOCKED/WAIVED", reason: "Approved waiver remains unresolved" } };
  await write(root, "evidence-payload.json", payload); const evidencePayload = await hashArtifact(root, "evidence-payload.json", "immutable-evidence-payload");
  const terminal = createTerminalAttempt({ startedAttempt: attempt, startedRecordSha256: sha256Record(attempt), finishedAt, status: "COMPLETED", evidencePayloadSha256: evidencePayload.sha256 }); await write(root, "attempt/terminal.json", terminal);
  const envelope = { schemaVersion: 3, runId, terminalStatus: "PREPARED", commitProtocol: "terminal-last-v1", reproducesRun: null, evidencePayload, terminalAttempt: await hashArtifact(root, "attempt/terminal.json", "terminal-attempt-record") };
  return { envelope, payload };
}

test("sanitizes evidence fields without accepting forbidden content", () => { const clean = sanitizeEvidence({ authorization: "secret", note: "Bearer abc" }); assert.deepEqual(clean, { note: "[REDACTED]" }); assert.equal(containsForbiddenEvidence(clean), false); });

test("accepts a complete v3 terminal envelope bound to real payload and attempt artifacts", async () => {
  const root = join(tmpdir(), `w2-02-evidence-ok-${process.pid}-${Date.now()}`); await mkdir(root, { recursive: true });
  try {
    const { envelope } = await validEvidence(root); const currentWorkspaceIdentity = JSON.parse(await readFile(join(root, "source/workspace.json"), "utf8"));
    assert.equal((await validateEvidenceManifest(envelope, { runRoot: root, currentWorkspaceIdentity })).terminalStatus, "PREPARED");
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("prepared envelope is non-complete until immutable terminal-last publication", async () => {
  const root = join(tmpdir(), `w2-02-terminal-last-${process.pid}-${Date.now()}`); await mkdir(root, { recursive: true });
  try {
    const { envelope } = await validEvidence(root); const terminalPath = join(root, "attempt", "terminal.json"); const terminalBytes = await readFile(terminalPath); const currentWorkspaceIdentity = JSON.parse(await readFile(join(root, "source/workspace.json"), "utf8")); await rm(terminalPath);
    const prepared = await prepareEvidenceManifest(envelope, { runRoot: root, currentWorkspaceIdentity, artifactOverrides: new Map([["attempt/terminal.json", terminalBytes]]) });
    await promotePreparedEvidenceManifest(join(root, "manifest.json"), prepared);
    const promotedEnvelope = JSON.parse(await readFile(join(root, "manifest.json"), "utf8"));
    await assert.rejects(() => validateEvidenceManifest(promotedEnvelope, { runRoot: root, currentWorkspaceIdentity }), /missing|linked|aliased/i);
    await write(root, "attempt/terminal.json", terminalBytes);
    assert.equal((await validateEvidenceManifest(promotedEnvelope, { runRoot: root, currentWorkspaceIdentity })).commitProtocol, "terminal-last-v1");
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("rejects source drift, lineage drift, unsafe ownership, aliases, missing files, fake hashes, and empty identity proof", async () => {
  const root = join(tmpdir(), `w2-02-evidence-bad-${process.pid}-${Date.now()}`); await mkdir(root, { recursive: true });
  try { const { payload } = await validEvidence(root); const baselineIdentity = structuredClone(payload.workspaceIdentity); for (const mutate of [
    (value) => { value.cases[0].artifacts[0].path = "missing.txt"; },
    (value) => { value.cases[0].artifacts[0].path = `cases/../${value.cases[0].artifacts[0].path.split("/").at(-1)}`; },
    (value) => { value.cases[0].artifacts[0].sha256 = "f".repeat(64); },
    (value) => { value.workspaceIdentity.workspaceDigest = "e".repeat(64); },
    (value) => { value.attempt.sequence = 2; },
    (value) => { value.cases[0].control.causal = false; },
    (value) => { value.w1LiveProof.status = "PASS"; },
    (value) => { value.gates.find(({ id }) => id === "wave-a-ownership").id = "wave-a-config"; },
    (value) => { value.gates.find(({ id }) => id === "wave-a-up").artifacts = value.gates.find(({ id }) => id === "wave-a-ownership").artifacts; }
  ]) { const value = structuredClone(payload); mutate(value); await assert.rejects(() => validateEvidencePayload(value, { runRoot: root, currentWorkspaceIdentity: baselineIdentity })); }
  const tools = JSON.parse(await readFile(join(root, "reproduction/tools.json"), "utf8")); tools.localIdentityCount = 0; await write(root, "reproduction/tools.json", tools); const changed = structuredClone(payload); changed.reproductionRecord = await hashArtifact(root, "reproduction/tools.json", "reproduction-record"); await assert.rejects(() => validateEvidencePayload(changed, { runRoot: root, currentWorkspaceIdentity: baselineIdentity }), /identity/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("final envelope rejects non-terminal status and payload or predecessor hash drift", async () => {
  const root = join(tmpdir(), `w2-02-envelope-bad-${process.pid}-${Date.now()}`); await mkdir(root, { recursive: true }); try { const { envelope } = await validEvidence(root); for (const mutate of [(value) => { value.terminalStatus = "STARTED"; }, (value) => { value.reproducesRun = "foreign-run"; }, (value) => { value.evidencePayload.sha256 = "f".repeat(64); }]) { const value = structuredClone(envelope); mutate(value); await assert.rejects(() => validateEvidenceManifest(value, { runRoot: root })); } } finally { await rm(root, { recursive: true, force: true }); }
});

test("rerun starts are hash-bound to a preserved predecessor terminal record", () => {
  const startedAt = new Date(Date.now() - 10_000).toISOString(); const prior = createStartedAttempt({ sequence: 1, runId: "run-prior", rerunOf: null, startedAt, predecessor: null });
  const terminal = createTerminalAttempt({ startedAttempt: prior, startedRecordSha256: sha256Record(prior), finishedAt: new Date(Date.now() - 9_000).toISOString(), status: "FAILED", diagnosticHash: "d".repeat(64) });
  const terminalBytes = Buffer.from(JSON.stringify(terminal, null, 2) + "\n"); const predecessor = { runId: "run-prior", sequence: 1, status: "FAILED", terminalSha256: sha256Bytes(terminalBytes) };
  const rerun = createStartedAttempt({ sequence: 2, runId: "run-rerun", rerunOf: "run-prior", startedAt: new Date().toISOString(), predecessor }); assert.equal(validateStartedAttempt(rerun).reproducesRun, "run-prior"); assert.equal(validatePredecessorDigest(rerun, terminalBytes), true);
  const forged = structuredClone(rerun); forged.predecessor.terminalSha256 = "f".repeat(64); assert.throws(() => validatePredecessorDigest(forged, terminalBytes), /digest/);
});

test("rejects hardlinks and escaping symlinks where the platform permits them", async (t) => {
  const root = join(tmpdir(), `w2-02-evidence-links-${process.pid}-${Date.now()}`); await mkdir(root, { recursive: true }); const source = await write(root, "source.txt", "safe");
  try { const hard = join(root, "hard.txt"); await link(source, hard); await assert.rejects(() => hashArtifact(root, "hard.txt", "probe"), /Hard-linked/); const outside = join(tmpdir(), `w2-02-outside-${process.pid}.txt`); await writeFile(outside, "outside"); try { await symlink(outside, join(root, "escape.txt")); await assert.rejects(() => hashArtifact(root, "escape.txt", "probe"), /link|alias/i); } catch (error) { if (!["EPERM", "EACCES"].includes(error.code)) throw error; t.diagnostic("symlink creation unavailable on this Windows policy"); } await rm(outside, { force: true }); }
  finally { await rm(root, { recursive: true, force: true }); }
});

test("writes only a validated secret-free final envelope", async () => { const root = join(tmpdir(), `w2-02-write-${process.pid}-${Date.now()}`); await mkdir(root, { recursive: true }); try { const { envelope } = await validEvidence(root); envelope.cookie = "secret"; const path = join(root, "manifest.json"); await writeEvidenceManifest(path, envelope, { runRoot: root }); assert.equal(containsForbiddenEvidence(JSON.parse(await readFile(path, "utf8"))), false); } finally { await rm(root, { recursive: true, force: true }); } });

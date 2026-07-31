import assert from "node:assert/strict";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { REQUIRED_CASE_IDS, REQUIRED_GATE_COMMANDS, WAVE_A_WRAPPER_COMMAND } from "./w2-02-coverage-ledger.mjs";
import { allocateAttempt, auditInvocation, cleanupIsAuthorized, collectPlaywrightCaseResults, createRunRoot, direct, parseComposeRows, reconcileAttemptHistory, validateLifecycleOrdering, validateNoPreExistingWaveAStatus, validateWaveAComposeConfig, validateWaveAStatus, WINDOWS_AUDIT_IMAGE, WAVE_A_COMPOSE_GLOBAL_ARGS } from "./w2-02-live-acceptance.mjs";
import { planWaveAComposeInvocations, WAVE_A_SEQUENTIAL_BUILD_SERVICES } from "./wave-a-compose.mjs";
import { createStartedAttempt, createTerminalAttempt, persistStartedAttempt, persistTerminalAttempt, sha256Bytes, sha256Record } from "./w2-02-attempt-lineage.mjs";
import { createBrowserPermit } from "./w2-02-browser-permit.mjs";
import { executeTerminalLastTransaction } from "./w2-02-completion-transaction.mjs";
import { validateEvidenceManifest } from "./w2-02-evidence.mjs";

const report = (ids = REQUIRED_CASE_IDS, status = "passed") => ({
  suites: [{ title: "W2-02", specs: ids.map((id) => ({ title: `${id} executable proof`, tests: [{ results: [{ status }] }] })) }]
});

test("run-root bootstrap creates fixed parents while preserving immutable run allocation", async () => {
  const liveRoot = join(tmpdir(), `w2-02-run-root-${process.pid}-${Date.now()}`);
  try {
    const runRoot = await createRunRoot(liveRoot, "run-one");
    assert.equal(runRoot, join(liveRoot, "runs", "run-one"));
    await assert.rejects(() => createRunRoot(liveRoot, "run-one"), { code: "EEXIST" });
  } finally { await rm(liveRoot, { recursive: true, force: true }); }
});

test("direct command evidence executes Windows command shims through ComSpec", { skip: process.platform !== "win32" }, () => {
  const result = direct("npm.cmd", ["--version"], process.env);
  assert.equal(result.exitCode, 0);
  assert.equal(result.directExit, true);
  assert.equal(result.result, "PASS");
  assert.match(result._stdout, /^\d+\.\d+\.\d+/);
});

test("audit detector invocation uses host Bash off Windows and a read-only Docker bind on Windows", () => {
  const detector = ".claude/skills/aidlc-audit/detectors.sh";
  assert.deepEqual(auditInvocation(detector, "linux", "/repo"), {
    command: "bash",
    args: [detector],
    executable: `bash ${detector}`
  });
  const windows = auditInvocation(detector, "win32", "D:\\repo");
  assert.equal(windows.command, "docker");
  assert.deepEqual(windows.args, [
    "run", "--rm", "--mount", "type=bind,source=D:\\repo,target=/workspace,readonly",
    "--workdir", "/workspace", "--entrypoint", "/bin/bash", WINDOWS_AUDIT_IMAGE, detector
  ]);
  assert.match(windows.executable, /<workspace>:\/workspace:ro/);
});

test("Wave A acceptance serializes image builds structurally before no-build startup", () => {
  assert.deepEqual(WAVE_A_COMPOSE_GLOBAL_ARGS, ["--parallel", "1"]);
  assert.equal(WAVE_A_WRAPPER_COMMAND, "node scripts/wave-a-compose.mjs --parallel 1 -f compose.yaml -f infrastructure/compose/w2-02-acceptance.compose.yaml");
  for (const gate of ["wave-a-ownership", "wave-a-config", "wave-a-up", "wave-a-status", "wave-a-cleanup"]) {
    assert.match(REQUIRED_GATE_COMMANDS[gate], /^node scripts\/wave-a-compose\.mjs --parallel 1 -f compose\.yaml/);
  }
  assert.match(REQUIRED_GATE_COMMANDS["wave-a-up"], / acceptance-up --wait-timeout 360$/);

  const invocations = planWaveAComposeInvocations(
    ["--parallel", "1", "-f", "compose.yaml", "-f", "infrastructure/compose/w2-02-acceptance.compose.yaml", "acceptance-up", "--wait-timeout", "360"],
    { WAVE_A_COMPOSE_PROFILES: "app,w2-02-acceptance" }
  );
  assert.equal(invocations.length, WAVE_A_SEQUENTIAL_BUILD_SERVICES.length + 1);
  assert.deepEqual(invocations.slice(0, -1).map((args) => args.slice(-2)), WAVE_A_SEQUENTIAL_BUILD_SERVICES.map((service) => ["build", service]));
  assert.deepEqual(invocations.at(-1).slice(-6), ["up", "-d", "--no-build", "--wait", "--wait-timeout", "360"]);
});

test("Wave A acceptance can use verified prebuilt images without weakening no-build startup", () => {
  const invocations = planWaveAComposeInvocations(
    ["--parallel", "1", "-f", "compose.yaml", "-f", "infrastructure/compose/w2-02-acceptance.compose.yaml", "acceptance-up", "--wait-timeout", "360"],
    {
      WAVE_A_COMPOSE_PROFILES: "app,w2-02-acceptance",
      WAVE_A_ACCEPTANCE_USE_PREBUILT: "1"
    }
  );
  assert.equal(invocations.length, 1);
  assert.deepEqual(invocations[0].slice(-6), ["up", "-d", "--no-build", "--wait", "--wait-timeout", "360"]);
});

test("Wave A UI ports use the fixed infrastructure band above observed Windows Docker exclusions", async () => {
  const env = await readFile(new URL("../infrastructure/env/wave-a.env.example", import.meta.url), "utf8");
  const ports = Object.fromEntries(
    env
      .split(/\r?\n/)
      .filter((line) => /^(?:SHELL_APP|REFERENCE_DATA_UI|BOOKING_APP)_HOST_PORT=/.test(line))
      .map((line) => line.split("="))
  );

  assert.deepEqual(ports, {
    SHELL_APP_HOST_PORT: "18104",
    REFERENCE_DATA_UI_HOST_PORT: "18102",
    BOOKING_APP_HOST_PORT: "18101"
  });
  for (const port of Object.values(ports).map(Number)) {
    assert.equal(port >= 18100 && port <= 18199, true);
  }
  assert.equal(new Set(Object.values(ports)).size, 3);
});

test("maps every required Playwright result by exact case id", () => {
  const mapped = collectPlaywrightCaseResults(report());
  assert.equal(mapped.size, REQUIRED_CASE_IDS.length);
  for (const id of REQUIRED_CASE_IDS) assert.equal(mapped.get(id), true);
});

test("cannot represent an omitted or failed browser case as PASS", () => {
  const missing = collectPlaywrightCaseResults(report(REQUIRED_CASE_IDS.slice(1)));
  assert.equal(missing.has(REQUIRED_CASE_IDS[0]), false);
  const failed = collectPlaywrightCaseResults(report([REQUIRED_CASE_IDS[0]], "failed"));
  assert.equal(failed.get(REQUIRED_CASE_IDS[0]), false);
  const duplicate = collectPlaywrightCaseResults({ suites: [{ specs: [
    { title: REQUIRED_CASE_IDS[0], tests: [{ results: [{ status: "passed" }] }] },
    { title: REQUIRED_CASE_IDS[0], tests: [{ results: [{ status: "passed" }] }] }
  ] }] });
  assert.equal(duplicate.get(REQUIRED_CASE_IDS[0]), false);
});

const config = () => ({ name: "linercore-wave-a", services: {
  nginx: { ports: [{ host_ip: "0.0.0.0", published: "18088", target: 80 }] },
  "apps-shell": { environment: { BOOKING_APP_URL: "http://w2-02-ssr-control:43102" } }, "apps-booking": {},
  "w2-02-ssr-control": { ports: [{ host_ip: "127.0.0.1", published: "14312", target: 43102 }] }
} });

test("effective lifecycle config is exact Wave A and causally proxy-wired", () => {
  assert.equal(validateWaveAComposeConfig(config()).name, "linercore-wave-a");
  for (const mutate of [(value) => { value.name = "linercore-shared-platform"; }, (value) => { value.services.nginx.ports[0].published = "8088"; }, (value) => { value.services["apps-shell"].environment.BOOKING_APP_URL = "http://apps-booking:3000"; }]) { const value = config(); mutate(value); assert.throws(() => validateWaveAComposeConfig(value)); }
});

test("status requires every acceptance dependency running", () => {
  const rows = ["nginx", "apps-shell", "apps-booking", "w2-02-ssr-control"].map((Service) => ({ Service, State: "running", Health: "healthy" }));
  assert.equal(validateWaveAStatus(rows).length, 4); rows[2].State = "exited"; assert.throws(() => validateWaveAStatus(rows));
});

test("pre-start ownership rejects existing Wave A resources and never authorizes cleanup before this run invokes up", () => {
  assert.deepEqual(validateNoPreExistingWaveAStatus(parseComposeRows("")), []);
  assert.throws(() => validateNoPreExistingWaveAStatus([{ Service: "apps-shell", State: "running" }]), /pre-existing/);
  assert.equal(cleanupIsAuthorized({ upInvocationOwned: false, cleaned: false }), false, "config or ownership failure cannot down another stack");
  assert.equal(cleanupIsAuthorized({ upInvocationOwned: true, cleaned: false }), true, "a partial owned up must be cleaned");
  assert.equal(cleanupIsAuthorized({ upInvocationOwned: true, cleaned: true }), false);
});

test("production boundary preserves parent Playwright start, global setup guard, permit, and case action order", () => {
  const start = Date.now() - 30_000; const ids = ["demo-guard-pre-lifecycle", "wave-a-ownership", "wave-a-config", "wave-a-up", "wave-a-status", "wave-a-readiness", "pricing-fixture", "demo-guard-pre-browser", "wave-a-cleanup", "demo-guard-post"];
  const records = Object.fromEntries(ids.map((id, index) => [id, { startedAt: new Date(start + index * 1_000).toISOString(), finishedAt: new Date(start + index * 1_000 + 100).toISOString() }]));
  const guard = records["demo-guard-pre-browser"]; const browser = { startedAt: new Date(start + 6_900).toISOString(), finishedAt: new Date(start + 7_700).toISOString() };
  const permit = createBrowserPermit({ guard, runId: "run-1", workspaceDigest: "d".repeat(64), authorizedAt: new Date(start + 7_150).toISOString() });
  const cases = [{ id: "case-1", startedAt: new Date(start + 7_200).toISOString(), actionAt: new Date(start + 7_250).toISOString(), capturedAt: new Date(start + 7_300).toISOString() }];
  assert.equal(validateLifecycleOrdering(records, browser, permit, cases), true);
  const fabricated = structuredClone(cases); fabricated[0].actionAt = new Date(start + 7_050).toISOString(); assert.throws(() => validateLifecycleOrdering(records, browser, permit, fabricated), /Case chronology/);
  records["wave-a-config"].startedAt = new Date(start - 1_000).toISOString(); assert.throws(() => validateLifecycleOrdering(records, browser, permit, cases), /chronology/);
});

test("both STARTED and FAILED index appends may fail without erasing the immutable local terminal", async () => {
  const root = join(tmpdir(), `w2-02-attempt-index-${process.pid}-${Date.now()}`); await mkdir(root, { recursive: true });
  try {
    const started = createStartedAttempt({ sequence: 1, runId: "run-index-failure", rerunOf: null, startedAt: new Date(Date.now() - 1000).toISOString(), predecessor: null });
    let calls = 0;
    const writeRecord = async (path, value) => { await mkdir(join(path, ".."), { recursive: true }); await writeFile(path, JSON.stringify(value, null, 2) + "\n"); };
    const result = await persistStartedAttempt({ startedAttempt: started, startedPath: join(root, "started.json"), terminalPath: join(root, "terminal.json"), recoveryPath: join(root, "index-recovery.json"), writeRecord, appendEvent: async () => { calls += 1; throw new Error(`injected append failure ${calls}`); } });
    const terminalBytes = await readFile(join(root, "terminal.json")); const recovery = JSON.parse(await readFile(join(root, "index-recovery.json"), "utf8"));
    assert.ok(result.error); assert.equal(calls, 2); assert.equal(JSON.parse(terminalBytes).event, "FAILED"); assert.equal(recovery.terminalIndexed, false); assert.equal(recovery.failedEvent, "STARTED"); assert.match(recovery.indexError, /append failure 1.*append failure 2/); assert.equal((await readFile(join(root, "terminal.json"))).equals(terminalBytes), true);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("ordinary runtime FAILED terminal append failure writes durable run-local index recovery", async () => {
  const root = join(tmpdir(), `w2-02-runtime-index-${process.pid}-${Date.now()}`); await mkdir(root, { recursive: true });
  try {
    const started = createStartedAttempt({ sequence: 1, runId: "run-runtime-failure", rerunOf: null, startedAt: new Date(Date.now() - 1000).toISOString(), predecessor: null });
    const writeRecord = async (path, value) => { await mkdir(join(path, ".."), { recursive: true }); await writeFile(path, JSON.stringify(value, null, 2) + "\n"); };
    const persisted = await persistTerminalAttempt({ startedAttempt: started, terminalPath: join(root, "terminal.json"), recoveryPath: join(root, "index-recovery.json"), writeRecord, appendEvent: async () => { throw new Error("injected ordinary runtime terminal append failure"); }, finishedAt: new Date().toISOString(), status: "FAILED", diagnosticHash: "d".repeat(64) });
    const terminalBytes = await readFile(join(root, "terminal.json")); const recovery = JSON.parse(await readFile(join(root, "index-recovery.json"), "utf8"));
    assert.equal(JSON.parse(terminalBytes).status, "FAILED"); assert.equal(persisted.indexError instanceof Error, true); assert.equal(recovery.failedEvent, "FAILED"); assert.equal(recovery.terminalIndexed, false); assert.equal((await readFile(join(root, "terminal.json"))).equals(terminalBytes), true);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("next locked allocation increments from an unindexed local terminal and binds it as rerun predecessor", async () => {
  const liveRoot = join(tmpdir(), `w2-02-local-lineage-${process.pid}-${Date.now()}`); const firstRoot = join(liveRoot, "runs", "run-local-1"); const nextRoot = join(liveRoot, "runs", "run-local-2");
  await mkdir(join(firstRoot, "attempt"), { recursive: true }); await mkdir(nextRoot, { recursive: true });
  try {
    const first = createStartedAttempt({ sequence: 1, runId: "run-local-1", rerunOf: null, startedAt: new Date(Date.now() - 2000).toISOString(), predecessor: null });
    const writeRecord = async (path, value) => { await mkdir(join(path, ".."), { recursive: true }); await writeFile(path, JSON.stringify(value, null, 2) + "\n"); };
    await persistStartedAttempt({ startedAttempt: first, startedPath: join(firstRoot, "attempt", "started.json"), terminalPath: join(firstRoot, "attempt", "terminal.json"), recoveryPath: join(firstRoot, "attempt", "index-recovery.json"), writeRecord, appendEvent: async () => { throw new Error("shared index unavailable"); } });
    const priorTerminalBytes = await readFile(join(firstRoot, "attempt", "terminal.json"));
    const allocated = await allocateAttempt({ runId: "run-local-2", runRoot: nextRoot, requestedRerun: null, startedAt: new Date().toISOString(), liveRoot });
    assert.equal(allocated.error, null); assert.equal(allocated.started.sequence, 2); assert.equal(allocated.started.rerunOf, "run-local-1"); assert.equal(allocated.started.reproducesRun, "run-local-1"); assert.equal(allocated.started.predecessor.sequence, 1); assert.equal(allocated.started.predecessor.status, "FAILED"); assert.equal(allocated.started.predecessor.terminalSha256, sha256Bytes(priorTerminalBytes));
  } finally { await rm(liveRoot, { recursive: true, force: true }); }
});

test("history reconciliation rejects conflicting duplicate sequences and digests", () => {
  const one = createStartedAttempt({ sequence: 1, runId: "run-one", rerunOf: null, startedAt: new Date(Date.now() - 1000).toISOString(), predecessor: null });
  const conflict = { ...one, runId: "run-two" };
  assert.throws(() => reconcileAttemptHistory([one, conflict], []), /duplicate attempt sequence/);
  assert.throws(() => reconcileAttemptHistory([one, { ...one, startedAt: new Date().toISOString() }], []), /Conflicting STARTED digest/);
});

test("terminal-last transaction fault injection leaves FAILED plus recovery and no complete envelope", async (t) => {
  for (const fault of ["manifest preparation", "manifest write", "manifest promotion", "trace staging cleanup", "lifecycle lock release", "completed publication"]) {
    await t.test(fault, async () => {
      const root = join(tmpdir(), `w2-02-transaction-${fault.replaceAll(" ", "-")}-${process.pid}-${Date.now()}`); await mkdir(join(root, "attempt"), { recursive: true });
      try {
        const started = createStartedAttempt({ sequence: 1, runId: `run-${fault.replaceAll(" ", "-")}`, rerunOf: null, startedAt: new Date(Date.now() - 1000).toISOString(), predecessor: null });
        const writeRecord = async (path, value) => { await mkdir(join(path, ".."), { recursive: true }); await writeFile(path, JSON.stringify(value, null, 2) + "\n"); };
        await writeRecord(join(root, "attempt", "started.json"), started); const payloadBytes = Buffer.from("{}\n"); await writeFile(join(root, "payload.json"), payloadBytes);
        const completed = createTerminalAttempt({ startedAttempt: started, startedRecordSha256: sha256Record(started), finishedAt: new Date().toISOString(), status: "COMPLETED", evidencePayloadSha256: sha256Bytes(payloadBytes) }); const completedBytes = Buffer.from(JSON.stringify(completed, null, 2) + "\n");
        const envelope = { schemaVersion: 3, runId: started.runId, terminalStatus: "PREPARED", commitProtocol: "terminal-last-v1", reproducesRun: null, evidencePayload: { path: "payload.json", kind: "payload", sha256: sha256Bytes(payloadBytes) }, terminalAttempt: { path: "attempt/terminal.json", kind: "terminal", sha256: sha256Bytes(completedBytes) } };
        const persistFailedTerminal = (error) => persistTerminalAttempt({ startedAttempt: started, terminalPath: join(root, "attempt", "terminal.json"), recoveryPath: join(root, "attempt", "index-recovery.json"), writeRecord, appendEvent: async () => { throw new Error("shared index unavailable during failed transaction"); }, finishedAt: new Date().toISOString(), status: "FAILED", diagnosticHash: sha256Bytes(Buffer.from(error.message)) });
        const outcome = await executeTerminalLastTransaction({
          prepareEnvelope: async () => {
            if (fault === "manifest preparation") throw new Error("injected manifest preparation failure");
            if (fault === "manifest write") throw new Error("injected manifest write failure");
            if (fault === "manifest promotion") throw new Error("injected manifest promotion failure");
            await writeRecord(join(root, "manifest.json"), envelope); return { completed, completedBytes };
          },
          cleanupTraceStaging: async () => { if (fault === "trace staging cleanup") throw new Error("injected trace staging cleanup failure"); },
          releaseLifecycleLock: async () => { if (fault === "lifecycle lock release") throw new Error("injected lifecycle lock release failure"); },
          publishCompletedTerminal: async () => { if (fault === "completed publication") throw new Error("injected completed publication failure"); await writeFile(join(root, "attempt", "terminal.json"), completedBytes); },
          persistFailedTerminal,
          indexCompletedNonThrowing: async () => { throw new Error("must not index a failed transaction"); }
        });
        const terminal = JSON.parse(await readFile(join(root, "attempt", "terminal.json"), "utf8")); const recovery = JSON.parse(await readFile(join(root, "attempt", "index-recovery.json"), "utf8"));
        assert.equal(outcome.status, "FAILED"); assert.equal(outcome.completedPublished, false); assert.equal(terminal.status, "FAILED"); assert.equal(recovery.status, "FAILED"); assert.equal(recovery.terminalIndexed, false);
        await assert.rejects(() => validateEvidenceManifest(envelope, { runRoot: root }), /hash mismatch|missing|linked|aliased/i);
      } finally { await rm(root, { recursive: true, force: true }); }
    });
  }
});

test("COMPLETED publication is the last throwing boundary and index failure becomes recovery", async () => {
  const root = join(tmpdir(), `w2-02-completed-index-${process.pid}-${Date.now()}`); await mkdir(join(root, "attempt"), { recursive: true });
  try {
    const calls = []; const started = createStartedAttempt({ sequence: 1, runId: "run-completed-index", rerunOf: null, startedAt: new Date(Date.now() - 1000).toISOString(), predecessor: null }); const completed = createTerminalAttempt({ startedAttempt: started, startedRecordSha256: sha256Record(started), finishedAt: new Date().toISOString(), status: "COMPLETED", evidencePayloadSha256: "e".repeat(64) }); const completedBytes = Buffer.from(JSON.stringify(completed, null, 2) + "\n");
    const writeRecord = async (path, value) => { await mkdir(join(path, ".."), { recursive: true }); await writeFile(path, JSON.stringify(value, null, 2) + "\n"); };
    const outcome = await executeTerminalLastTransaction({
      prepareEnvelope: async () => { calls.push("prepare-envelope"); return { completed }; }, cleanupTraceStaging: async () => { calls.push("cleanup-trace"); }, releaseLifecycleLock: async () => { calls.push("release-lock"); },
      publishCompletedTerminal: async () => { calls.push("publish-completed"); await writeFile(join(root, "attempt", "terminal.json"), completedBytes); }, persistFailedTerminal: async () => { throw new Error("failure terminal must not run"); },
      indexCompletedNonThrowing: async () => { calls.push("index-completed"); return persistTerminalAttempt({ startedAttempt: started, terminalPath: join(root, "attempt", "terminal.json"), recoveryPath: join(root, "attempt", "index-recovery.json"), writeRecord, appendEvent: async () => { throw new Error("injected COMPLETED index append failure"); }, terminalAttempt: completed, terminalAlreadyPersisted: true }); }
    });
    const terminal = JSON.parse(await readFile(join(root, "attempt", "terminal.json"), "utf8")); const recovery = JSON.parse(await readFile(join(root, "attempt", "index-recovery.json"), "utf8"));
    assert.equal(outcome.status, "COMPLETED"); assert.deepEqual(calls, ["prepare-envelope", "cleanup-trace", "release-lock", "publish-completed", "index-completed"]); assert.equal(terminal.status, "COMPLETED"); assert.equal(recovery.status, "COMPLETED"); assert.equal(recovery.terminalIndexed, false);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("production runner orders direct guard and empty-stack ownership before arming cleanup for up", async () => {
  const source = await readFile("scripts/w2-02-live-acceptance.mjs", "utf8"); const transactionSource = await readFile("scripts/w2-02-completion-transaction.mjs", "utf8");
  const preGuard = source.indexOf('direct(executable("npm"), ["run", "demo:guard"]');
  const lock = source.indexOf("await mkdir(lifecycleLockPath)");
  const ownership = source.indexOf('wrapperCommand(["ps", "--all", "--format", "json"]');
  const config = source.indexOf('wrapperCommand(["config", "--format", "json"]');
  const arm = source.indexOf("cleanupOwned = true; lifecycleMutationAttempted = true;");
  const up = source.indexOf('wrapperCommand(["acceptance-up", "--wait-timeout", "360"]');
  const failureStatus = source.indexOf('recordGate("wave-a-up-failure-status"');
  assert.ok(preGuard >= 0 && preGuard < lock && lock < ownership && ownership < config && config < arm && arm < up);
  assert.ok(up < failureStatus);
  assert.match(source, /cleanupIsAuthorized\(\{ upInvocationOwned: cleanupOwned, cleaned \}\)/);
  assert.match(source, /terminalizeAttempt\(\{ attempt, runRoot, logPath, status: "FAILED"/);
  assert.match(source, /terminalStatus: "PREPARED", commitProtocol: "terminal-last-v1"/);
  assert.match(source, /WAVE_A_COMPOSE_GLOBAL_ARGS = Object\.freeze\(\["--parallel", "1"\]\)/);
  assert.match(source, /publishCompletedTerminal: \(\{ terminalCandidatePath, terminalPath \}\) => rename\(terminalCandidatePath, terminalPath\)/);
  assert.doesNotMatch(source, /writeJsonImmutable\(terminalPath/);
  assert.doesNotMatch(source, /rm\(terminalPath|index-warning|appendTerminal/);
  assert.doesNotMatch(transactionSource.slice(transactionSource.indexOf("// COMPLETED is now")), /\bthrow\b/);
  assert.doesNotMatch(source, /\bdocker\s+compose\b|linercore-shared-platform.*\bdown\b/i);
});

test("all W2-02 Next.js apps cap production build workers", async () => {
  for (const app of ["auth", "booking", "charge-agreements", "reference-data", "shell"]) {
    const config = (await import(`../apps/${app}/next.config.mjs`)).default;
    assert.equal(
      config?.experimental?.cpus,
      1,
      `${app} must keep the single-worker cap required by the constrained Docker acceptance runtime`
    );
  }
});

test("acceptance app builds use a hash-verified offline Linux dependency image", async () => {
  const [override, dockerfile, manifest] = await Promise.all([
    readFile("infrastructure/compose/w2-02-acceptance.compose.yaml", "utf8"),
    readFile("infrastructure/docker/next-app.acceptance.Dockerfile", "utf8"),
    readFile("infrastructure/docker/w2-02-dependency-manifest.sha256", "utf8")
  ]);
  for (const app of ["apps-auth", "apps-booking", "apps-charge-agreements", "apps-reference-data", "apps-shell"]) {
    assert.match(override, new RegExp(`${app}:[\\s\\S]*?dockerfile: infrastructure/docker/next-app\\.acceptance\\.Dockerfile`));
  }
  assert.match(dockerfile, /ARG W2_02_DEPENDENCY_IMAGE=linercore\/w2-02-node-deps:a37a1fefcfe8/);
  assert.match(dockerfile, /RUN sha256sum -c \/tmp\/w2-02-dependency-manifest\.sha256/);
  assert.match(dockerfile, /COPY --from=dependency-source \/app\/node_modules \.\/node_modules/);
  for (const line of manifest.trim().split(/\r?\n/)) {
    const match = line.match(/^([a-f0-9]{64}) {2}(.+)$/);
    assert.ok(match, `invalid dependency manifest row: ${line}`);
    assert.equal(sha256Bytes(await readFile(match[2])), match[1], `${match[2]} diverged from the pinned Linux dependency image`);
  }
});

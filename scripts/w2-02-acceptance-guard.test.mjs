import assert from "node:assert/strict";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { validateDirectGuardRecord, validateWaveAEnvironment } from "./w2-02-acceptance-guard.mjs";
import { runPlaywrightGlobalSetup } from "./w2-02-playwright-global-setup.mjs";

test("rejects mismatched and protected targets", () => {
  assert.throws(() => validateWaveAEnvironment({ W2_02_BASE_URL: "http://127.0.0.1:8088", W2_02_COMPOSE_PROJECT: "linercore-wave-a" }), /exactly/);
  assert.throws(() => validateWaveAEnvironment({ W2_02_BASE_URL: "http://127.0.0.1:18088", W2_02_COMPOSE_PROJECT: "linercore-shared-platform" }), /exactly/);
});

test("post-browser validation preserves guard binding without imposing a suite-duration limit", () => {
  const finished = Date.now() - 10 * 60_000;
  const record = {
    schemaVersion: 3,
    producer: "playwright-global-setup",
    command: "npm run demo:guard",
    phase: "pre-browser",
    runId: "run-long-suite",
    workspaceDigest: "d".repeat(64),
    result: "PASS",
    exitCode: 0,
    directExit: true,
    startedAt: new Date(finished - 1_000).toISOString(),
    finishedAt: new Date(finished).toISOString(),
    waveTarget: { baseURL: "http://127.0.0.1:18088", composeProject: "linercore-wave-a" },
    protectedDemoInputs: { composeProject: "linercore-shared-platform", imageTag: "demo-20260721", edgeURL: "http://127.0.0.1:8088" }
  };
  const expected = { runId: record.runId, workspaceDigest: record.workspaceDigest };
  assert.throws(() => validateDirectGuardRecord(record, expected), /stale or unordered/);
  assert.equal(validateDirectGuardRecord(record, { ...expected, requireFresh: false }), record);
});

test("a caller-authored or previously signed file cannot authorize mutation", async () => {
  const root = join(tmpdir(), `w2-02-global-guard-${process.pid}-${Date.now()}`); await mkdir(root, { recursive: true });
  const identityPath = join(root, "identity.json"); await writeFile(identityPath, JSON.stringify({ workspaceDigest: "d".repeat(64) }));
  const forged = join(root, "forged.json"); await writeFile(forged, JSON.stringify({ result: "PASS", signedByCaller: true }));
  const env = { W2_02_BASE_URL: "http://127.0.0.1:18088", W2_02_COMPOSE_PROJECT: "linercore-wave-a", W2_02_RUN_ID: "run-1", W2_02_RUN_ROOT: root, W2_02_WORKSPACE_IDENTITY_FILE: identityPath, W2_02_PRE_GUARD_RESULT: forged, W2_02_RUN_CAPABILITY: "caller-owned" };
  try {
    await assert.rejects(() => runPlaywrightGlobalSetup(env, () => ({ status: 1, stdout: "", stderr: "guard failed" })), /foreign or non-green/);
    let invocation;
    const { record, permit } = await runPlaywrightGlobalSetup(env, (command, args) => { invocation = { command, args }; return { status: 0, stdout: "Demo guard PASS", stderr: "" }; });
    assert.equal(record.producer, "playwright-global-setup"); assert.equal(record.command, "npm run demo:guard");
    assert.equal(record.phase, "pre-browser");
    if (process.platform === "win32") { assert.match(invocation.command, /(?:cmd|ComSpec)/i); assert.deepEqual(invocation.args.slice(0, 4), ["/d", "/s", "/c", "npm.cmd"]); }
    assert.equal(permit.status, "PERMITTED"); assert.equal(permit.guardFinishedAt, record.finishedAt);
    assert.equal(JSON.parse(await readFile(join(root, "gates", "demo-guard-pre-browser.json"), "utf8")).result, "PASS");
    assert.equal(JSON.parse(await readFile(join(root, "gates", "browser-authorized.json"), "utf8")).guardSha256, permit.guardSha256);
  } finally { await rm(root, { recursive: true, force: true }); }
});

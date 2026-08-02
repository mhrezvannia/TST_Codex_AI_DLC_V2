import assert from "node:assert/strict";
import { test } from "node:test";
import { makeSkippedResult, redactArgv, runBoundedCommand } from "../../tools/u06/command.mjs";
import { RESOURCE_LIMITS, assertResourcePreflight, captureProvenance, createRunId } from "../../tools/u06/provenance.mjs";
import { assertAllowedComposeCommand, assertManagerUnchanged, fingerprintManagerInventory, runPreGuard, runReadOnlyManagerInventory, runWaveAConfig, validateWaveAConfig } from "../../tools/u06/isolation.mjs";

const spec = { id: "probe", phase: "preflight", command: "tool", args: [], requirements: ["NFR-004"], timeoutMs: 1000 };
const execute = (result) => () => ({ stdout: "ok", stderr: "", status: 0, ...result });

test("bounded commands classify unavailable as BLOCKED and mismatches as FAIL", () => {
  assert.equal(runBoundedCommand(spec, { execute: execute({ error: Object.assign(new Error("missing"), { code: "ENOENT" }), status: null }) }).status, "BLOCKED");
  assert.equal(runBoundedCommand(spec, { execute: execute({ status: 2 }) }).status, "FAIL");
  assert.equal(runBoundedCommand(spec, { execute: execute({ status: 1, stderr: "Error: spawnSync docker EPERM" }) }).status, "BLOCKED");
  assert.equal(runBoundedCommand({ ...spec, assert: () => false }, { execute: execute({}) }).status, "FAIL");
  assert.equal(runBoundedCommand(spec, { execute: execute({}) }).status, "PASS");
});

test("npm commands execute through Node on Windows while evidence retains the reviewed argv", () => {
  let invoked;
  const npmSpec = { ...spec, command: "npm", args: ["--version"] };
  const result = runBoundedCommand(npmSpec, { execute: (command, args) => {
    invoked = { command, args };
    return { status: 0, stdout: "11.0.0", stderr: "" };
  } });
  assert.equal(result.status, "PASS");
  assert.deepEqual(result.command, ["npm", "--version"]);
  if (process.platform === "win32") {
    assert.equal(invoked.command, process.execPath);
    assert.match(invoked.args[0], /npm[\\/]bin[\\/]npm-cli\.js$/);
  } else {
    assert.equal(invoked.command, "npm");
  }
});

test("redaction and linked SKIPPED records retain no secrets", () => {
  assert.deepEqual(redactArgv(["tool", "--token", "secret-value"]), ["tool", "<redacted>", "<redacted>"]);
  const blocked = runBoundedCommand(spec, { execute: execute({ error: Object.assign(new Error("denied"), { code: "EPERM" }), status: null }) });
  assert.equal(makeSkippedResult({ ...spec, id: "later" }, blocked).skippedBecause, "probe");
  assert.throws(() => makeSkippedResult({ ...spec, id: "later" }, { status: "PASS" }), /earlier terminal/);
});

test("stdout, stderr, errors, assertions are redacted and bounded by UTF-8 bytes", () => {
  const output = runBoundedCommand({ ...spec, outputCapBytes: 9 }, { execute: execute({ stdout: "éééééé", stderr: "authorization: bearer-secret" }) });
  assert.ok(Buffer.byteLength(output.stdout) <= 9); assert.doesNotMatch(output.stderr, /bearer-secret/);
  const assertion = runBoundedCommand({ ...spec, assert: () => { throw new Error("token=assertion-secret"); } }, { execute: execute({}) });
  assert.doesNotMatch(assertion.summary, /assertion-secret/);
  const thrown = runBoundedCommand(spec, { execute: () => { throw new Error("password=exception-secret"); } });
  assert.doesNotMatch(thrown.summary, /exception-secret/);
  const structured = runBoundedCommand(spec, { execute: execute({
    stdout: JSON.stringify({ token: "bearer-secret", nested: { password: "p@ss", safe: "kept" },
      escaped: JSON.stringify({ authorization: "Bearer inner-secret", cookie: "sid=secret" }) }),
    stderr: 'prefix {\\"apiKey\\":\\"escaped-secret\\"} suffix session=plain-secret',
  }) });
  assert.doesNotMatch(`${structured.stdout}\n${structured.stderr}`, /bearer-secret|p@ss|inner-secret|sid=secret|escaped-secret|plain-secret/);
  assert.match(structured.stdout, /kept/);
});

test("run IDs, provenance, disk reserve, and reviewed caps are deterministic", () => {
  assert.match(createRunId(new Date("2026-07-29T01:02:03.004Z"), () => Buffer.from("deadbeef", "hex")), /^20260729T010203\.004Z-deadbeef$/);
  const provenance = captureProvenance({ cwd: process.cwd(), env: { DEMO_EDGE_URL: "override" }, git: { dirtySummary: ["M x"] } });
  assert.deepEqual(provenance.forbiddenManagerOverridesPresent, ["DEMO_EDGE_URL"]);
  assert.equal(RESOURCE_LIMITS.writerQueue, 256);
  assert.doesNotThrow(() => assertResourcePreflight(process.cwd()));
});

test("pre-guard uses immutable defaults and unavailable spawn is BLOCKED", () => {
  assert.equal(runPreGuard({ env: { DEMO_EDGE_URL: "http://127.0.0.1:9999" }, execute: execute({}) }).status, "BLOCKED");
  const observed = runPreGuard({ env: {}, execute: execute({}) });
  assert.equal(observed.status, "PASS");
  assert.deepEqual(observed.command, ["npm", "run", "demo:guard"]);
});

test("manager inventory command is read-only and wrapper config is exact", () => {
  const json = JSON.stringify({ ID: "c1", Image: "i1", Names: "nginx", Labels: "com.docker.compose.service=nginx", RunningFor: "1h", Ports: "127.0.0.1:8088->80/tcp" });
  const inventory = runReadOnlyManagerInventory({ execute: execute({ stdout: `${json}\n` }) });
  assert.equal(inventory.gate.status, "PASS");
  assert.equal(inventory.fingerprint.rows[0].project, "linercore-shared-platform");
  const config = runWaveAConfig({ execute: execute({ stdout: "name: linercore-wave-a\nports: ['127.0.0.1:18088:80']" }) });
  assert.equal(config.status, "PASS");
  assert.deepEqual(config.command, ["node", "scripts/wave-a-compose.mjs", "config"]);
});

test("manager fingerprint is exact and mutation-sensitive", () => {
  const rows = [{ project: "linercore-shared-platform", service: "nginx", containerId: "c1", imageId: "i1", startedAt: "t1", ports: ["127.0.0.1:8088"] }];
  const before = fingerprintManagerInventory(rows);
  assert.equal(assertManagerUnchanged(before, fingerprintManagerInventory(rows)), true);
  assert.throws(() => assertManagerUnchanged(before, fingerprintManagerInventory([{ ...rows[0], startedAt: "t2" }])), /changed/);
  assert.throws(() => fingerprintManagerInventory([{ ...rows[0], project: "other" }]), /project mismatch/);
});

test("Wave A config and wrapper-only mutation reject alternate topology", () => {
  assert.equal(validateWaveAConfig("name: linercore-wave-a\nports: ['127.0.0.1:18088:80']"), true);
  assert.throws(() => validateWaveAConfig("name: linercore-wave-a\nports: ['127.0.0.1:8088:80']"), /8088/);
  assert.throws(() => validateWaveAConfig("name: alternate\nports: ['127.0.0.1:18089:80']"), /mismatch/);
  assert.equal(assertAllowedComposeCommand(["node", "scripts/wave-a-compose.mjs", "up", "-d"]), true);
  assert.throws(() => assertAllowedComposeCommand(["docker", "compose", "up"]), /raw/);
  assert.throws(() => assertAllowedComposeCommand(["node", "scripts/wave-a-compose.mjs", "up", "--project-name", "linercore-shared-platform"]), /manager/);
});

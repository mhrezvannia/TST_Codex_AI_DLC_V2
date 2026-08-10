import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { classifyGate, liveAcceptanceGates, resolveW1BashExecutable, runLiveAcceptance, validateLivePreflight, waitForUrl } from "./w1-live-acceptance.mjs";

test("dry-run creates manifest and index with planned gates", () => {
  const outputRoot = mkdtempSync(join(tmpdir(), "w1-live-"));
  const manifest = runLiveAcceptance({
    dryRun: true,
    outputRoot,
    runId: "dry-run-test",
    gates: [{
      id: "preflight",
      section: "preflight",
      mapsTo: ["BR-U07-002"],
      command: "node scripts/w1-live-acceptance.mjs --preflight"
    }]
  });

  assert.equal(manifest.status, "PLANNED");
  assert.equal(manifest.gates[0].status, "PLANNED");
  assert.match(readFileSync(join(outputRoot, "dry-run-test", "index.md"), "utf8"), /BR-U07-002/);
  assert.equal(JSON.parse(readFileSync(join(outputRoot, "dry-run-test", "manifest.json"), "utf8")).runId, "dry-run-test");
  assert.ok(Date.parse(manifest.completedAt) >= Date.parse(manifest.startedAt));
});

test("live acceptance includes an explicit observability health gate", () => {
  const gate = liveAcceptanceGates.find((candidate) => candidate.id === "observability-health");

  assert.ok(gate);
  assert.match(gate.command, /--observability-health/);
});

test("live seed waits for its service dependencies before applying records", () => {
  const gate = liveAcceptanceGates.find((candidate) => candidate.id === "seed-live");

  assert.ok(gate);
  assert.match(gate.command, /seed-local\.mjs --wait /);
});

test("booking UI probe uses explicit loopback and retries transient failures", async () => {
  const gate = liveAcceptanceGates.find((candidate) => candidate.id === "booking-ui-health");
  let attempts = 0;
  const result = await waitForUrl("http://127.0.0.1:8088/bookings", 100, async () => {
    attempts += 1;
    if (attempts === 1) throw new Error("fetch failed");
    return { ok: true, status: 200 };
  }, 0);

  assert.match(gate.command, /127\.0\.0\.1:8088\/bookings/);
  assert.equal(attempts, 2);
  assert.equal(result.status, 200);
});

test("live run stops dependent gates after a blocked preflight", () => {
  const manifest = runLiveAcceptance({
    outputRoot: mkdtempSync(join(tmpdir(), "w1-live-")),
    runId: "blocked-test",
    gates: [
      {
        id: "preflight",
        section: "preflight",
        mapsTo: ["BR-U07-002"],
        command: "preflight",
        blockedWhen: ["PRECHECK_BLOCKED"]
      },
      {
        id: "quality",
        section: "quality",
        mapsTo: ["BR-U07-006"],
        command: "quality"
      }
    ],
    runner: (command) => command === "preflight"
      ? { status: 1, stdout: "", stderr: "PRECHECK_BLOCKED missing real messaging" }
      : { status: 0, stdout: "should not run", stderr: "" }
  });

  assert.equal(manifest.status, "BLOCKED");
  assert.equal(manifest.gates[0].status, "BLOCKED");
  assert.equal(manifest.gates[1].status, "SKIPPED");
});

test("preflight requires postgres 55432, nginx 8088, and real messaging", () => {
  const result = validateLivePreflight({
    composeText: `
      ports:
        - "\${POSTGRES_HOST_PORT:-55432}:5432"
        - "8088:80"
        - "\${GRAFANA_HOST_PORT:-3003}:3000"
      environment:
        MESSAGING_REQUIRE_REAL: "true"
    `
  });

  assert.equal(result.status, "PASS");
  assert.equal(validateLivePreflight({ composeText: "ports: ['5432:5432']" }).status, "BLOCKED");
});

test("gate output redacts token-like values", () => {
  const gate = classifyGate({ id: "x", section: "preflight", mapsTo: [], command: "x" }, { command: "x" }, {
    status: 1,
    stdout: "TOKEN=secret",
    stderr: ""
  });

  assert.equal(gate.status, "FAIL");
  assert.doesNotMatch(gate.summary, /secret/);
});

test("long gate output preserves diagnostic head and tail", () => {
  const gate = classifyGate({ id: "x", section: "compose", mapsTo: [], command: "x" }, { command: "x" }, {
    status: 1,
    stdout: `build-start\n${"x".repeat(9000)}\ndaemon-tail-error`,
    stderr: ""
  });

  assert.match(gate.summary, /^build-start/);
  assert.match(gate.summary, /output truncated/);
  assert.match(gate.summary, /daemon-tail-error$/);
});

test("Windows acceptance resolves Git Bash ahead of the WSL shim", () => {
  assert.equal(resolveW1BashExecutable({
    platform: "win32",
    env: { ProgramFiles: "C:\\Program Files" },
    pathExists: (path) => path === "C:\\Program Files\\Git\\bin\\bash.exe"
  }), "C:\\Program Files\\Git\\bin\\bash.exe");
});

test("acceptance honors an explicit Bash executable override", () => {
  assert.equal(resolveW1BashExecutable({
    platform: "win32",
    env: { W1_ACCEPTANCE_BASH_PATH: "D:\\tools\\bash.exe" },
    pathExists: () => false
  }), "D:\\tools\\bash.exe");
});

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { classifyGate, runLiveAcceptance, validateLivePreflight } from "./w1-live-acceptance.mjs";

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

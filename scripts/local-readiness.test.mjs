import test from "node:test";
import assert from "node:assert/strict";
import { classifyStep, runLocalReadiness } from "./local-readiness.mjs";

test("classifies blocked prerequisite output separately from failures", () => {
  const step = { id: "prerequisites", command: "x", blockedWhen: ["\"status\": \"blocked\""] };
  const result = classifyStep(step, { status: 1, stdout: "{\"status\": \"blocked\"}", stderr: "" });

  assert.equal(result.status, "blocked");
});

test("readiness aggregate reports blocked when only blocked checks fail", () => {
  const evidence = runLocalReadiness({
    steps: [
      { id: "a", command: "pass" },
      { id: "b", command: "blocked", blockedWhen: ["fetch failed"] }
    ],
    runner: (command) => command === "pass"
      ? { status: 0, stdout: "ok", stderr: "" }
      : { status: 1, stdout: "fetch failed", stderr: "" }
  });

  assert.equal(evidence.status, "blocked");
  assert.deepEqual(evidence.summary, { passed: 1, blocked: 1, failed: 0 });
});

test("readiness aggregate reports failed for non-blocked failures", () => {
  const evidence = runLocalReadiness({
    steps: [{ id: "a", command: "fail" }],
    runner: () => ({ status: 1, stdout: "assertion failed", stderr: "" })
  });

  assert.equal(evidence.status, "failed");
});

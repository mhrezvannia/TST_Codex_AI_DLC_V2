import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { snapshotProtectedProject, verifyProtectedProject } from "./demo-guard.mjs";

function runner(projects) {
  return () => ({ status: 0, stdout: JSON.stringify(projects), stderr: "" });
}

test("guard passes when the protected demo remains unchanged", () => {
  const path = join(mkdtempSync(join(tmpdir(), "demo-guard-")), "snapshot.json");
  const projects = [{ Name: "linercore-shared-platform", Status: "running(12)", ConfigFiles: "compose.yaml" }];
  snapshotProtectedProject(path, { runner: runner(projects), now: "2026-07-26T00:00:00Z" });

  assert.equal(verifyProtectedProject(path, { runner: runner(projects) }).status, "PASS");
});

test("guard fails when the protected demo state changes", () => {
  const path = join(mkdtempSync(join(tmpdir(), "demo-guard-")), "snapshot.json");
  snapshotProtectedProject(path, { runner: runner([{ Name: "linercore-shared-platform", Status: "running(12)" }]) });

  const result = verifyProtectedProject(path, {
    runner: runner([{ Name: "linercore-shared-platform", Status: "exited(12)" }])
  });

  assert.equal(result.status, "FAIL");
  assert.match(result.failures[0], /state changed/);
});

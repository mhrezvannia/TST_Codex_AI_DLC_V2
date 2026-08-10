import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  evidenceFiles,
  redact,
  requiredScenarios,
  resolveBashExecutable,
  runDetector6d,
  runW201Acceptance,
  syncBlockersFile,
  validateEvidencePackage
} from "./w2-01-live-acceptance.mjs";

test("dry-run writes the required blocked evidence package shape", () => {
  const outputRoot = mkdtempSync(join(tmpdir(), "w2-01-live-"));
  const manifest = runW201Acceptance({
    dryRun: true,
    outputRoot,
    now: "2026-07-18T00:00:00.000Z"
  });

  assert.equal(manifest.finalDecision, "BLOCKED");
  assert.equal(manifest.runtimeStatus, "BLOCKED");
  for (const file of [...evidenceFiles, "blockers.jsonl"]) {
    assert.ok(readFileSync(join(outputRoot, file), "utf8").length >= 0, `${file} should exist`);
  }
  assert.match(readFileSync(join(outputRoot, "final-decision.md"), "utf8"), /W1-01 live-proof waiver remains BLOCKED at compose-start/);
  assert.deepEqual(
    readFileSync(join(outputRoot, "scenarios.jsonl"), "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line).scenarioId).sort(),
    [...requiredScenarios].sort()
  );
});

test("validator accepts an honest blocked package with linked blockers", () => {
  const outputRoot = mkdtempSync(join(tmpdir(), "w2-01-live-"));
  runW201Acceptance({
    dryRun: true,
    outputRoot,
    now: "2026-07-18T00:00:00.000Z"
  });

  assert.deepEqual(validateEvidencePackage(outputRoot), { status: "PASS", failures: [] });
});

test("require-pass validation rejects a blocked evidence package", () => {
  const outputRoot = mkdtempSync(join(tmpdir(), "w2-01-live-"));
  runW201Acceptance({
    dryRun: true,
    outputRoot,
    now: "2026-07-18T00:00:00.000Z"
  });

  const result = validateEvidencePackage(outputRoot, { requirePass: true });

  assert.equal(result.status, "FAIL");
  assert.ok(result.failures.includes("manifest finalDecision must be PASS"));
  assert.ok(result.failures.includes("manifest runtimeStatus must be PASS"));
});

test("detector 6d passes when mounted shell and Booking surfaces have no local-user actor fallback", () => {
  const outputRoot = mkdtempSync(join(tmpdir(), "w2-01-live-"));
  const result = runDetector6d(outputRoot, "2026-07-18T00:00:00.000Z");

  assert.equal(result.status, "PASS");
  assert.match(readFileSync(join(outputRoot, "detector-6d.txt"), "utf8"), /zero hardcoded-auth hits/);
});

test("redaction removes token-like values and session cookies from command output", () => {
  const output = redact("TOKEN=abc PASSWORD=def SECRET=ghi COOKIE=jkl lc_session=session-value;");

  assert.doesNotMatch(output, /abc|def|ghi|jkl|session-value/);
  assert.match(output, /TOKEN=<redacted>/);
  assert.match(output, /lc_session=<redacted>/);
});

test("Windows acceptance resolves Git Bash ahead of the WSL shim", () => {
  const expected = "C:\\Program Files\\Git\\bin\\bash.exe";
  const resolved = resolveBashExecutable({
    platform: "win32",
    env: { ProgramFiles: "C:\\Program Files" },
    pathExists: (candidate) => candidate === expected
  });

  assert.equal(resolved, expected);
});

test("acceptance honors an explicit Bash executable override", () => {
  assert.equal(resolveBashExecutable({
    platform: "win32",
    env: { W2_01_BASH_PATH: "D:\\tools\\bash.exe" },
    pathExists: () => false
  }), "D:\\tools\\bash.exe");
});

test("successful reruns remove stale blocker evidence", () => {
  const outputRoot = mkdtempSync(join(tmpdir(), "w2-01-live-"));
  const blockerPath = join(outputRoot, "blockers.jsonl");
  writeFileSync(blockerPath, '{"blockerId":"STALE"}\n');

  syncBlockersFile(outputRoot, []);

  assert.equal(existsSync(blockerPath), false);
});

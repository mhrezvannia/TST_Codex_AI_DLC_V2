import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

test("observability smoke passes", () => {
  const result = spawnSync("node", ["scripts/smoke-observability.mjs"], { encoding: "utf8" });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /"status": "ok"/);
});

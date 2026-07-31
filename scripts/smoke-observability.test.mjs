import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { serviceHasProfile } from "./smoke-observability.mjs";

test("observability smoke passes", () => {
  const result = spawnSync("node", ["scripts/smoke-observability.mjs"], { encoding: "utf8" });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /"status": "ok"/);
});

test("observability profile validation is service-scoped and accepts additional profiles", () => {
  const compose = `services:
  prometheus:
    image: prom/prometheus
    profiles: ["observability", "full"]
  unrelated:
    image: example/unrelated
    profiles: ["observability"]
`;
  assert.equal(serviceHasProfile(compose, "prometheus", "observability"), true);
  assert.equal(serviceHasProfile(compose, "prometheus", "full"), true);
  assert.equal(serviceHasProfile(compose, "prometheus", "missing"), false);
  assert.equal(serviceHasProfile(compose, "absent", "observability"), false);
});

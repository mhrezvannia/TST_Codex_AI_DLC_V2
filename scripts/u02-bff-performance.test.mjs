import assert from "node:assert/strict";
import { test } from "node:test";
import { evaluateU02Performance, nearestRank } from "./u02-bff-performance.mjs";

test("uses nearest-rank percentiles and fails incomplete evidence", () => {
  assert.equal(nearestRank(Array.from({ length: 100 }, (_, index) => index + 1), 0.95), 95);
  assert.match(evaluateU02Performance({
    routes: [{ id: "agreements.list", warmups: 19, overheadMs: [] }],
    normalClients: 9,
    adversarialAdmissions: 20,
    quiescenceSeconds: 60,
    resource: {}
  }).join("\n"), /requires 20 warm-ups|load shape/);
});

import assert from "node:assert/strict";
import test from "node:test";
import { evaluateU05Performance, percentile } from "./u05-booking-performance.mjs";

const samples = (operation) => Array.from({ length: 100 }, (_, index) => ({
  operation, elapsedMs: 100 + index
}));
const valid = {
  status: "measured", clients: 10, warmups: 20,
  samples: [...samples("price"), ...samples("reprice")],
  resourceBounds: { maxConnections: 10, maxPermits: 10, acquireMs: 100,
    connectMs: 500, deadlineMs: 2000, maxResponseBytes: 65536 },
  resilience: { maxAttempts: 2, circuitWindow: 5, minimumCalls: 5,
    failureThreshold: 100, openWaitMs: 30000, halfOpenPermits: 1 },
  history: { planCaptured: true, spilled: false, workMemKiB: 4096, rawPlan: "Index Scan" },
  postGcResourceCycles: [
    { heapBytes: 100, rssBytes: 200 }, { heapBytes: 95, rssBytes: 195 },
    { heapBytes: 90, rssBytes: 190 }
  ]
};

test("nearest-rank percentile is deterministic", () => assert.equal(percentile([3, 1, 2], 0.99), 3));
test("accepts complete measured evidence", () => assert.deepEqual(evaluateU05Performance(valid), []));
test("rejects synthetic or unbounded evidence", () => {
  assert.ok(evaluateU05Performance({ ...valid, status: "synthetic" }).length > 0);
  assert.ok(evaluateU05Performance({ ...valid, clients: 11 }).length > 0);
});

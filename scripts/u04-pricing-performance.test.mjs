import assert from "node:assert/strict";
import { test } from "node:test";
import {
  evaluateU04Performance,
  FRESH_PATHS,
  nearestRank
} from "./u04-pricing-performance.mjs";

test("uses deterministic nearest-rank percentiles", () => {
  assert.equal(nearestRank(Array.from({ length: 100 }, (_, index) => index + 1), 0.99), 99);
});

test("accepts the exact U04 raw-evidence contract", () => {
  assert.deepEqual(evaluateU04Performance(validEvidence()), []);
});

test("rejects synthetic, slow, incomplete, spilling, replay-mutating, and growing evidence", () => {
  const evidence = validEvidence();
  evidence.status = "synthetic";
  evidence.freshSamples = evidence.freshSamples.filter((sample) => sample.path !== "tariff");
  evidence.replays[0].caseWrites = 1;
  evidence.manualSamples.filter((sample) => sample.operation === "list").at(-1).elapsedMs = 900;
  evidence.queryPlans[0].spilled = true;
  evidence.postGcResourceCycles[2].rssBytes = 2;
  assert.match(evaluateU04Performance(evidence).join("\n"),
    /measured|tariff: at least|exact replays|list: p95|no-spill|no three-cycle growth/);
});

function validEvidence() {
  const freshSamples = FRESH_PATHS.flatMap((path, pathIndex) =>
    Array.from({ length: 100 }, (_, index) => sample({
      path, index: pathIndex * 100 + index, elapsedMs: 20, outcome: "expected"
    })));
  const manualSamples = ["list", "detail"].flatMap((operation, operationIndex) =>
    Array.from({ length: 100 }, (_, index) => sample({
      operation, index: operationIndex * 100 + index, elapsedMs: 30
    })));
  const replays = [200, 404, 422].flatMap((status) =>
    Array.from({ length: 25 }, () => ({
      status, byteIdentical: true, resolverReads: 0, caseWrites: 0
    })));
  return {
    status: "measured",
    clients: 10,
    warmupsPerPath: 20,
    fixture: { manualCases: 10_000 },
    environment: {
      commit: "abc", os: "test", cpu: "test", memoryBytes: 1,
      java: "21", postgresql: "15"
    },
    freshSamples,
    replays,
    manualSamples,
    queryPlans: [
      { operation: "list", captured: true, spilled: false, workMemKiB: 4096, rawPlan: "Sort" },
      { operation: "detail", captured: true, spilled: false, workMemKiB: 4096, rawPlan: "Index Scan" }
    ],
    postGcResourceCycles: [
      { heapBytes: 1, rssBytes: 1 },
      { heapBytes: 1, rssBytes: 1 },
      { heapBytes: 1, rssBytes: 1 }
    ]
  };
}

function sample({ path, operation, index, elapsedMs, outcome = "expected" }) {
  return {
    ...(path ? { path } : {}),
    ...(operation ? { operation } : {}),
    startedMonotonicMs: index,
    endedMonotonicMs: index + elapsedMs,
    elapsedMs,
    correlationId: `corr-${path ?? operation}-${index}`,
    outcome
  };
}

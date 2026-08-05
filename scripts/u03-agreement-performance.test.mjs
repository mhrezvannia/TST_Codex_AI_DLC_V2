import assert from "node:assert/strict";
import { test } from "node:test";
import {
  evaluateU03Performance,
  nearestRank,
  summarizeSamples
} from "./u03-agreement-performance.mjs";

test("uses nearest-rank percentiles", () => {
  const values = Array.from({ length: 100 }, (_, index) => index + 1);
  assert.equal(nearestRank(values, 0.95), 95);
  assert.deepEqual(summarizeSamples(values.map((elapsedMs) => ({ elapsedMs }))), {
    count: 100, p50Ms: 50, p95Ms: 95, p99Ms: 99, maxMs: 100
  });
});

test("accepts the exact fixed U03 workload", () => {
  assert.deepEqual(evaluateU03Performance(validEvidence()), []);
});

test("rejects synthetic, incomplete, slow, and unsafe evidence", () => {
  const evidence = validEvidence();
  evidence.status = "synthetic";
  evidence.samples = evidence.samples.filter((sample) => sample.operation !== "approve");
  evidence.database.nPlusOneDetected = true;
  evidence.contention.oneWinnerPerRound = false;
  assert.match(evaluateU03Performance(evidence).join("\n"),
    /measured live evidence|approve: expected|bounded-query|contention/);
});

function validEvidence() {
  const samples = [];
  for (let cycle = 1; cycle <= 3; cycle += 1) {
    for (const [operation, count] of Object.entries({
      list: 50, detail: 50, create: 20, edit: 20, approve: 20,
      successor: 20, suspend: 20, expire: 20
    })) {
      for (let index = 0; index < count; index += 1) {
        samples.push(sample(operation, "healthy", cycle, index, operation === "list" || operation === "detail"
          ? "w2-vendor" : "w2-vendor"));
      }
    }
    for (let index = 0; index < 100; index += 1) {
      samples.push(sample(["search", "detail", "activeLookup"][index % 3],
        "legacy", cycle, index, "legacy-default"));
    }
  }
  samples.push(sample("create", "domain-failure", 1, 0, "w2-vendor"));
  samples.push(sample("referenceValidation", "dependency-fault", 1, 0, "w2-vendor"));
  return {
    status: "measured",
    concurrency: 10,
    warmupsPerOperation: 20,
    cycles: 3,
    quiescenceSeconds: 60,
    fixture: { agreements: 10_000, versions: 50_000, links: 150_000 },
    environment: {
      commit: "abc", os: "test", cpu: "test", memoryBytes: 1,
      java: "21", postgresql: "15", kafka: "3"
    },
    samples,
    contention: {
      rounds: 20,
      oneWinnerPerRound: true,
      noLoserSideEffects: true,
      independentKeysConcurrent: true
    },
    database: {
      pageSizeBounded: true,
      queryPlansCaptured: true,
      nPlusOneDetected: false,
      poolAcquisitionTimeouts: 0,
      deadlocks: 0
    },
    resourceCycles: [{ heapUsed: 1, rss: 1 }, { heapUsed: 1, rss: 1 }, { heapUsed: 1, rss: 1 }]
  };
}

function sample(operation, classification, cycle, index, media) {
  const startedMonotonicMs = cycle * 10_000 + index;
  return {
    operation,
    classification,
    cycle,
    startedMonotonicMs,
    endedMonotonicMs: startedMonotonicMs + 10,
    elapsedMs: 10,
    status: classification === "healthy" || classification === "legacy" ? 200 : 409,
    code: classification === "healthy" || classification === "legacy" ? null : "EXPECTED",
    correlationId: `corr-${classification}-${cycle}-${index}-${operation}`,
    media,
    expectedClassification: classification,
    outcome: "expected"
  };
}

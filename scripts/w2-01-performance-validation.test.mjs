import assert from "node:assert/strict";
import test from "node:test";
import {
  extractTimings,
  nearestRankPercentile,
  summarizeMetric
} from "./w2-01-performance-validation.mjs";

test("nearest-rank percentile uses the conservative tenth sample for p95", () => {
  const samples = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  assert.equal(nearestRankPercentile(samples, 0.5), 50);
  assert.equal(nearestRankPercentile(samples, 0.95), 100);
});

test("metric validation requires every expected sample and the p95 limit", () => {
  const definition = { key: "createMs", targetMs: 5000, requirement: "create" };
  assert.equal(summarizeMetric(definition, Array(10).fill(4999), 10).status, "PASS");
  assert.equal(summarizeMetric(definition, Array(9).fill(100), 10).status, "BLOCKED");
  assert.equal(summarizeMetric(definition, [...Array(9).fill(100), 5001], 10).status, "BLOCKED");
});

test("timing extraction maps scenario and compatibility evidence", () => {
  const timings = extractTimings({
    scenarios: [
      { scenarioId: "allow-booking-create-detail", timings: { bookingReadMs: 1, createMs: 2, detailMs: 3 } },
      { scenarioId: "deny-booking-access", timings: { denyMs: 4 } },
      { scenarioId: "sign-out-reauth-stale-call", timings: { signOutMs: 5, postSignOutGuardMs: 6, staleCallMs: 7 } }
    ],
    compatibility: [
      { legacyPath: "/bookings", durationMs: 8 },
      { legacyPath: "/bookings/new", durationMs: 9 },
      { legacyPath: "/bookings/abc", durationMs: 10 }
    ]
  });
  assert.deepEqual(timings, {
    bookingReadMs: 1,
    createMs: 2,
    detailMs: 3,
    denyMs: 4,
    signOutMs: 5,
    postSignOutGuardMs: 6,
    staleCallMs: 7,
    compatibilityListMs: 8,
    compatibilityNewMs: 9,
    compatibilityDetailMs: 10
  });
});

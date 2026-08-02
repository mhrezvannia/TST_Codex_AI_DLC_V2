import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCommercialEnvelope, COMMERCIAL_IDS } from "../../tools/u06/commercial-observer.mjs";
import { expectedPrice } from "../../tools/u06/live-gates.mjs";

test("commercial envelope is exact, correlated, and carries the reviewed artifact kinds", () => {
  const observations = COMMERCIAL_IDS.map(observation);
  const envelope = buildCommercialEnvelope(observations, new Date("2026-08-02T00:00:00Z"));
  assert.deepEqual(envelope.results.map((result) => result.key), COMMERCIAL_IDS.map((id) => `COMMERCIAL:${id}`));
  assert.deepEqual(Object.keys(envelope.results[0].artifactPayloads).sort(),
    ["correlation-proof", "database-evidence", "http-evidence"]);
  assert.equal(envelope.results[0].observation.httpEvidence, undefined);
});

test("commercial envelope rejects partial, reordered, or broken correlation evidence", () => {
  const observations = COMMERCIAL_IDS.map(observation);
  assert.throws(() => buildCommercialEnvelope(observations.slice(1)), /cardinality/);
  assert.throws(() => buildCommercialEnvelope([observations[1], observations[0], ...observations.slice(2)]), /mismatch/);
  const broken = structuredClone(observations); broken[0].httpEvidence[0].correlationId = "wrong";
  assert.throws(() => buildCommercialEnvelope(broken), /correlation/);
});

function observation(id) {
  const correlationId = `corr-${id.toLowerCase()}`;
  const common = { id, correlationId, httpCount: 1, ownerLocalDbOwners: ["CHARGE", "BOOKING"],
    httpEvidence: [{ method: "POST", path: "/api/bookings/id/price", status: 200, correlationId }],
    databaseEvidence: [{ owner: "BOOKING", rowCount: 1, correlationId }] };
  if (["AGREEMENT_PRICE", "TARIFF_FALLBACK", "SUCCESSOR_REPRICE"].includes(id)) {
    return { ...common, price: expectedPrice(), receiptCount: 1, snapshotCount: 1 };
  }
  if (id === "NO_RATE" || id.startsWith("AMBIGUITY_")) return { ...common, amountPresent: false, caseCount: 1 };
  if (id.startsWith("OUTAGE_") || id === "CHARGE_DISABLED") return { ...common, amountPresent: false, chargeCaseCount: 0 };
  return { ...common, ownerLocalDbOwners: ["BOOKING"], chargeCalls: 0 };
}

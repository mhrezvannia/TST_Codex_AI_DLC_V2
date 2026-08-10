import assert from "node:assert/strict";
import test from "node:test";
import { evaluateU05Preservation, INCOMPATIBLE_U05_ROWS_SQL } from "./u05-booking-preservation.mjs";

test("workspace satisfies U05 preservation contract", () => {
  assert.deepEqual(evaluateU05Preservation(), []);
});

test("rollback predicate covers aggregate receipt and typed snapshot rows", () => {
  for (const marker of ["booking_records", "pricingAmendmentSeq", "booking_idempotency",
    "operation = 'PRICE'", "booking_pricing_snapshots", "incompatible_u05_rows"]) {
    assert.match(INCOMPATIBLE_U05_ROWS_SQL, new RegExp(marker.replace(/[?]/g, "\\?")));
  }
});

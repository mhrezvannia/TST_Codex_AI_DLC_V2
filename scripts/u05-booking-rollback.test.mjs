import assert from "node:assert/strict";
import test from "node:test";
import { evaluateU05Rollback } from "./u05-booking-rollback.mjs";

const eligible = { drained: true, readOnly: true, validateOnly: true,
  catalogHashUnchanged: true, flywayHashUnchanged: true, dataHashUnchanged: true,
  legacyFixturesBytePreserved: true, incompatibleU05Rows: 0,
  databaseRole: { select: true, dml: false, ddl: false },
  downMigration: false, durableReset: false };

test("permits only the compatibility-proven read-only cell", () => {
  assert.equal(evaluateU05Rollback(eligible).eligible, true);
});
test("requires forward repair after any U05 row", () => {
  const result = evaluateU05Rollback({ ...eligible, incompatibleU05Rows: 1 });
  assert.equal(result.eligible, false);
  assert.equal(result.action, "FORWARD_REPAIR");
});

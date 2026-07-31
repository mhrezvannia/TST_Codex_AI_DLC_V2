import assert from "node:assert/strict";
import { test } from "node:test";
import { evaluateU04RollbackCell } from "./u04-rollback-policy.mjs";

test("permits only the compatibility-proven drained SELECT-only zero-state cell", () => {
  assert.deepEqual(evaluateU04RollbackCell(eligibleCell()), {
    eligible: true,
    action: "PREVIOUS_IMAGE_READ_ONLY_CELL",
    failures: []
  });
});

test("requires forward repair after any U04 state or write-capable prior image", () => {
  const durable = eligibleCell();
  durable.incompatibleU04Rows = 1;
  durable.databaseRole.dml = true;
  durable.pricingRouteBlocked = false;
  const result = evaluateU04RollbackCell(durable);
  assert.equal(result.eligible, false);
  assert.equal(result.action, "FORWARD_REPAIR");
  assert.match(result.failures.join("\n"),
    /incompatible_u04_rows|SELECT-only|pricing and manual/);
});

test("never authorizes destructive recovery", () => {
  const destructive = eligibleCell();
  destructive.downMigration = true;
  destructive.durableReset = true;
  assert.match(evaluateU04RollbackCell(destructive).failures.join("\n"),
    /down migration and durable reset are prohibited/);
});

function eligibleCell() {
  return {
    drained: true,
    readOnly: true,
    catalogHashUnchanged: true,
    flywayHashUnchanged: true,
    dataHashUnchanged: true,
    legacyFixturesBytePreserved: true,
    incompatibleU04Rows: 0,
    pricingRouteBlocked: true,
    manualRoutesBlocked: true,
    databaseRole: { select: true, dml: false, ddl: false },
    downMigration: false,
    durableReset: false
  };
}

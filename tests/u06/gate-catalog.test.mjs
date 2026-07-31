import assert from "node:assert/strict";
import { test } from "node:test";
import { AUDIT_GATES, OWNER_LOCAL_DATABASE_COMMANDS, PRESERVATION_GATES, QUALITY_GATES, STARTUP, SUPPLY_CHAIN_GATES, TEARDOWN, validateManualAuditFinding } from "../../tools/u06/gate-catalog.mjs";

test("startup, owner-local DB, preservation, quality, supply chain, and audit catalogs are closed", () => {
  assert.deepEqual(STARTUP.command, ["node", "scripts/wave-a-compose.mjs", "up", "-d", "--build"]);
  assert.equal(STARTUP.timeoutMs, 600_000); assert.equal(STARTUP.serviceReadinessMs, 120_000);
  assert.match(OWNER_LOCAL_DATABASE_COMMANDS.CHARGE.join(" "), /linercore_pricing/); assert.doesNotMatch(OWNER_LOCAL_DATABASE_COMMANDS.CHARGE.join(" "), /linercore_booking/);
  assert.equal(PRESERVATION_GATES.length, 5); assert.equal(QUALITY_GATES.length, 10); assert.equal(SUPPLY_CHAIN_GATES.length, 5); assert.equal(AUDIT_GATES.length, 4);
  assert.equal(TEARDOWN.optionalCleanup[1], "scripts/wave-a-compose.mjs"); assert.equal(TEARDOWN.managerRepair, false);
});

test("audit detector zero is incomplete without exact manual finding fields", () => {
  const finding = { severity: "HIGH", fileLine: "x.ts:10", scenario: "failure", reviewer: "operator", disposition: "OPEN", completedAt: "2026-07-29T00:00:00Z" };
  assert.equal(validateManualAuditFinding(finding), true);
  assert.equal(validateManualAuditFinding({ ...finding, reviewer: "" }), false);
});

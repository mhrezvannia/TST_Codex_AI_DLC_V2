export function evaluateU04RollbackCell(cell) {
  const failures = [];
  if (!cell?.drained) failures.push("cell must be drained");
  if (!cell?.readOnly) failures.push("previous image must be read-only");
  if (!cell?.catalogHashUnchanged || !cell?.flywayHashUnchanged || !cell?.dataHashUnchanged) {
    failures.push("catalog, Flyway, and canonical data hashes must be unchanged");
  }
  if (!cell?.legacyFixturesBytePreserved) {
    failures.push("legacy receipt/case fixtures must be byte-preserved");
  }
  if (cell?.incompatibleU04Rows !== 0) {
    failures.push("incompatible_u04_rows must equal zero");
  }
  if (!cell?.pricingRouteBlocked || !cell?.manualRoutesBlocked) {
    failures.push("pricing and manual mutation routes must be blocked");
  }
  if (!cell?.databaseRole?.select || cell?.databaseRole?.dml || cell?.databaseRole?.ddl) {
    failures.push("database role must be SELECT-only with no DML/DDL");
  }
  if (cell?.downMigration || cell?.durableReset) {
    failures.push("down migration and durable reset are prohibited");
  }
  return Object.freeze({
    eligible: failures.length === 0,
    action: failures.length === 0 ? "PREVIOUS_IMAGE_READ_ONLY_CELL" : "FORWARD_REPAIR",
    failures
  });
}

export function evaluateU05Rollback(cell) {
  const failures = [];
  if (!cell?.drained) failures.push("runtime must be drained");
  if (!cell?.readOnly) failures.push("previous image must be read-only");
  if (!cell?.validateOnly) failures.push("schema access must be validate-only");
  if (!cell?.catalogHashUnchanged || !cell?.flywayHashUnchanged || !cell?.dataHashUnchanged) {
    failures.push("catalog, Flyway, and data hashes must be unchanged");
  }
  if (!cell?.legacyFixturesBytePreserved) failures.push("legacy fixtures must be byte-preserved");
  if (cell?.incompatibleU05Rows !== 0) failures.push("incompatible_u05_rows must equal zero");
  if (!cell?.databaseRole?.select || cell?.databaseRole?.dml || cell?.databaseRole?.ddl) {
    failures.push("database role must be SELECT-only");
  }
  if (cell?.downMigration || cell?.durableReset) failures.push("down migration/reset is prohibited");
  return {
    eligible: failures.length === 0,
    action: failures.length === 0 ? "PREVIOUS_IMAGE_READ_ONLY_CELL" : "FORWARD_REPAIR",
    failures
  };
}

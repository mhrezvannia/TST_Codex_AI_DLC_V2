# W2-03 owner-local database evidence

Observed: 2026-08-02 on isolated Compose project `linercore-wave-a`.

This is supporting evidence only. It does not replace the closed 120-cell U06 acceptance manifest.

## Migration probes

- Charge database `linercore_pricing` reached Flyway V5 with a stable restart catalog. The probe attempted to mutate an approved agreement-version snapshot; PostgreSQL rejected the update and the before/after row hashes were equal. Result: PASS.
- Booking database `linercore_booking` reached Flyway V4 with a stable restart catalog. The probe attempted to mutate a stored booking pricing snapshot; PostgreSQL rejected the update and the before/after row hashes were equal. Result: PASS.
- Existing Charge legacy-row fingerprint remained stable and no legacy agreement acquired invented rate links.
- Existing Booking legacy-snapshot fingerprint remained stable.

## Restore probes

- Charge backup was restored to a generated `w203_restore_charge_*` database, verified by distinct database OID, owner marker, and catalog hash, then removed. Result: PASS.
- Booking backup was restored to a generated `w203_restore_booking_*` database, verified by distinct database OID, owner marker, and catalog hash, then removed. Result: PASS.
- A post-probe catalog query found no remaining `w203_restore_*` databases.

The probes used only `node scripts/wave-a-compose.mjs exec ...` against the isolated Wave A PostgreSQL container. They did not address the manager project or port 8088.

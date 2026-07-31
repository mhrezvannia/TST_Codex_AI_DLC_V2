# Rollback and Recovery Runbook — W2-03

## Scope and prerequisites

This runbook consumes `ci-config`, `quality-gates`, every
`deployment-architecture`, and every `cicd-pipeline`. It applies only to the
isolated `linercore-wave-a` validation deployment. It never authorizes manager
stack changes, production rollback, down migrations, database reset, or
destructive source replacement.

Required evidence before mutation:

- exact candidate commit/image/config/migration hashes;
- passing demo guard and manager inventory/fingerprint;
- owner-separated backup metadata and isolated restore names;
- run ID/owner markers, available disk/resource bounds, and locked evidence
  writer;
- documented `incompatible_u04_rows` and `incompatible_u05_rows` predicates.

## Decision tree

### Failure before any Wave A mutation

Stop. Publish bounded diagnostics. Do not run `up`, restore, cleanup, or retry a
proven capability denial. Re-run only after the missing capability or source
failure is corrected.

### Failure after possible startup/config mutation but before commercial writes

Run the non-short-circuiting recovery lane:

1. stop only wrapper-owned Wave A services;
2. clean only run-owned restore targets/fixtures;
3. query cleanup and database ownership facts;
4. run post-demo guard, inventory, and exact fingerprint comparison;
5. mark validation FAIL/BLOCKED and retain evidence.

A previous stateless image/config may be reselected only if candidate identity,
catalog compatibility, and zero-write facts are proven.

### Failure after W2 migration or commercial write

Do not downgrade. Keep the current compatible schema and perform forward repair.
Do not run down migrations or start an old write-capable image.

If diagnostic restore is required:

1. create an owner-specific isolated target;
2. query source/target/other database OIDs;
3. set and verify the run-owner marker;
4. restore the exact checksummed backup;
5. compare catalogs and selected data hashes;
6. perform read-only diagnosis;
7. drop only the marked isolated target in `finally`;
8. re-query to prove cleanup.

### Compatibility-gated previous image

Use only when the relevant unit's exact predicate proves:

- traffic drained and prior image enforced read-only/validate-only;
- migration/catalog/hash compatibility;
- zero incompatible U04/U05 rows and no post-cutover owner rows;
- SELECT-only behavior and no relay/claimant activation;
- manager and Wave A isolation unchanged.

Any unknown, stale, missing, nonzero, or contradictory fact means
rollback-ineligible and forward repair remains mandatory.

## Verification after recovery

- authenticated health/read probes complete within their bounds;
- no new receipt, manual case, snapshot, activity, outbox, or commercial write
  was produced by a previous image;
- owner restore targets and fixtures are absent;
- Wave A is stopped or intentionally retained as recorded;
- manager demo guard, inventory, ports, volumes, and fingerprint match pre-run;
- ledger/manifest status remains immutable and cannot upgrade a failed run.

## Escalation and evidence

Because no named production operations team or incident roster is approved,
escalate to the W2-03 release-review role and the owning Charge/Booking/data
review hats. Preserve the run ID, commit/build hashes, terminal gate statuses,
bounded redacted logs, catalogs/OIDs/markers, cleanup proof, and manager
comparison. A production escalation path must be defined by a later approved
deployment intent.


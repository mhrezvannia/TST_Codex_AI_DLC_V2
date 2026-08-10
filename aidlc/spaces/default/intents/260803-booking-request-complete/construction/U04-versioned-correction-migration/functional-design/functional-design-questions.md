# U04 Versioned Correction and Migration - Functional Design Questions

## Context and Authority

These questions apply only to `U04-versioned-correction-migration`. They consume the approved `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, U01-U03 Functional Design, and the binding Refined Mockups artifacts.

U04 owns additive snapshot-v2 compatibility, deterministic v0/v1 upcast, rebuildable projections, the restartable migration ledger/backfill, and authorized same-record full-replacement correction at an expected revision. U05 still owns current-revision reference validation, U06 owns pricing currency/recovery, and U08 owns final one-next-action convergence.

Code-graph inspection confirms that the current `BookingSnapshotCodec` detects canonical JSON only by `routing`/`equipment`, writes no JSON `schemaVersion`, and preserves legacy values in `Map<String,String> attributes`; `JdbcBookingRepository.save` writes row `snapshot_version = 2` through an unconditional upsert without an optimistic `WHERE revision = expectedRevision`; `Booking.pricingInputsAmended` already distinguishes pricing-basis changes; and `BookingFlywayMigrationStrategy` baselines only an exact legacy catalog. U04 must extend those seams rather than create a parallel repository, codec, or correction aggregate.

UI authority remains the approved W3-04 requirements and security/accessibility standards, LinerCore `MASTER.md` and executable `@erp/ui`, approved Refined Mockups, then advisory UI/UX Pro Max output. The correction page reuses the one Booking-owned five-group form; it does not create a migration console, alternate shell, local primitive, theme, or second correction composition.

## Questions

### Q1. How should the codec identify snapshot versions and preserve unmapped legacy attributes?

- A. Treat missing `schemaVersion` without canonical `routing`/`equipment` as v0 and missing `schemaVersion` with them as v1; require both row `snapshot_version = 2` and JSON `schemaVersion: 2` for new writes and fail closed if they disagree or a future version is unknown. Preserve unmapped legacy string attributes exactly in a bounded internal `legacyExtensions` namespace that is never flattened into canonical fields, returned as authority, or logged (recommended)
- B. Trust only the relational `snapshot_version` column and keep new JSON unversioned
- C. Drop unmapped legacy attributes after extracting known fields
- X. Other (please specify)

[Answer]:

### Q2. What presence/null contract should the full-replacement correction command enforce?

- A. Require the closed canonical field dictionary on every PUT: all known semantic keys are present, absent optional values are explicit JSON null, and governed references use their typed identity/version shapes. Reject missing properties, ambiguous empty strings, unknown business fields, or partial-patch semantics before mutation; never infer omitted values from the prior revision (recommended)
- B. Treat any omitted property as "keep the previous value"
- C. Treat every omitted optional property as null but preserve omitted required properties from the prior revision
- X. Other (please specify)

[Answer]:

### Q3. What happens to validation, schedule, and price evidence after a successful correction?

- A. Every correction creates a new revision and therefore makes U05 validation non-current. Apply the approved U03 schedule decision table: only the exact unchanged non-legacy schedule tuple may be carried byte-for-byte during provider unavailability. Preserve immutable prior price evidence only when its exact pricing fingerprint is unchanged, without claiming confirmation eligibility; a changed pricing fingerprint marks it historical and `REPRICE_REQUIRED`. Confirmation eligibility is always cleared until downstream currentness is re-established (recommended)
- B. Keep all prior validation, schedule, and price evidence current whenever the operator changes only optional fields
- C. Delete all historical evidence on every correction, even when its basis is unchanged
- X. Other (please specify)

[Answer]:

### Q4. How should backfill concurrency, revision, and ledger identity work?

- A. Treat backfill as representation maintenance, not a business correction: do not increment the Booking business revision. For each row, bind the attempt to `(bookingId, sourceRevision, sourceDigest, sourceVersion, targetVersion)`, conditionally write v2 snapshot plus projection and ledger in one record transaction, and mutate nothing on baseline drift. `MIGRATED` and `INCOMPLETE` are stable terminal outcomes for that baseline; `CONFLICT` and `FAILED_SAFE` retain safe attempt evidence and may be retried only against a newly verified/current baseline or after the failure cause is fixed (recommended)
- B. Increment the Booking revision for every successful backfill row
- C. Let the backfill overwrite a concurrently corrected row and rely on the next run to repair it
- X. Other (please specify)

[Answer]:

### Q5. How should the correction UI recover from an optimistic revision conflict?

- A. Return 409 with safe latest revision metadata, keep the complete local form buffer, and render the shared `ConflictStrip` with group-level change context only. Refresh latest into a separate server baseline; never auto-merge. The operator explicitly chooses to reapply the buffered changes, which reruns dependent validation and submits a new operation identity bound to the latest expected revision; Cancel restores the canonical detail context (recommended)
- B. Automatically merge local and server values and resubmit without another user action
- C. Discard the local buffer and reload the latest record immediately
- X. Other (please specify)

[Answer]:

## Ambiguity Check

Awaiting answers. Artifact generation must not choose snapshot mismatch behavior, replacement presence semantics, evidence currency, migration concurrency, or conflict recovery implicitly.

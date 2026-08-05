# Infrastructure Services — U06 Isolated Acceptance and Preservation

## Inputs and service posture

This artifact consumes `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`.

U06 provisions no always-on infrastructure. It orchestrates the existing Wave
A nginx/apps/services/PostgreSQL/Kafka/Schema Registry/observability stack and
uses project-local filesystem evidence plus temporary isolated restore DBs.

## Wrapper and discovery

The Wave A wrapper is the sole mutable infrastructure API. Compose DNS remains
service discovery; browser evidence uses nginx 18088; owner-local diagnostic
queries use wrapper exec and service-specific roles. No cross-database join,
direct browser service port, or manager resource is permitted.

Readiness adapters require health plus an authenticated semantic probe. A
missing Identity, Reference, Charge, Booking, browser, shared UI, or
observability capability is BLOCKED rather than mocked or skipped.

## Evidence and trace services

The artifact writer, framed ledger, manifest compiler, redaction scanner, and
report renderer are local non-deployable modules. Raw Playwright ZIPs live only
in restricted temporary storage outside the evidence root. Every entry is
parsed/sanitized, deterministically recompressed, expanded, and rescanned.
Unknown/encrypted/corrupt/unsafe content blocks the cell; raw and unsafe
sanitized archives are never indexed.

One ordered writer streams JSONL; CSV and summaries derive from final JSONL.
Artifacts are hash-addressed by the ledger and immutable after commit. Prior
wave manifests/waiver are read-only hashed inputs.

## Closed registry service

`acceptance-registry.json` contains exact counts: preservation 5, security 6,
commercial 13, browser structural 40, browser functional state 33, design
dependencies 3, observability 6, quality 10, and audit 4, plus ten owned route
patterns and five edge regressions. Every known ID appears exactly once with
PASS/FAIL/BLOCKED/SKIPPED, artifact hashes, and required scenario/correlation
links. Unknown, duplicate, absent, dangling, or illegal SKIPPED results fail.

### Exact registry membership

Security membership is:

| ID | Executable scenario |
| --- | --- |
| SEC-U06-001 | signed-session allowed Charge and Booking actions |
| SEC-U06-002 | denied human before existence/count/disclosure/write |
| SEC-U06-003 | spoofed browser actor/capability/service headers ignored/rejected |
| SEC-U06-004 | missing Booking-to-Charge identity or permission |
| SEC-U06-005 | missing required nonlocal secret fails readiness |
| SEC-U06-006 | nonlocal bypass/profile attempt fails closed |

Functional-state IDs use uppercase
`STATE-<FAMILY>-<STATE>` and are exactly:

- LIST_FILTER: LOADING, POPULATED, EMPTY, BACKEND_ERROR, FORBIDDEN;
- CREATE_EDIT: PRISTINE, INVALID_SUMMARY_FOCUS, REFERENCE_LOADING_ERROR,
  DIRTY_NAVIGATION, OPTIMISTIC_CONFLICT, DENIED;
- DETAIL_LIFECYCLE: DRAFT, APPROVED_IMMUTABLE, HISTORY,
  APPROVAL_PENDING_SUCCESS_CONFLICT, DIALOG_ESCAPE, DIALOG_TAB_RESTORE;
- MANUAL_EVIDENCE: OPEN_RESULT, NO_AMOUNT_TOTAL, EMPTY,
  DENIED_NO_DISCLOSURE;
- BOOKING_PRICING: FIRST_PRICE, AGREEMENT_RESULT, TARIFF_RESULT,
  REPRICE_CURRENT_PRIOR, LEGACY_EVIDENCE, NO_RATE, AMBIGUITY, OUTAGE,
  CIRCUIT_OPEN, MALFORMED, CONFLICT, IN_PROGRESS.

Structural IDs are exactly
`STRUCT-<LIST_FILTER|CREATE_EDIT|DETAIL_LIFECYCLE|MANUAL_EVIDENCE|BOOKING_PRICING>-<375|768|1024|1440>-<LIGHT|DARK>`,
whose Cartesian product is 40.

The ten owned route values are `/charge-agreements`,
`/charge-agreements/new`, `/charge-agreements/[agreementId]`,
`/charge-agreements/[agreementId]/edit`, `/charge-agreements/rates`,
`/charge-agreements/rates/new`, `/charge-agreements/rates/[rateId]`,
that rate detail with `?mode=edit`, `/charge-agreements/manual-pricing`, and
`/booking/[id]`. The five edge regressions are `/`, `/auth`,
`/reference-data`, `/booking`, and `/bookings`.

Other literal members are:

- preservation: W0-01, W0-02, W1-01, W2-01, W2-02;
- commercial: AGREEMENT_PRICE, TARIFF_FALLBACK, SUCCESSOR_REPRICE, NO_RATE,
  AMBIGUITY_AGREEMENT, AMBIGUITY_BASE, AMBIGUITY_SURCHARGE, AMBIGUITY_LOCAL,
  OUTAGE_TIMEOUT, OUTAGE_503, OUTAGE_CIRCUIT, CHARGE_DISABLED,
  RECONFIRM_NO_CHARGE;
- design: DS-01, DS-02, DS-03;
- observability: LATENCY, TERMINAL_OUTCOME, BASIS, MANUAL_FALLBACK,
  REPLAY_CONFLICT, REDACTION;
- quality: BACKEND, FRONTEND, CONTRACT, MIGRATION, COVERAGE, NGINX,
  PLAYWRIGHT, PERFORMANCE, RESTART_RESTORE, GIT_DIFF;
- audit: AIDLC_DETECTOR, AIDLC_MANUAL, ERP_FIDELITY_DETECTOR,
  ERP_FIDELITY_MANUAL.

These IDs are literal members, not ranges. Each registry
member declares `dependsOn`, required route/scenario, artifact kinds, and
correlation requirement. SKIPPED is legal only when an earlier `dependsOn`
ledger result is FAILED/BLOCKED; it must link that terminal record. Security,
commercial, observability, and functional live states require a scenario and
safe correlation; structural/quality/audit cells require their declared
artifact hashes.

## Database and recovery services

Charge and Booking are dumped/queried independently with bounded redacted
owner-local queries. Separate `w203_restore_charge_*` and
`w203_restore_booking_*` targets carry separate source/target OIDs, owner
roles/markers, backup mappings, manifest records, and cleanup records; both use
administrative database `postgres`. Catalog, Flyway, row counts, canonical
hashes, legacy decode, receipts/cases/snapshots/activity/outbox, and
authenticated probes are verified. Applied migrations are never edited/down.

## Ownership

U01–U05 own application schemas/behavior and provide recovery/probe contracts;
U06 owns integrated evidence orchestration, registry, ledger, restore target
safety, manifest, and manager comparison. W2-02 owns shell/shared UI/nginx.
U06 may observe but never modify those ownership boundaries.

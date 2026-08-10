# RAID Log - W1-01 Booking Quote-to-Cash

## Source Trace

This RAID log operationalizes risks and dependencies from `ideation/intent-capture/intent-statement.md`, `ideation/market-research/competitive-analysis.md`, `ideation/market-research/market-trends.md`, and `ideation/market-research/build-vs-buy.md`.

## Risks

| ID | Risk | Likelihood | Impact | Treatment | Owner | Closure evidence |
|---|---|---:|---:|---|---|---|
| R-01 | Existing JSON Booking snapshots fail after typed routing/equipment migration | High | High | Add legacy fixture/upcaster or deterministic migration before model cutover | Booking | Old-record migration integration test |
| R-02 | Domain, Avro, mapper, consumer, and UI field names drift again | Medium | Critical | Make `.avsc` authoritative; add serde, mapping, and fidelity tests | Booking + CMM | Contract-exact tests and topic payload |
| R-03 | New consumers acknowledge before local transaction commits | Medium | Critical | Transactional consumer application methods; commit-aware acknowledgement and retry | Booking + CMM | Forced rollback/redelivery test |
| R-04 | Temporary HTTP plus Kafka delivery becomes permanent dual delivery | Medium | High | Sequence Kafka proof then delete live HTTP calls/config; detector prevents reintroduction | Booking Driver | Source audit and CMM outage confirmation test |
| R-05 | Status dedupe state and Booking projection diverge | High | High | Add `@Transactional` boundary and use envelope ID as canonical dedupe key | Booking | Duplicate/stale event integration tests |
| R-06 | CMM journey model cannot represent routing/equipment arrays cleanly | Medium | High | Design explicit reconciliation from full Booking revision; keep one-leg scope first | CMM | Revision/upsert tests and persisted journey proof |
| R-07 | Incomplete Booking frontend baseline expands UI work unexpectedly | High | Medium | Restore BFF/page/test baseline first; build list/detail incrementally with API | Booking UI | Build, tests, browser proof |
| R-08 | Reference codes used by fixtures do not match W0-02 seeds | Medium | Medium | Build proof fixtures from live seeded IDs/codes and validate all references | Booking + Platform | Create/validate proof responses |
| R-09 | Local Docker resource or image issue blocks live proof | Low | High | Reuse pulled images, monitor disk, capture exact blocker, never substitute host-only proof | Driver | Compose `ps`, logs, and evidence summary |
| R-10 | Scope expands into D&D, auth, shell, design-system, or amendments | Medium | High | Enforce named deferred intents and changed-file review at each gate | Driver | Backlog trace and audit |

## Assumptions

| ID | Assumption | Confidence | Validation | Consequence if false |
|---|---|---:|---|---|
| A-01 | W0 shared relay remains compatible with revised event records | High | Existing W0 live proof plus W1 serde/integration test | Messaging design must be corrected before consumer work |
| A-02 | W0-02 seeded reference sets cover the thin booking fixture | High | Live summary and validation endpoint check | Add a closed precursor rather than stubbing data |
| A-03 | Existing Charge endpoint can price the one-leg/one-line booking after mapping updates | Medium | Consumer/provider test and live quote | Coordinate provider change inside Charge ownership boundary |
| A-04 | PostgreSQL JSON snapshots can be migrated/upcast without loss | Medium | Legacy snapshot fixture test | Rework persistence plan; do not drop records |
| A-05 | One local Kafka partition strategy can prove ordering semantics | High | Topic/config inspection and ordered redelivery test | Adjust partition key/config before exit |
| A-06 | Customer/booking references are sufficient for W1 events without PII | High | Contract payload review | Conduct a focused privacy review before adding fields |

## Issues

| ID | Current issue | Severity | Immediate action | Owner |
|---|---|---:|---|---|
| I-01 | `booking.confirmed.avsc` uses flat pre-contract names | Critical | Replace schema and mapper/serde/consumer fixtures together | Booking |
| I-02 | `containermovement.status.avsc` diverges from the frozen contract vocabulary | Critical | Reconcile schema and producer/consumer domain mappings | CMM + Booking |
| I-03 | Both event directions still call synchronous HTTP clients | Critical | Retain only until Kafka consumers pass, then remove from live controllers/config | Booking + CMM |
| I-04 | No Kafka consumer adapter exists in current service source | Critical | Design and implement consumer configuration, decoding, retry, and application invocation | Booking + CMM + Platform |
| I-05 | Booking status consumption is not transactional | High | Add transaction boundary covering projection and idempotency record | Booking |
| I-06 | Booking frontend imports/references source files absent on this branch | High | Establish a green frontend baseline and restore the minimum app/BFF/test tree | Booking UI |
| I-07 | Booking persistence uses one mutable `booking-schema.sql` rather than a clear versioned migration chain | Medium | Select and document compatible migration mechanism during Application Design | Booking |
| I-08 | Graphify graph is stale around the W0 relay extension and current Booking UI | Medium | Update graph after major W1 code/doc changes; use source evidence meanwhile | Driver |

## Dependencies

| ID | Dependency | Type | Status | Owner | Proof / next action |
|---|---|---|---|---|---|
| D-01 | W0-01 real Kafka, Schema Registry, relay, and scheduler | Internal prerequisite | Closed | Shared Platform | `artifacts/w0-01-live/` |
| D-02 | W0-02 vessel/voyage, equipment type, and charge code references | Internal prerequisite | Closed | Shared Platform | `artifacts/w0-02-live/live-proof-summary.json` |
| D-03 | Booking/Charge pricing contract and live provider | Cross-module | Available; mapping requires W1 verification | Charge | Provider and live quote evidence |
| D-04 | Booking-confirmed producer/consumer contract approval | Governance | Required | Booking + CMM | Contract review and executable message tests |
| D-05 | Movement-status producer/consumer contract approval | Governance | Required | CMM + Booking | Contract review and executable message tests |
| D-06 | Local Docker daemon, cached images, and available disk | Environment | Previously proven | Driver | Preflight and Compose startup |
| D-07 | Future production geography and regulatory classification | External/program | Unknown; not local blocker | Program owner | Resolve before production deployment |

## RAID Review Cadence

Review this log at Scope Definition, Application Design, each construction unit gate, and before the live exit run. Any Critical issue remains release-blocking until its closure evidence is linked from the W1 evidence bundle.

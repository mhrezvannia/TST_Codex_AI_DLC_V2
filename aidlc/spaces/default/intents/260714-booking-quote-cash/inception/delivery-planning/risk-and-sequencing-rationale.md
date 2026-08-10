# Risk and Sequencing Rationale - W1-01 Booking Quote-to-Cash

## Decision

Use a hybrid walking-skeleton-first and risk-first sequence. B01 is fixed by the affirmed walking-skeleton practice and bundles the dependent U01-U05 chain so the first gate observes the real bidirectional Kafka journey. B02 then attacks replay/migration/restart failure risk. B03 converts the proven behavior into repeatable release evidence. The plan uses Reinertsen/WSJF-style economic dimensions qualitatively because no defensible dollar value, time-cost, or numeric job-size inputs were supplied.

## Ordinal Comparison

| Bolt | User/business value | Time criticality | Risk reduction/opportunity enablement | Relative size | Sequence rationale |
|---|---|---|---|---|---|
| B01 | Highest: delivers the minimum user journey | Highest: blocks all W1 value and downstream proof | Highest: schemas, migrations, Charge, consumers, transactions, UI | XL | Mandatory first gate despite size; delaying it would let integration risk accumulate. |
| B02 | High: protects persisted customer-service outcome | High: required before credible release proof | High: duplicate/stale/rollback/restart failure modes | L | Small high-risk closure immediately after the happy-path skeleton. |
| B03 | High: supplies merge confidence and auditability | High at release boundary | Medium-high: catches quality/performance/runtime drift | M | Requires working and resilient journey; finishing earlier would produce proxy evidence. |

No numeric WSJF score is reported because invented numbers would add precision without economic evidence. The ordinal result is stable under reasonable weighting: B01 is practice-mandated and enabling, B02 has high risk reduction at smaller size, and B03 depends on both.

## Risk Register by Bolt

| Risk | Earliest Bolt | Treatment | Closure evidence |
|---|---|---|---|
| Existing flat local Schema Registry subjects conflict with canonical nested v1 | B01 | Execute approved disposable-local export/delete/re-register procedure; block non-local fingerprints | Subject export, fingerprints, compatibility/result files |
| Booking snapshot/schema migration loses W0 data | B01 | V1 baseline + additive V2, captured fixture, backfill/checksum/restart | Flyway history, row/business-key preservation |
| Pricing contract/provider drift or idempotency race | B01 | Frozen OpenAPI/Pact, fenced claim/CAS, live agreement/NO_RATE | Provider tests, concurrent request evidence, persisted immutable result |
| Consumer acknowledgement creates receipt-only or state-only partial writes | B01/B02 | One transactional application method, rollback tests, redelivery | Injected failure and transaction state evidence |
| Duplicate/stale/out-of-order events corrupt journey/projection | B02 | Receipt PKs, revision/order guards, identity-preserving replay | Topic replay and unchanged logical row counts |
| UI shows success before real broker/database outcome | B01/B03 | Pending/poll/retry states, no-noop guard, browser-to-topic/database trace | Screenshots/interactions plus exact records/rows |
| Local environment masks missing Docker/images/disk/ports/seeds | B01 | Preflight and explicit BLOCKED classification | Preflight JSON/log and health/seed checks |
| Performance sample hides errors or cold-start effects | B03 | Declared warm-up, sample, concurrency, nearest-rank percentile; any error fails | Raw timing/error files and percentile summary |

## Dependency Validation

- B01 contains U01-U05 and executes their hard chain internally; it does not claim partial Unit completion at its gate.
- B02 contains U06 and begins only after U05 is complete.
- B03 contains U07 and begins only after U06 is complete.
- Therefore Bolt order is a valid contraction of the acyclic graph in `unit-of-work-dependency.md`; no topological deviation requires a waiver.

## Rejected Sequences

- Seven one-Unit Bolts were rejected because the affirmed first Bolt must prove the bidirectional path and cannot stop at draft, validation, or pricing.
- Parallel service-first work was rejected because the DAG is a chain, the mob has one active stream, shared contract/catalog files overlap, and integration ownership would be deferred.
- One all-inclusive Bolt was rejected because resilience and release evidence need separate confidence gates after the architecture works.
- Numeric WSJF was rejected because no economic inputs support meaningful scores.
- Production-first or AWS-first sequencing was rejected because W1's authoritative environment is local Compose and production deployment is out of scope.

## Source Coverage

The rationale weighs acceptance in `requirements.md`, story value/prerequisites in `stories.md`, visible states in `mockups.md`, ownership/blast radius in `components.md`, vertical DoDs in `unit-of-work.md`, hard topology in `unit-of-work-dependency.md`, exact story mapping in `unit-of-work-story-map.md`, and mandatory walking-skeleton/deployment rules in `team-practices.md`.

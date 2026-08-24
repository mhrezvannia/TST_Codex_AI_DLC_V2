# Scalability Requirements - U02 Reference Data Operational Completion

## Source Alignment

Per the answered Q2, this artifact records **local acceptance capacity only**. Bounded surfaces come from this unit's `business-logic-model.md` (the completed read workflow and the form catalog workflow) and `business-rules.md` (BR2-011 through BR2-013 query rules, BR2-020 through BR2-021 catalog rules). It is constrained by `requirements.md` NFR-001 and NFR-012 and by `technology-stack.md`, which states that static evidence does not justify claims about a public-cloud runtime, production orchestration, autoscaling, or a managed database.

## Acceptance Capacity

| Dimension | Value | Source |
| --- | --- | --- |
| Concurrent local users | 10, warmed | NFR-001 |
| Acceptance topology | isolated `linercore-wave-a` Compose project | NFR-012 |
| Record list page size | 25, 50, or 100 | BR2-011 |
| Record list filter | `includeInactive` only | BR2-011 |
| Bounded option sources | existing REGION and VESSEL_VOYAGE/LOCATION record-list reads for TRADE_LANE and VOYAGE selectors | U02 form catalog |
| Concurrent writers assumed | none — no write-contention target is set | this artifact |

These are acceptance parameters, not capacity planning.

## Bounded-Growth Properties

- **List cost is bounded by page size, not by set population.** Provider paging and fixed provider order hold; search, selectable sort, client filtering, and client page merging do not exist (BR2-013), so a large set never becomes client work.
- **The form catalog is compile-time.** `ReferenceFormCatalogV1` is build-time data, not a runtime schema fetch, so form derivation adds no per-request I/O and does not scale with set size. U02 explicitly removed the runtime field-schema endpoint that would have.
- **Canonical selectors are bounded reads.** TRADE_LANE and VOYAGE selectors use existing bounded record-list reads rather than unbounded option fetches.
- **History is a scoped facet.** A large or slow history degrades its own panel rather than the record, so history growth cannot make the detail route fail.
- **No aggregation anywhere.** U02 adds no cache, no BFF persistence, no draft database, and no client store of provider truth.

## Write-Path Capacity

U02 sets **no** write throughput, write concurrency, or contention target. Its concurrency requirement is a correctness property, not a capacity one: an update carries the exact provider version and a mismatch produces an explicit reconciliation rather than a lost update (BR2-031, BR2-032). Whether two operators can edit the same record simultaneously is answered by "safely, with one of them reconciling" — not by a throughput figure.

Provider-side uniqueness checking, validation, and optimistic-concurrency enforcement are Reference-service costs U02 does not own and sets no target for.

## Explicit Non-Claims

No production load projection, growth model, capacity plan, scaling trigger, autoscaling policy, replica count, connection-pool sizing, cache sizing, or multi-instance topology. Per `technology-stack.md`, PostgreSQL, Node.js, Yarn, and browser-runtime versions were not retained in the developer scan, so no capacity characteristic is inferred from them. Per NFR-012, no production hosting, availability, cadence, backup, recovery, or cloud claim is made.

## Verification

The warmed ten-user sample at Build and Test verifies the acceptance capacity above. Page-size enumeration, filter allow-listing, and catalog fixture parity are verified by the contract tests already required in `business-rules.md` §Rule Verification. Per NFR-011 an untested headroom assumption is not evidence and is not recorded here as one.

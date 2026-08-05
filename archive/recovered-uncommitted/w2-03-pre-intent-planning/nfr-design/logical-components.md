# Logical Components - W2-03 Charge Tariffs and Agreements

## Upstream Coverage

This aggregate design consumes every unit's `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. It supersedes the older layer-only interpretation for this stage while retaining those unit files as historical detail.

## Component Inventory

| Component | Responsibility | Failure domain | Units carrying the change |
| --- | --- | --- | --- |
| Rate Authority Domain | `Tariff`, `Surcharge`, `LocalCharge`, immutable versions, match keys, money, effective windows | Pure domain module | U02, U03 |
| Agreement Version Domain | Draft/approved versions and explicit bindings to rate versions | Pure domain module | U02, U03 |
| Quote Engine | Resolve authority, calculate itemised lines, total, and manual outcome | Application service | U03 |
| Rate and Agreement Repository | Persist immutable versions, bindings, idempotency claims, pricing snapshots, and outbox rows | Charge PostgreSQL schema | U04 |
| Charge Admin and Pricing API | CRUD/approval plus contract-true `/pricing-requests` | Charge container/API | U05, U09 |
| Charge Workbench | Maintain each rate category, bind/approve agreement versions, preview quote evidence | Charge UI/BFF | U06 |
| Reference Adapter | Read stable charge-code, currency, location, trade-lane, equipment-type, and customer IDs | Shared Platform HTTP boundary | U07 |
| Agreement/Rate Outbox | Publish approved version facts without coupling quote completion to Kafka | Messaging boundary | U10 |
| Booking Pricing Consumer | Send the frozen request and persist the returned itemised snapshot | Booking-owned boundary | U09 |
| Live Acceptance Harness | Seed, drive, reprice, no-match, restart, audit, and evidence capture | Local Compose stack | U01, U08 |

## Dependency Direction

The Rate Authority and Agreement Version domains have no framework dependencies. The Quote Engine depends on domain types and application ports. Persistence, HTTP, Shared Platform, messaging, and UI are adapters. Booking consumes the frozen contract and never reads Charge tables. Charge does not query Booking or Container Movement data stores.

## Pricing Flow

1. A pricing analyst creates versioned tariff, surcharge, and local-charge records using Shared Platform identifiers.
2. The analyst creates a new agreement version, binds exact rate versions, and approves it.
3. Booking sends the frozen `pricing.request` with idempotency key, authenticated service subject, and correlation ID.
4. The Quote Engine resolves one active agreement authority for party, date, lane, and equipment type.
5. The engine emits separate `FREIGHT`, `SURCHARGE`, and `LOCAL` lines, calculates the USD total, and persists the exact authority snapshot.
6. Booking stores the returned `pricing.result`; an unmatched lane/equipment combination follows `MANUAL_PRICING_REQUIRED`.
7. A later approved rate version affects a new reprice only; the earlier snapshot remains reconstructable.

## Failure Domains and Blast Radius

| Failure | Containment |
| --- | --- |
| Shared Platform unavailable | Blocks new/edited reference validation; existing validated rates can still price |
| Charge database unavailable | Pricing fails transiently and administration becomes unavailable; Booking does not fabricate a quote |
| Kafka unavailable | Outbox accumulates; pricing and administration remain durable |
| Charge UI unavailable | API pricing remains available |
| Booking unavailable | Charge administration remains available; no cross-database cleanup is required |
| One invalid/ambiguous rate key | Only matching requests fail/manual; unrelated lanes remain priceable |

## Implementation and Acceptance Boundaries

The old U02-U07 layer sequence is not sufficient as independent done evidence. Each implementation increment must carry its required domain, migration, API, UI, contract test, and live proof together. W2-03 is not complete until the live Compose stack demonstrates create rates, approve linked agreement, price one Booking with matching itemised lines, change a rate and reprice, exercise the no-rate path, and pass `aidlc-audit` plus `erp-fidelity-audit`.

## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-07-25T21:27:42Z
**Iteration:** 2

### Findings

| # | Severity | Location | Finding | Recommendation |
| --- | --- | --- | --- | --- |
| 1 | Minor | Existing U02-U10 NFR files | Historical unit files retain the earlier layer-oriented scope and shallow inline READY notes. | Treat this aggregate design as authoritative and replace layer-only implementation batching with vertical increments during delivery/code planning. |
| 2 | Minor | Performance budget | The 800 ms p99 remains provisional in the bilateral contract. | Measure it on the live stack and reconcile before release without weakening correctness. |

### Validation Tool Results

| Tool | Result | Interpretation |
| --- | --- | --- |
| codebase-memory architecture/search | PASS with gap found | Existing pricing seam and snapshot types are present; `Tariff`, `Surcharge`, and `LocalCharge` domain classes are absent, so the design makes their ownership explicit. |
| Graphify query | PASS | Traversal connected agreement lifecycle, pricing request/result, Booking stories, and versioning; it confirmed the cross-module path to preserve. |
| Required-section/upstream shape inspection | PASS | All five aggregate outputs have multiple H2 sections and name all six declared upstream artifacts. |

### Summary

Iteration 1 found a critical scope mismatch between the historical agreement-only design and W2-03. The aggregate remediation now defines implementable monetary authority, versioning, failure isolation, contract, and live-acceptance boundaries; remaining findings are non-blocking delivery hygiene.

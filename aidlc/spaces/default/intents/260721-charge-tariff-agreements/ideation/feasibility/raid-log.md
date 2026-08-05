# RAID Log - W2-03 Charge Tariffs & Agreements

This log tracks feasibility concerns derived from the [`intent-statement.md`](../intent-capture/intent-statement.md), [`competitive-analysis.md`](../market-research/competitive-analysis.md), [`market-trends.md`](../market-research/market-trends.md), and [`build-vs-buy.md`](../market-research/build-vs-buy.md).

## Risks

| ID | Risk | Likelihood | Impact | Treatment and closure evidence |
|---|---|---:|---:|---|
| R-01 | Rate/agreement version semantics permit retroactive mutation or ambiguous provenance | Medium | High | Immutable approved versions, effective-date validation, additive migrations, audit and reprice tests |
| R-02 | Provider/consumer contract drift breaks Booking or changes historical W1 behavior | Medium | High | Synchronized OpenAPI/examples/provider/consumer tests and cross-module review |
| R-03 | No-rate is mistaken for zero/partial pricing or transient failure | Medium | High | Typed manual result, persisted manual case, Booking `MANUAL_PRICING_REQUIRED`, focal live proof |
| R-04 | Repricing overwrites the original Booking snapshot | Medium | High | Amendment-sequence idempotency and immutable prior/new snapshot assertions |
| R-05 | Charge UI expands into shell/design-system ownership or duplicates a canonical frontend | Medium | Medium | Charge-only routes, `ui-ux-pro-max`, master/session constraints, diff review |
| R-06 | Live acceptance accidentally targets the manager demo on port 8088 | Low | Critical | `npm run demo:guard`, Wave A wrapper only, project-name/port assertions, before/after guard |
| R-07 | Current sandbox cannot access Docker, preventing required acceptance evidence | High now | High | Run final acceptance in an authorized Docker-capable environment; do not claim pass beforehand |
| R-08 | Commercial or actor data is overexposed in logs/UI | Medium | High | Role-based views, authenticated subject propagation, minimization, safe structured logging |

## Assumptions

| ID | Assumption | Validation |
|---|---|---|
| A-01 | The common Wave A baseline and current branch preserve the merged W0/W1/W2 seams | Baseline/ancestry check plus regression suite |
| A-02 | W0-02 reference identities for OFR, BAF, THC, USD, locations, equipment, and trade lanes remain valid | Live reference-data lookup and provider validation |
| A-03 | Flat per-container USD is sufficient for the W2-03 thin proof | Requirements approval and acceptance examples |
| A-04 | Existing Charge and Booking ports can evolve additively without a new service | Reverse engineering and contract impact analysis |
| A-05 | No production cloud deployment is required for this intent | Confirmed question answer and project rule; reopen only by approved scope change |

## Issues

| ID | Issue | Status | Required action |
|---|---|---|---|
| I-01 | `npm run demo:guard` and direct Docker inspection fail in this sandbox due Docker process/pipe access | Open | Obtain an authorized Docker-capable execution environment before live acceptance |
| I-02 | Port 8088 had no observable listener from the available host query, but Docker state was inaccessible | Open/unknown | Re-run demo guard and inspect the protected stack from the authorized environment; make no inference of safety from the partial check |
| I-03 | W1 acceptance history contains blocked or waived evidence | Expected historical condition | Preserve it verbatim; append new W2-03 evidence without relabeling history |

## Dependencies

| ID | Dependency | Owner boundary | Readiness condition |
|---|---|---|---|
| D-01 | Shared Platform reference data and stable IDs | W0-02 | Live lookups and validation available in isolated stack |
| D-02 | Charge agreement/pricing service and owned PostgreSQL schema | Charge | Additive versioned commercial model and migrations pass |
| D-03 | Booking pricing port, snapshot persistence, and Booking UI projection | Booking seam | Real itemised result and manual/reprice states observed |
| D-04 | Shared authenticated shell/BFF/identity | W2-01/W2-02 | Subject propagation, roles, shared shell, and UI tokens preserved |
| D-05 | Bilateral OpenAPI/examples/provider-consumer verification | Cross-module contract | Exact fields and failure semantics are synchronized |
| D-06 | Isolated Wave A Compose and Docker-capable runner | Release review | Pre-guard, live proof, post-guard all recorded |
| D-07 | Playwright and audit skills/tools | Quality/release review | Required viewport/state/keyboard evidence and both audits are green |

## Decision Triggers

- Stop and request scope approval if implementation requires D&D, settlement, public tariff distribution, optimization, new shell ownership, or an external pricing authority.
- Stop release acceptance if the manager demo guard fails, the Compose project is not `linercore-wave-a`, live Booking does not retain itemised provenance, or either audit is not green.
- Reopen compliance assessment before production promotion when jurisdiction, residency, retention, or named certification requirements become known.

## Upstream Alignment

The `intent-statement` defines the live vertical slice. `competitive-analysis` and `market-trends` motivate the versioning and operational-exception risks. `build-vs-buy` makes external-suite dependency a future option, not a current RAID prerequisite.

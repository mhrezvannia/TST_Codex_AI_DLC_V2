# Constraint Register - W2-03 Charge Tariffs & Agreements

This register operationalizes constraints from the [`intent-statement.md`](../intent-capture/intent-statement.md), [`competitive-analysis.md`](../market-research/competitive-analysis.md), [`market-trends.md`](../market-research/market-trends.md), and [`build-vs-buy.md`](../market-research/build-vs-buy.md).

## Binding Constraints

| ID | Type | Constraint | Verification |
|---|---|---|---|
| C-01 | Scope | Deliver only tariff, surcharge, local charge, versioned approved agreement, itemised price, repricing, and no-rate manual handling | Trace requirements and stories to the W2-03 statement; reject umbrella additions |
| C-02 | Domain ownership | Charge owns commercial masters and calculation; Booking owns consumed snapshots | Architecture review and no cross-service database access |
| C-03 | Reference data | Use W0-02 stable customer, charge-code, currency, port/location, equipment, commodity, and trade-lane identities | Provider validation and live reference lookup evidence |
| C-04 | Contract | Preserve exact bilateral pricing fields, media type, errors, idempotency, timeout/503/circuit behavior; additive evolution only | OpenAPI/examples plus provider and Booking consumer tests |
| C-05 | Versioning | Approved agreement and effective rate history is immutable; corrections create new versions | Domain tests, migration tests, API proof, audit trail |
| C-06 | Pricing | Use flat per-container USD and itemise OFR, BAF, and THC by category/basis/quantity/amount/currency | Deterministic calculation tests and live known-rate proof |
| C-07 | No rate | Never guess or silently zero a price; return contract-true manual result and project Booking to `MANUAL_PRICING_REQUIRED` | Live no-rate scenario plus persisted manual case and UI evidence |
| C-08 | Repricing | A changed amendment sequence creates a new attributed snapshot without mutating prior snapshots | Booking persistence/API/UI proof across initial price and reprice |
| C-09 | UI ownership | Own Charge pages only; use the shared shell/tokens and record only Charge additions in `pages/charge-and-agreements.md` | Design review and diff boundary check |
| C-10 | Prior waves | Preserve W0-01, W0-02, W1-01, W2-01, W2-02; keep the W1 blocked/waived evidence explicit | Regression gates and evidence review |
| C-11 | Runtime | Use `scripts/wave-a-compose.mjs` and only the `linercore-wave-a` project; protect port 8088 manager demo | Demo guard before/after and Compose project inspection |
| C-12 | Acceptance | Require live Charge-to-Booking evidence, Playwright at 375/768/1024/1440, keyboard/state/theme evidence, `aidlc-audit`, and `erp-fidelity-audit` | Retained artifacts with observed timestamps and outcomes |
| C-13 | Security | Authenticated subject, least privilege, local-only bypass, safe logs, and auditable approval/repricing actions | Authorization tests, runtime evidence, audit review |
| C-14 | Migration | Ordered additive Flyway migration with existing-data upgrade, backfill, restart, and restore or forward-repair evidence | Migration acceptance suite; destructive reset is insufficient |

## Unknown or Deferred Constraints

| ID | Unknown/deferred item | Treatment |
|---|---|---|
| U-01 | Numeric budget, staffing, and deadline | Do not fabricate; plan by vertical risk and relative size |
| U-02 | Production jurisdiction, residency, and retention | Not a local-slice blocker; required before production compliance approval |
| U-03 | AWS accounts, regions, quotas, and IaC | Deferred because canonical W2-03 acceptance is local Compose |
| U-04 | External rate provider or suite | Future approved intent behind a Charge-owned adapter seam |
| U-05 | Advanced rating dimensions and optimization | Explicitly out of W2-03 scope |

## Upstream Coverage

The `intent-statement` is the authority for scope and evidence. `competitive-analysis` and `market-trends` justify effective versioning, additional-charge categories, auditability, repricing, and manual exception handling. `build-vs-buy` constrains the solution to the current LinerCore stack and preserves only a future integration seam.

# Scope Definition - W2-03 Charge Tariffs & Agreements

This boundary refines the approved [`intent-statement.md`](../intent-capture/intent-statement.md) using the conditional viability in [`feasibility-assessment.md`](../feasibility/feasibility-assessment.md) and the binding controls in [`constraint-register.md`](../feasibility/constraint-register.md).

## Scope Outcome

Deliver one production-shaped internal carrier-pricing slice in which an authorized Charge operator maintains effective tariffs, surcharges, local charges, and versioned customer agreements; an approved version becomes the pricing authority; Booking obtains and retains a real itemised result; repricing creates a new attributed snapshot; and an unmatched request becomes an actionable `MANUAL_PRICING_REQUIRED` case. The outcome is complete only with observed isolated Compose, UI, and audit evidence.

## In Scope - Must Have

### Charge commercial authority

- Charge-owned tariff rows for the approved trade-lane by equipment-type slice.
- Distinct `BASE`, `SURCHARGE`, and `LOCAL` categories using OFR, BAF, and THC reference identities.
- Flat per-container USD basis with effective-from/effective-to validity and immutable history.
- Customer-agreement draft, versioning, approval, active lookup, suspension/expiry behavior already required by the seam, and actor/time audit evidence.
- Approved agreement versions reference the exact applicable tariff/surcharge/local-charge versions.
- Authorized Charge operational pages for list/search, create/edit draft, version detail, approve, and applicable-rate visibility.

### Calculation and contract

- Deterministic match on canonical customer, origin, destination, equipment, effective date, quantity, and approved agreement/rate versions.
- Real itemised pricing lines with charge code, category, basis, quantity, amount, currency, total, pricing reference, correlation, and source-version attribution.
- Exact bilateral field names, media type, idempotency, conflict/in-progress, timeout, HTTP 503, circuit-open, validation, and denied semantics.
- A no-match result that records a manual case and returns manual-pricing semantics without guessing, zeroing, or partially pricing.

### Booking consumption

- Booking requests Charge pricing through the existing port and authenticated service boundary.
- Booking persists an immutable price snapshot and displays the itemised breakdown to the operator.
- Repricing uses the next amendment sequence and retains both the prior and new pricing attribution.
- No-rate projects the Booking to `MANUAL_PRICING_REQUIRED` with a visible reason and actionable status.

### Evidence and preservation

- Preserve W0-01, W0-02, W1-01, W2-01, and W2-02 behavior, service ownership, contracts, shell/auth, and design-system foundations.
- Preserve the W1 historical blocked or waived evidence as history; do not relabel it as a pass.
- Use additive Flyway migrations with existing-data upgrade/backfill/restart/forward-repair evidence.
- Use Graphify and codebase-memory for impact analysis and update the graph after material code/document changes.
- Use `ui-ux-pro-max`, the LinerCore master/session contract, and only `design-system/linercore/pages/charge-and-agreements.md` for Charge-specific additions.
- Run `npm run demo:guard` before and after acceptance and use only `scripts/wave-a-compose.mjs` with `linercore-wave-a`.
- Retain known-rate, repricing, no-rate, responsive/keyboard/state/theme Playwright evidence plus green `aidlc-audit` and `erp-fidelity-audit` results.

## Out of Scope - Won't Have This Time

- D&D pricing, invoicing, payment, settlement, accounting, tax, or foreign-exchange conversion.
- Dynamic/yield optimization, rebates, public tariffs, spot marketplaces, customer self-service, or carrier connectivity.
- Commodity/weight/volume/distance scales, reefer/DG dimensions, multi-leg pricing, arbitrary rules engines, or generic RMS breadth.
- External pricing providers, suite procurement/migration, or dual pricing authorities.
- A new service boundary, shared database, cross-module SQL, micro-frontend host, or new identity mechanism.
- Changes to `packages/ui`, the shared shell, navigation, typography, palette, global tokens, or non-Charge pages.
- Rewriting prior-wave modules or evidence to simplify W2-03 acceptance.
- AWS provisioning, account/region design, cloud cost estimates, or production deployment.

## Should and Could Have

There are no separate Should-Have or Could-Have product capabilities in this intent. Convenience filters, bulk import/export, comparison dashboards, and advanced analytics are deferred rather than smuggled into the Must-Have slice. Minor usability improvements may be included only when they use existing shared components, remain Charge-owned, and do not threaten the vertical Definition of Done.

## Value Stream Map

| Step | Operator/system value | Input | Observable output |
|---|---|---|---|
| 1. Maintain commercial data | Charge operator establishes valid owned rates | Stable W0-02 references | Effective OFR/BAF/THC rows with version identity |
| 2. Approve agreement version | Commercial approval makes a specific basis usable | Draft agreement plus rate versions | Immutable approved version and active lookup |
| 3. Price Booking | Booking receives authoritative commercial terms | Customer/lane/equipment/quantity/date | Itemised result and total with provenance |
| 4. Consume snapshot | Booking operator can inspect the actual quote | Pricing result | Persisted Booking breakdown and status |
| 5. Reprice | Changed amendment obtains a new attributable result | Amendment sequence plus changed pricing input | New snapshot; prior snapshot retained |
| 6. Handle no rate | Operator sees an explicit exception rather than a false price | Unmatched lane/equipment/date | Manual case plus `MANUAL_PRICING_REQUIRED` |
| 7. Accept live slice | Release review proves behavior without harming the demo | Isolated Wave A runtime | Guards, Playwright proof, and both audits green |

Text fallback: `owned rates -> approved agreement version -> Charge calculation -> Booking snapshot -> reprice or manual exception -> isolated live acceptance`.

## Dependency and Ownership Boundary

1. W0-02 reference identities and existing auth/BFF are prerequisites, not W2-03-owned redesign targets.
2. Contract/version semantics and ordered migrations precede dependent commercial records.
3. Charge calculation depends on approved agreement and applicable rate versions.
4. Booking projection depends on the real provider result but never reads Charge persistence.
5. Charge and Booking UI proof depends on the shared shell; Charge changes remain in its owned routes/page record.
6. Final acceptance depends on an authorized Docker-capable environment and a passing pre-guard.

## Release Boundary and Success Measures

The release boundary is crossed only when all Must-Have behavior is observed together. Unit tests, static documents, mock screens, hardcoded results, or container startup alone are insufficient. Success is evidenced by:

- one approved agreement producing correct OFR/BAF/THC lines and total in Charge and Booking;
- a reprice producing a new versioned snapshot while retaining the prior one;
- one unmatched request producing a persisted manual case and Booking `MANUAL_PRICING_REQUIRED`;
- exact contract and authorization behavior under happy and degraded paths;
- additive migration proof and prior-wave regression results;
- responsive, keyboard, loading/empty/error/denied, light/dark UI evidence;
- protected port 8088, isolated `linercore-wave-a`, and both audits green.

## Upstream Traceability

The `intent-statement` defines the requested outcome and ownership exclusions. The `feasibility-assessment` establishes that existing Charge and Booking seams make the slice viable but conditions release on live proof. The `constraint-register` supplies the contract, versioning, migration, UI, runtime, security, and prior-wave controls adopted here.

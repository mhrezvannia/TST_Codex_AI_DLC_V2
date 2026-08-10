# Initiative Brief - W2-03 Charge Tariffs & Agreements

This brief compiles the approved [`intent-statement.md`](../intent-capture/intent-statement.md), [`scope-document.md`](../scope-definition/scope-document.md), [`intent-backlog.md`](../scope-definition/intent-backlog.md), [`competitive-analysis.md`](../market-research/competitive-analysis.md), [`feasibility-assessment.md`](../feasibility/feasibility-assessment.md), [`constraint-register.md`](../feasibility/constraint-register.md), [`team-assessment.md`](../team-formation/team-assessment.md), and [`wireframes.md`](../rough-mockups/wireframes.md).

## Decision Requested

Approve a **risk-controlled transition into Inception** for the bounded W2-03 vertical slice. This is not approval of an umbrella Charge redesign, suite procurement, cloud deployment, construction schedule, or release claim.

## Intent and Problem

Charge has agreement lifecycle and Booking pricing seams, but the manager journey still lacks a complete real authority for owned tariff, surcharge, and local-charge versions. Booking must stop consuming hardcoded or opaque price content and instead retain an itemised, attributable result from an approved versioned agreement. Repricing must preserve prior snapshots, and a no-match must become `MANUAL_PRICING_REQUIRED`, never zero, guessed, or partial pricing.

## Validated Outcome

A Pricing Analyst uses Charge-owned pages inside the shared authenticated shell to:

1. create and approve versioned OFR base, BAF surcharge, and POL THC local rate data;
2. create and approve an immutable customer-agreement version linked to those exact rates;
3. drive the existing Booking request into three real itemised lines and a stored Booking-visible snapshot;
4. approve a changed rate, reprice through the next amendment sequence, and retain the earlier snapshot; and
5. observe an unmatched request as a persisted manual case and Booking `MANUAL_PRICING_REQUIRED`.

## Market and Build Decision

The `competitive-analysis` and associated market research confirm effective rates, approved/released agreements, separate additional charges, recalculation, provenance, and manual exceptions as mature operational table stakes. The decision is to build the bounded authority on existing LinerCore seams now. Full RMS/TMS procurement, optimization, broad dimensional rating, public distribution, and external providers remain later approved decisions behind a Charge-owned adapter seam.

## Feasibility and Conditions

The `feasibility-assessment` finds the slice conditionally feasible: existing Charge agreement/pricing APIs, idempotent request handling, manual-case seam, Booking adapter, snapshot path, auth/reference foundations, and shared shell reduce architectural uncertainty.

The `constraint-register` makes these conditions binding:

- additive contract evolution with synchronized Charge-provider and Booking-consumer proof;
- immutable approved rate/agreement versions and attributed repricing snapshots;
- service-owned persistence and ordered Flyway upgrade/backfill/restart/forward-repair evidence;
- W0/W1/W2 preservation, including the explicit W1 blocked/waived history;
- Charge-only UI ownership using the LinerCore master/page record;
- isolated `linercore-wave-a` acceptance through `scripts/wave-a-compose.mjs`;
- `npm run demo:guard` before and after, protecting port 8088;
- live known-rate, reprice, no-rate, Playwright, `aidlc-audit`, and `erp-fidelity-audit` evidence.

Docker access is unavailable in the current sandbox. Inception may proceed; release completion may not be claimed until an authorized Docker-capable environment executes the required proof.

## Scope Boundary

### Must Have

- BASE/OFR and SURCHARGE/BAF by origin + destination + equipment.
- LOCAL/POL THC by origin port + equipment.
- Draft-to-immutable-Approved rate and agreement versions with effective windows.
- Contract-true itemised Charge result, Booking snapshot/breakdown, repricing history, and no-rate manual state.
- Charge-owned stable list/create-edit/detail/manual-evidence routes and minimum existing Booking pricing-region rendering.
- Authorization, audit, responsive/accessibility states, migrations, regression, live Compose, and both audits.

### Won't Have This Time

D&D, settlement, invoicing, FX, tax, optimizer/yield logic, public tariffs, spot marketplace, broad rating dimensions, external provider/suite integration, new service boundaries, shared-shell/navigation/token redesign, `packages/ui` changes, or AWS deployment.

## Concept Visual and UX Direction

The `wireframes` define stable Charge routes for agreements, unified category-aware rate entries, and manual case evidence. Identity/status/actions and commercial provenance precede collapsed audit details. All Charge administration routes hide the journey ribbon. The existing Booking pricing region receives a minimum integration contract without transferring Booking page ownership.

The binding page record is `design-system/linercore/pages/charge-and-agreements.md`. It inherits the shared shell, IBM Plex typography, `@erp/ui` tokens/primitives, semantic states, WCAG 2.1 AA, keyboard/focus behavior, and 375/768/1024/1440 responsive contract.

## Delivery Shape

The `intent-backlog` orders five Must-Have proto-outcomes by walking-skeleton and risk-first value: one real Charge-to-Booking line; full commercial/version administration; complete OFR/BAF/THC calculation; repricing; and no-rate plus release closure. Later Units must remain vertical and allocate shared migration, contract, and page files to one explicit owner.

The `team-assessment` recommends one stream-aligned intent mob with Product, Charge/Booking domain, architecture, backend/data, frontend/UX, quality/contract, security/compliance, and release-review hats. The shape is approved; real assignees, capacity, time zones, competing work, review independence, and Docker acceptance ownership remain unverified.

## Primary Risks and Mitigation

| Risk | Mitigation before release |
|---|---|
| Retroactive version mutation | Immutable Approved versions, new-version correction, domain/migration/audit tests |
| Contract drift | Dual producer/consumer sign-off, executable contracts/examples and live result proof |
| Incorrect POL local matching | Category-specific applicability and matrix tests |
| Snapshot overwrite on reprice | Amendment-sequence idempotency and prior/current persistence/UI assertions |
| No-rate conflated with outage | Typed manual result/case and distinct timeout/503/circuit/denied/validation states |
| UI ownership expansion | LinerCore master, Charge page record, diff review, no `packages/ui`/shell changes |
| Manager-demo disruption | Pre/post demo guards and isolated Wave A wrapper/project only |
| Missing live environment | Explicit release dependency; no static-evidence substitution |

## Commitment Status

| Commitment | Status at handoff |
|---|---|
| Intent/scope | Approved |
| Feasibility/mitigations | Approved, conditional |
| Market/build direction | Approved |
| Rough concept | Approved with full review history retained |
| Role/RACI model | Approved |
| Budget/funding | Not supplied |
| Named staffing/capacity/schedule | Not supplied |
| Docker/live acceptance ownership | Open dependency |
| Release completion | Not claimed |

## Go / No-Go Recommendation

**GO to Inception.** Generate reverse-engineering, requirements, stories, refined interactions, architecture, vertical Units, and delivery planning under the approved constraints. **NO-GO for release claims** until the live environment, observed evidence, and both audits are green. Any umbrella expansion or change to shared UI/other domains requires a new scope decision.

## Upstream Coverage

The `intent-statement` defines value; the `scope-document` and `intent-backlog` define boundary/order; `competitive-analysis` supports bounded investment; `feasibility-assessment` and `constraint-register` make viability conditional; `team-assessment` separates team shape from staffing; and `wireframes` make the Charge/Booking operator seam testable.

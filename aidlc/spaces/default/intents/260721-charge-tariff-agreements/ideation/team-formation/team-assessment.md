# Team Assessment - W2-03 Charge Tariffs & Agreements

This assessment derives role needs from [`scope-document.md`](../scope-definition/scope-document.md), ordered work from [`intent-backlog.md`](../scope-definition/intent-backlog.md), and risk/viability conditions from [`feasibility-assessment.md`](../feasibility/feasibility-assessment.md).

## Assessment Summary

W2-03 requires a single stream-aligned, cross-functional intent mob because each releasable outcome crosses Charge domain semantics, Java service layers, owned persistence/migrations, bilateral contracts, Booking consumption, shared-shell UI, security, test automation, live Compose, and audit evidence. Separating those concerns into horizontal teams would multiply handoffs and weaken the one accountable vertical Definition of Done.

No roster, named individuals, utilization, committed capacity, time zone, location, or known competing initiative was supplied. This artifact therefore assesses **required roles**, not actual team availability. Delivery scheduling remains conditional on role assignment and capacity confirmation.

## Required Roles

| Role | Primary responsibility | Required decision/review |
|---|---|---|
| Product/value owner | Protect W2-03 in/out boundary and operator value | Scope changes, acceptance meaning |
| Charge domain owner | Tariff/category/agreement/version/calculation semantics | Commercial invariants and Charge UI behavior |
| Booking domain owner | Snapshot, reprice, and manual-state semantics | Consumer mapping and Booking-visible evidence |
| Architect | Service/data ownership and contract impact | Boundary, migration, and cross-module changes |
| Backend/data engineer | Java ports/adapters, PostgreSQL/Flyway, APIs | Implementation and migration proof |
| Frontend/UX engineer | Charge-owned pages and Booking breakdown | Shared-shell/token compliance and accessibility |
| Quality/contract engineer | Unit, integration, provider/consumer, Playwright | Test strategy, regression and evidence sufficiency |
| Security/compliance reviewer | Authorization, subject propagation, data/audit handling | Least privilege, local-only bypass, safe evidence |
| Release-review/operations role | Isolated Compose, demo guards, live proof, audits | Go/no-go evidence and manager-demo protection |

One contributor may wear multiple hats only when competence and independent review requirements remain credible. The artifact does not assert a nine-person team.

## Availability and Capacity Assessment

| Dimension | Known state | Gate |
|---|---|---|
| Named roster | Unknown | Assign roles before construction scheduling |
| Utilization/capacity | Unknown | Record explicit allocation; do not assume full time |
| Time zones/locations | Unknown | Use asynchronous artifacts and schedule gates after roster confirmation |
| Competing initiatives | Unknown | Product/delivery role confirms before committing dates |
| Acceptance environment | Docker access unavailable in current sandbox | Assign authorized runner/participant before release proof |
| Isolated stack access | Must be serialized | Reserve `linercore-wave-a`; never target manager demo |

## Capacity Allocation Agreement

Before Construction begins, the accountable delivery role records:

- named or system-assigned owners for every required role;
- availability window and maximum parallel work, without double-counting review roles;
- a single migration/contract/page owner where files are shared;
- a serialized acceptance window for `linercore-wave-a`;
- an escalation path for red contracts, migration failures, demo-guard failure, or unavailable Docker access;
- no delivery date until capacity and environment access are confirmed.

## Competing Work and External Support

No competing program initiative is asserted. The protected port-8088 manager demo and serialized Wave A stack are the only evidenced shared-resource constraints. No contractor, vendor, or AWS Professional Services engagement is required by the approved local build. A verified skill or environment gap may trigger a scoped support decision later; it is not pre-authorized here.

## Readiness Decision

**Team shape is defined; staffing is not yet confirmed.** Proceed with lifecycle design using role-based accountability. Do not claim construction schedule readiness until assignments, capacity, review independence, and Docker-capable acceptance ownership are recorded.

## Upstream Coverage

The `scope-document` defines the indivisible release and ownership exclusions. The `intent-backlog` supplies the walking-skeleton/risk-first work volume. The `feasibility-assessment` supplies the cross-module, migration, UI, security, and live-environment risks that determine the required roles.

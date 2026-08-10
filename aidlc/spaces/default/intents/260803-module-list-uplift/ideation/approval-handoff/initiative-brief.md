# Initiative Brief — W4-01 Module List-Detail Uplift

## Decision Summary

**Recommendation: GO to Inception.** The approved `intent-statement.md`, `scope-document.md`, `intent-backlog.md`, `competitive-analysis.md`, `feasibility-assessment.md`, `constraint-register.md`, `team-assessment.md`, and `wireframes.md` define a feasible, bounded feature intent with a coherent user outcome and controlled risk.

W4-01 will give Reference administrators, pricing analysts, and container-operations users one predictable find → inspect → permitted action → result/recovery loop inside the authenticated LinerCore shell. It preserves real provider behavior and established domain ownership while retiring legacy workbenches and creating the missing Container Movement frontend route.

## Problem and Outcome

Reference Data remains centered on a single workbench, Charge retains a legacy workbench beside mature routes, and Container Movement has a real W2-04 service but no frontend app/mount. Users cannot rely on stable list/detail routes, consistent operating states, or exact cross-module navigation across these modules.

The intended outcome is three canonical shell-mounted module experiences at the established Booking product bar:

- Provider-backed lists using only supported search/filter/sort/pagination.
- Stable, shareable exact-record detail routes.
- Domain-true sections and permitted actions.
- Complete loading/empty/denied/read-only/validation/pending/success/conflict/error/degraded/stale/not-found behavior as applicable.
- Agreement↔Booking and Journey↔Booking exact cross-links.
- One shell, shared tokens, and `@erp/ui`, with no local forks.

## Investment Rationale

Current enterprise products validate relationship-rich master data, agreements/rates, shipment visibility, and consistent container-event vocabulary. They do not justify replacing the closed LinerCore services. Build-vs-buy evidence favors a thin composition layer: it reuses W2-01/W2-02/W2-03/W2-04 and Reference Data investments, avoids migration and suite-switching cost, and keeps business ownership intact.

The internal differentiator is truthful domain continuity in one operating context—not suite breadth or decorative UI.

## Scope and Sequence

| Order | Vertical slice | Must deliver |
|---:|---|---|
| 1 | Reference Data | Canonical set/record list and Summary/Attributes/History detail; real permission/action states; legacy workbench retirement |
| 2 | Charge Agreements | Reused mature Agreement routes/BFF behavior; Summary/Rates/D&D/Status history; exact Booking links; legacy workbench retirement |
| 3 | Container Movement | New current-stack app/BFF composition, Compose/health/Nginx/shell mount; Journey Summary/Timeline/Linked booking from W2-04 truth |
| Exit | Integrated closure | Authenticated three-module tour, exact cross-links, themes/breakpoints/WCAG AA, route retirement, green audits |

Saved views, bulk operations, global search, new domain actions, new integrations, replacement-suite breadth, new AWS services/accounts, and local shell/theme/component systems are out of scope.

## Feasibility and Risk

**Feasibility: proceed with controls.** Reference and Charge have existing frontend/BFF seams. Container has a live service, persistence, event topic, and contracts but no app, UI Compose service, health check, or Nginx mount.

Top controls entering Inception:

1. Approve provider capability matrices before detailed design.
2. Verify canonical route registry, safe return context, and `/booking`/`/bookings` alignment.
3. Treat every shared component gap as UI-platform owned; never fork locally.
4. Verify W2-04 contracts and the Container app/BFF/mount boundary early.
5. Design and test all applicable accessibility and operational states per module.
6. Keep unsupported provider behavior visibly blocked with an owner.
7. Reuse existing topology; escalate only evidence-backed infrastructure or compliance triggers.

## Concept and UX Boundary

The approved Rough Mockups define one operational list/detail grammar with distinct domain hierarchies:

- List: compact page header, supported search/filters, result/status region, dense record-link table, pagination, and complete states.
- Detail: record identity/status, permitted actions, domain tabs, related exact-record links, and collapsed audit/evidence.
- Narrow layouts: primary identity/status retained with labelled intentional table overflow and no page-level horizontal scroll.
- Accessibility: headings/landmarks, skip link, logical keyboard order, visible focus, persistent labels, linked errors, live announcements, and dialog focus restoration.

The detailed UI/UX prompts are intentionally not executed yet. After Requirements Analysis and User Stories approval, Refined Mockups must run tasks 21, 22, and 23 in that order within the same parked stage.

## Team and Governance

One sequential stream-aligned W4-01 mob owns all three slices. Domain, UI-platform, shell/auth/platform, accessibility/quality, security/compliance, and SRE owners collaborate at defined seams. The product owner holds scope and gate authority; technical seam owners may block unsafe, inaccurate, inaccessible, or ownership-breaking implementation.

Role coverage is committed. Delivery Planning must attach named individuals, utilization, review windows, and escalation contacts before construction schedule commitments.

## Inception Mission

Inception must convert the approved boundary into implementable, testable truth:

1. Reverse-engineer current routes, components, contracts, provider capabilities, and retirement targets.
2. Affirm practices and ownership constraints.
3. Approve Requirements Analysis with capability/state/route/actor matrices.
4. Approve User Stories with scenario-level acceptance criteria.
5. Park at Refined Mockups and run tasks 21→22→23 in order, each under the execution guide and required gates.
6. Produce application design, final Units/DAG, and delivery plan without changing the intent boundary.

## Go / No-Go Conditions

**GO** if the Inception stages preserve the approved scope, real provider truth, one-shell/`@erp/ui` governance, and explicit blocked ownership.

**NO-GO / revise affected scope** if a required provider contract cannot be verified, a canonical authenticated route cannot be delivered without unapproved topology, shared UI ownership is rejected, or required accessibility/live evidence cannot be staffed. Such evidence returns to the appropriate gate; it never authorizes simulation.

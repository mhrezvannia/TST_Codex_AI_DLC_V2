# Scope Document — W4-01 Module List-Detail Uplift

## Purpose and Sources

This document binds the W4-01 boundary established by `intent-statement.md`, tested by `feasibility-assessment.md`, and constrained by `constraint-register.md`. The initiative delivers a consistent, provider-truthful list → detail → permitted action experience for Reference Data, Charge Agreements, and Container Movement inside one authenticated LinerCore shell.

## Minimum Viable Scope

W4-01 contains three thin vertical slices. Each slice must operate end to end through the current stack:

1. Authenticated shell navigation to the module.
2. Provider-backed list behavior with only supported search/filter/sort/pagination.
3. A named, keyboard-reachable link to a stable exact-record URL.
4. Approved domain detail sections rendered from real relationships.
5. Every legacy-supported permitted action available from the detail action area.
6. Actual pending/success/validation/conflict/denied/error/degraded outcomes with preserved context and accessible announcements.
7. Exact Booking cross-links where required.
8. Live Compose, route-retirement, accessibility/responsive, and audit evidence.

The slices may merge independently, but the W4-01 intent closes only when all three and the integrated evidence gate pass.

## In Scope

### Shared across all slices

- Existing LinerCore authenticated shell, global navigation, token system, responsive patterns, and `@erp/ui` primitives.
- Canonical shell-visible list and stable detail routes.
- URL-backed list context and recoverable return navigation.
- Loading, true-empty, filtered-empty, denied/read-only, validation, pending, success, conflict, provider-error, partial/degraded, stale, and not-found states where applicable.
- Real BFF/service contracts, server-side authorization, audit/correlation context, and provider-supported actions.
- Light/dark themes, keyboard/focus/status behavior, WCAG AA, and 375/390/768/1024/1440 evidence.
- Deliberate removal or redirect of superseded legacy canonical workbench routes.

### Slice 1 — Reference Data

- Provider-backed set/record list and stable record detail.
- Detail sections: Summary, Attributes, History.
- Current permitted create/update or other legacy-supported actions, subject to the approved capability matrix.
- Preservation of current permission, correlation, provider-error, and reference-service behavior.

### Slice 2 — Charge Agreements

- Canonical Agreement list and stable Agreement detail using mature existing routes/BFF behavior.
- Detail sections: Summary, Rates, D&D, Status history.
- Agreement lifecycle/actions currently supported by real contracts and permissions.
- Exact Agreement↔Booking links and retirement of the legacy workbench entrypoint.

### Slice 3 — Container Movement

- A new current-stack frontend/BFF composition because no app exists in the checkout.
- Canonical Journey list and stable Journey detail.
- Detail sections: Summary, Movement timeline, Linked booking.
- DCSA-readable movement vocabulary driven by verified W2-04 contracts.
- Required Compose UI service, health check, shell navigation, and Nginx canonical mount.
- Exact Journey↔Booking links and real movement action outcomes supported by W2-04 behavior.

## Out of Scope

- New Reference Data, Charge, Booking, or Container Movement business capability.
- Saved views, bulk operations, global search, optimization, strategic procurement, predicted movement events, or new carrier integrations.
- A replacement ERP/TMS suite, vendor-owned application platform, or new external adapter.
- New AWS services/accounts, persistence stores, topics, or data owners without separately approved evidence.
- Module-local shell, theme, navigation, auth, token system, shared-component library, or `packages/ui` fork.
- App-to-app business imports, direct database reads, placeholder records, UI-owned domain state, or simulated success counted as completion.
- Admin/identity UI and unrelated module cleanup.
- Exact production-hosting redesign unless a later stage proves that the existing deployment boundary cannot support the approved route.

## Must / Should / Could / Won’t

| Priority | Capability |
|---|---|
| Must | Three authenticated canonical module list/detail loops with real providers |
| Must | Stable exact-record URLs, permitted actions, complete operating states, and Booking cross-links |
| Must | One shell, `@erp/ui`, shared tokens, WCAG AA, responsive/themes evidence, and green audits |
| Must | Honest blocked ownership for provider gaps; deliberate legacy route retirement |
| Should | Preserve list filters/return context across detail navigation and recoverable failures |
| Should | Reuse mature Charge routes and existing Reference/Booking interaction grammar to reduce regression |
| Could | Add a missing reusable primitive through the UI-platform owner if approved and needed by all modules |
| Won’t | Saved views, bulk operations, global search, new domain actions/integrations, or replacement-suite breadth |

## Value Stream

| Step | User value | Enabling system boundary | Evidence |
|---|---|---|---|
| Authenticate and choose module | One trusted operating context | Auth + LinerCore shell | Real session and permitted navigation |
| Find records | Faster, truthful discovery | Module BFF → owned service/provider | Query operations and state matrix |
| Open exact detail | Shareable, recoverable work context | Canonical route + stable identifier | Direct URL, refresh, back/return behavior |
| Understand relationships | Domain decisions with less lookup | Provider relationships and approved tabs | Real attributes/rates/events/Booking link |
| Take permitted action | Complete work without legacy surface | Server-authorized command path | Pending/result/error/conflict evidence |
| Continue related work | Fewer context breaks | Identifier-based shell cross-link | Exact Booking/Agreement/Journey target |
| Verify closure | Operational confidence | Compose + quality/audit pipeline | Live DoD and green audits |

## Dependencies and Sequence

The binding implementation order is Reference Data → Charge Agreements → Container Movement. Reference establishes the repeated interaction/state pattern; Charge proves that it can preserve mature behavior during consolidation; Container then applies the approved pattern while resolving the missing frontend/mount.

Closed dependencies W2-01, W2-02, W2-03, W2-04, and Reference Data/W0-02 outputs must be re-verified at consumption. Ordered UI/UX tasks 21, 22, and 23 run only after Requirements Analysis and User Stories approval, within the same parked Refined Mockups stage.

## Change Control

A proposed addition enters W4-01 only if the product owner approves a scope change that identifies: affected provider contract, shared UI ownership, dependency and sequence impact, accessibility/security implications, additional live evidence, and displaced work. Otherwise it is recorded for a later vertical intent. No team may absorb adjacent capability merely because it is convenient during implementation.

## Scope Exit Gate

Scope is complete only when each module’s approved list/detail/action loop is observed on the isolated live Compose stack; exact cross-links and retired routes are verified; light/dark, keyboard, WCAG AA, and required breakpoint evidence pass; and both `aidlc-audit` and `erp-fidelity-audit` are green. Tests without live observation are insufficient.

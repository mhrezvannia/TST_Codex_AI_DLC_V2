<!-- BINDING TEMPLATE. The ## headings below are required (required-sections sensor). -->

# Intent Statement — W4-01 Module List-Detail Uplift

## Context Pack (read before starting)

1. `docs/intents/W4-01-module-list-detail-uplift.md` — active intent, scope, order, and observed Definition of Done.
2. `docs/intents/00-INTENT-BACKLOG.md` and `docs/aidlc-v2-slicing-playbook.md` — program DAG, ownership, vertical-slicing, and merge/evidence rules.
3. `docs/erp-business-ui-gap-analysis.md` Parts 3.2 and 3.5 plus `docs/erp-workflow-map.md` — target list/detail information architecture and cross-module user tour.
4. W2-01 shell/Booking pattern: `aidlc/spaces/default/intents/260717-app-shell-auth/inception/refined-mockups/interaction-spec.md`, `design-system-mapping.md`, `inception/application-design/components.md`, and `construction/U01-walking-skeleton-shell-login-booking-read/code-generation/code-summary.md`.
5. W2-02 shared UI pattern: `aidlc/spaces/default/intents/260721-design-system-closure/inception/refined-mockups/interaction-spec.md`, `design-system-mapping.md`, `inception/application-design/components.md`, `packages/ui/src/index.tsx`, and `packages/ui/src/styles.ts`.
6. `aidlc/spaces/default/memory/templates/interaction-spec.md` — binding shape for each module interaction specification.
7. Current Reference Data and Charge surfaces under `apps/reference-data` and `apps/charge-agreements`; preserve their provider/BFF behavior while replacing legacy canonical workbench presentation.
8. Container Movement truth sources: W2-04 service/contracts and `aidlc/spaces/default/intents/260721-container-track-trace/` design artifacts. The current checkout has no `apps/container-movement`; W4-01 creates the canonical shell route directly and retires no nonexistent standalone app.
9. `design-system/linercore/MASTER.md`, `SESSION-PROMPT.md`, and page contracts `pages/reference-data.md`, `pages/charge-and-agreements.md`, and `pages/container-movement.md`.
10. `docs/ui-ux-prompts/EXECUTION-GUIDE.md` and ordered tasks 21, 22, and 23. Run them only after Requirements Analysis and User Stories are approved, within the same parked Refined Mockups boundary.
11. `docs/program-vision-document.md` Sections 3–5 and `docs/enterprise-technical-environment.md` frontend standards — business ownership, canonical data, shared-package, BFF, and accessibility constraints.

## Intent

Reference administrators, pricing analysts, and container-operations users can perform their core find-record, inspect-detail, and permitted-action work across Reference Data, Charge Agreements, and Container Movement inside the one authenticated LinerCore shell. Each module reaches the established Booking product bar: provider-backed list behavior, stable shareable detail routes, domain-true sections, complete operating states, shared `@erp/ui` presentation, and canonical cross-links. The last legacy workbench entrypoints are retired without creating domain-local themes, shells, or shared-component forks.

## Problem Statement

The remaining module experience is inconsistent and incomplete. Reference Data is still centered on a single workbench, Charge retains a legacy workbench alongside more mature routes, and this checkout has no Container Movement frontend despite approved W2-04 domain and interaction artifacts. Users cannot rely on one predictable list → detail → action loop across modules, and the product cannot claim shell/design-system closure while standalone or missing surfaces remain.

## Target Customer

- Reference administrator: finds a set and record, inspects attributes/history, and performs only permitted mutations.
- Pricing analyst and Charge reader/auditor: finds agreements, inspects rates/D&D/status history, and executes or observes lifecycle actions according to capability.
- Container-operations clerk: finds a journey, reviews the ordered movement timeline and linked Booking, and captures permitted movement actions.
- Program/product owner and module reviewers: verify that domain truth, ownership, accessibility, and live evidence remain intact.

## Success Metrics

- Three canonical shell-mounted module routes and stable detail URLs operate through real authenticated sessions.
- Lists search, filter, sort, and paginate only where the real provider supports the behavior; unsupported cells remain explicitly `BLOCKED` with an owning dependency.
- Reference record, Agreement, and Journey detail tabs render real provider relationships and preserve user context across recoverable failures.
- Every action available in the legacy surface is available from the appropriate detail action rail or is explicitly absent in read-only/denied states.
- Agreement↔Booking and Journey↔Booking links land on exact canonical records in the shell.
- No module-local palette/shell/shared-component fork, no production-like `local-user`, and no new application hardcoded colors.
- WCAG AA, keyboard/focus/announcement behavior, light/dark themes, and 375/390/768/1024/1440 responsive evidence pass.
- Live Compose observations, `aidlc-audit`, and `erp-fidelity-audit` are green before intent closure.

## Initiative Trigger

W2-01 closed the authenticated shell/Booking mount and W2-02 closed the shared token/primitive baseline. W2-03 and W2-04 now supply real Charge and Container Movement domain behavior. W4-01 is the planned Wave 3A UI-led closure intent that removes the remaining workbench/missing-page gap while those dependencies are current and closed.

## Initial Scope Signal

`feature`, Standard depth and Standard test strategy. The work is a brownfield UI/IA uplift with three thin, independently mergeable vertical units; it adds no new business capability and closes only after all three units satisfy the shared live evidence gate.

## Vertical Slice Definition

Each module follows one thin end-to-end path: authenticated shell navigation → provider-backed list state → stable detail route → real domain relationship tabs → permitted detail action → persisted/provider result → observable recovery/success state and cross-link. The unit uses existing service/BFF contracts and adds only the route/view-model composition needed to expose current domain truth.

- **Layers cut through:** authenticated shell · domain route composition · BFF/API · existing service/domain/persistence · live provider relationships · observed UI/audit evidence.
- **Thinnest viable form:** Reference record (Summary · Attributes · History), Agreement (Summary · Rates · D&D · Status history), Journey (Summary · Movement timeline · Linked booking).
- **Explicitly deferred to later intents:** saved views, bulk operations, cross-module global search, new domain actions, and new backend integration seams.

## In Scope / Out of Scope

**In scope**

- Reference Data, Charge Agreements, and Container Movement canonical list/detail/action experiences inside the existing shell.
- Provider-backed search/filter/sort/pagination, complete loading/empty/filtered-empty/denied/read-only/validation/pending/success/conflict/error/degraded states, and canonical cross-links.
- Reuse of existing BFF/domain behavior; retirement of legacy workbench and standalone canonical entrypoints that actually exist.
- One binding interaction specification per module and shared responsive, accessibility, state, component-mapping, and traceability evidence.

**Out of scope**

- New Reference Data, Charge, Booking, or Container Movement business capabilities.
- Admin/identity UI, saved views, bulk operations, or global search.
- A second shell, module-local navigation/auth/theme, alternate token system, app-local shared-component library, or unapproved `packages/ui` fork.
- Simulated provider behavior counted as completion.

## Actors & Journey

1. The authenticated user selects a permitted module in the LinerCore shell.
2. The user searches, filters, sorts, and pages a real result set without losing URL-backed context.
3. The user opens one exact record through a named, keyboard-reachable detail link.
4. The detail page renders module-owned facts and relationships in the approved tab set.
5. The user performs a permitted legacy action from the detail action rail; pending, success, validation, conflict, denied, and provider failure outcomes preserve context and announce status.
6. A related Agreement or Journey link opens the exact Booking record, and the user can return without losing list context.

## Cross-Module Seams (must be real)

W4-01 introduces no backend seam. Its cross-module seams are canonical shell navigation links:

- Agreement → Booking and Booking → Agreement use stable record identifiers from existing Charge/Booking contracts.
- Journey → Booking and Booking → Journey use existing W2-04 booking/journey identifiers and projections.
- All links resolve through shared shell routes with the authenticated session; no app-to-app imports, database joins, copied data ownership, or placeholder records are permitted.

## Standards Alignment

- WCAG 2.1 AA, visible focus, persistent labels, linked errors, logical keyboard order, dialog focus trap/restore, non-color status meaning, reduced motion, and accessible async announcements.
- LinerCore shared-shell, `@erp/ui`, `--erp-*` token, strict TypeScript/Next.js App Router, BFF, and canonical responsive contracts.
- DCSA code plus readable meaning for Container Movement, and canonical Reference Data/Charge vocabulary from the owning provider contracts.
- Application code consumes shared tokens/primitives; missing shared capabilities become UI-platform dependencies rather than local forks.

## Definition of Done (observed, not "tests pass")

On the isolated live Compose stack, for each module: (1) authenticate and navigate through the one shell; (2) search/filter/sort/paginate against real data; (3) open a stable detail URL and render every approved tab from real provider relationships; (4) click every legacy-supported action from the detail rail and observe the actual result; (5) exercise loading, true-empty, filtered-empty, denied/read-only, validation, pending, success, conflict, provider-error, partial/degraded, stale, and not-found behavior as applicable; (6) follow cross-links to the exact related Booking; and (7) confirm retired workbench/standalone routes are gone or redirected to the canonical shell path. Evidence covers light/dark themes, keyboard operation, WCAG AA, and 375/390/768/1024/1440 layouts. `erp-fidelity-audit` UI detectors are approximately zero across affected `apps/**`, `aidlc-audit` and all quality gates are green, and demo safety is preserved.

## Dependencies

- W2-01 App Shell & Auth — closed; supplies the single authenticated shell and Booking mount pattern.
- W2-02 Design-System Foundation — closed; supplies `@erp/ui` tokens/primitives and Booking reference composition.
- W2-03 Charge Tariffs & Agreements — closed; supplies current Agreement/rate/D&D behavior and routes.
- W2-04 Container Journey Track & Trace — closed; supplies current service/contracts, domain states, and approved Container Movement designs.
- Existing Reference Data services and W0-02 completeness outputs — closed and consumed through stable provider contracts.

## Suggested Scope & Sizing

`feature`. Three independently mergeable vertical units in order: (1) Reference Data proves the repeated list/detail/state pattern; (2) Charge Agreements reuses its mature routes while retiring the legacy workbench; (3) Container Movement creates the missing canonical shell route directly from verified W2-04 sources. W4-01 closes only after all three pass integrated evidence and audits.

## Open Questions

All Intent Capture questions are resolved in `intent-capture-questions.md`:

1. Three-module shell-mounted parity is the release outcome.
2. Units merge independently in Reference Data → Charge → Container Movement order; intent closure waits for all three.
3. Container Movement uses verified W2-04 sources and creates the canonical shell route directly.
4. Existing BFF/domain behavior and mature Charge routes are reused; legacy workbench entrypoints are retired.
5. Unsupported provider behavior remains honestly `BLOCKED`; it is not simulated or silently dropped.
6. The program/product owner holds final gates after UI, domain, accessibility, and quality review.


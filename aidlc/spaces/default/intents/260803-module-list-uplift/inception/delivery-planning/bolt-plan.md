# Bolt Plan - W4-01 Module List-Detail Uplift

## Source Alignment

This ordered Construction plan consumes approved `requirements.md`, `stories.md`, `mockups.md`, `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, and `team-practices.md`, plus the accepted answers in `delivery-planning-questions.md`. It preserves the single W2-02-owned `PlatformShell`, shared tokens and `@erp/ui`, existing service/data ownership, the four-unit/one-edge topology, and the sequential core-mob capacity agreement.

## Planning Invariants

- One Bolt is one pass through Construction stages 3.1-3.7 and contains one approved Unit.
- B01 is the separately gated walking skeleton. No later Bolt enters implementation until B01 is approved.
- Only one module Bolt is active at a time. Non-conflicting research, owner confirmation, fixture preparation, and reviewer scheduling may overlap but do not constitute parallel Bolts.
- Unit topology and economic sequence remain distinct: only U02 depends on U01; B03/B04 are ordered by approved team practice, reuse value, risk containment, and single-driver capacity.
- No Bolt may create a domain-local shell/theme/shared-component fork, browser authority, new backend/database/topic/AWS stack, or simulated provider capability.
- Dates are not committed until named owners, utilization, review windows, and acceptance-environment access are confirmed.

## Ordered Bolt Sequence

| Order | Bolt | Unit | Marker | Entry gate | Relative size |
| --- | --- | --- | --- | --- | --- |
| 1 | B01 `reference-route-walking-skeleton` | U01 `platform-reference-route-foundation` | Walking skeleton; separate approval | W2-02 shared release, named core mob, Reference/Identity fixture, Compose slot | L |
| 2 | B02 `reference-operational-completion` | U02 `reference-data-operational-completion` | Reference depth | B01 approved; Reference history/freshness and action fixtures available | L |
| 3 | B03 `charge-agreements-uplift` | U03 `charge-agreements-operational-uplift` | Pattern transfer | B02 accepted; Charge parity preflight and reviewers scheduled | XL |
| 4 | B04 `container-journeys-booking-uplift` | U04 `container-journeys-booking-uplift` | New deployable/cross-module closure | B03 accepted; CMM Identity/v2/assertion/event exits ready | XL |

## B01 - Reference Route Walking Skeleton

**Included Unit:** U01 only.

**Architectural layers proved:** browser and canonical Nginx route; one published W2-02 shell/registry; host session and current-request Identity; Reference page/BFF; Reference service and owned database; typed route state; safe return; isolated Compose and audits.

**Definition of Done:** U01's complete observed live DoD passes. In addition, both `aidlc-audit` and `erp-fidelity-audit` run for the skeleton path, the manager-demo guard is green before and after, and the user explicitly approves B01 before B02 starts.

**Confidence hypothesis:** A real operator can traverse the approved Reference list-to-detail path through the canonical authenticated platform and owned provider without a local shell, theme, auth fallback, client simulation, or ownership fork.

**Expected demo:** Sign in as permitted and denied subjects; enter Reference from the shell; load a persisted set/record; direct-refresh detail; return to page/row focus; reject unsafe context; show denied no-flash behavior; demonstrate five widths/two themes, performance sample, and audit evidence.

**Owning mob:** Core W4 mob. Required active reviewers: Reference domain, UI-platform, shell/auth/platform, quality/accessibility, security, and release/operations.

## B02 - Reference Operational Completion

**Included Unit:** U02 only. **Hard dependency:** U02 -> U01 and B01 approval.

**Definition of Done:** U02's observed DoD passes for complete provider-supported list/detail/history/create/update/degradation behavior, including exact query allow-lists, read-only and negative outcomes, fresh re-read, context/focus retention, responsive/accessibility evidence, performance samples, and no unsupported lifecycle/search/sort controls.

**Confidence hypothesis:** The shared interaction and failure grammar remains truthful when the first module expands from a thin path to full provider-supported operational depth.

**Expected demo:** Exercise populated/empty/filtered/denied/error/stale states, stable detail/history, create/update success, validation/version conflict, provider outage with and without trustworthy data, Identity outage, and recovery without fabricated truth.

**Owning mob:** Core W4 mob. Required active reviewers: Reference domain, UI-platform, quality/accessibility, security, and SRE for degradation evidence.

## B03 - Charge Agreements Uplift

**Included Unit:** U03 only. **Economic gate:** B02 accepted; this is not a unit-DAG dependency.

**Definition of Done:** U03's observed DoD passes for provider-aligned Agreement list/detail, immutable version/rate evidence, provider-backed D&D or truthful unavailability, legal lifecycle actions, OPEN manual evidence, exact rate-version navigation, bounded Reference options, exact Charge retirement routes, responsive/accessibility/performance evidence, and honest blocked relationship/queue states.

**Confidence hypothesis:** The proven LinerCore list/detail/action/recovery pattern scales to a mature provider and richer commercial workflow without regression, client-side authority, or cross-domain ownership drift.

**Expected demo:** Compare analyst and reader capabilities; filter/refresh Agreements; inspect Summary/Rates/D&D/Status; follow exact rate-version evidence; run accepted/rejected lifecycle actions; inspect manual evidence; show conditional queue segments and absent guessed Booking links.

**Owning mob:** Core W4 mob. Required active reviewers: Charge domain, Reference-option owner, UI-platform, quality/accessibility, security, and product.

## B04 - Container Journeys and Booking Uplift

**Included Unit:** U04 only. **Economic gate:** B03 accepted; this is not a unit-DAG dependency.

**Definition of Done:** U04's hard observed DoD passes for the new CMM frontend/mount, v2 timeline/assertion/capture, exact Booking relationship, active Reference locations, typed accepted/rejected/unknown/pending/applied outcomes, target-scoped failures, responsive/accessibility/performance evidence, and live event truth. B04 and W4-01 remain not done until poison/bounded-retry/DLQ/replay evidence is executable or an approved bounded replacement closes that exit.

**Confidence hypothesis:** The shared pattern supports a new deployable plus synchronous and event-driven cross-module seams while preserving CMM/Booking authority, idempotency, security, and truthful downstream status.

**Expected demo:** Open recent Journeys and stable detail; inspect provider-owned timeline; navigate Journey <-> Booking with signed origin; capture accepted, duplicate, out-of-sequence, conflict, validation, unknown, publication-pending and Booking-applied fixtures; interrupt dependencies; show poison/replay operator evidence and no false success.

**Owning mob:** Core W4 mob. Required active reviewers: CMM, Booking/shell, Reference, UI-platform, quality/accessibility, security, SRE/operations, and product.

## Bolt Gates and Construction Handoff

| Gate | Required decision/evidence | Failure behavior |
| --- | --- | --- |
| Construction entry | Branch resynchronized; named mob/capacity/review windows; B01 external exits ready | Do not start B01 |
| B01 approval | Live skeleton, both audits, user approval | Stop; repair or revise before B02 |
| B02 acceptance | Full Reference outcomes and evidence | Stop module progression |
| B03 acceptance | Charge parity and blocker truth | Stop before CMM implementation |
| B04 acceptance | CMM/Booking/event outcomes including poison/replay closure | B04 and intent remain not done |
| Intent exit | Integrated three-module matrix, final coverage/security/demo guards/audits | No merge/completion claim |

## Scope and Date Controls

No Bolt carries saved views, bulk operations, global search, new business behavior, manual-pricing resolution, unsupported lifecycle actions, production/cloud modernization, or a shared UI fork. No calendar date, utilization percentage, or named-person availability is asserted until confirmed in `team-allocation.md` and `external-dependency-map.md`.

## Approval Record

The strategic and per-Bolt package was accepted as option A for all ten Delivery Planning questions on 2026-08-10. Final stage approval authorizes the plan for Construction; it does not waive any Bolt entry gate or external dependency.

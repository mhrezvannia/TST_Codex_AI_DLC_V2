# Delivery Planning Questions - W4-01 Module List-Detail Uplift

## Source Alignment

These questions consume the approved `requirements.md`, `stories.md`, `mockups.md`, `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, and `team-practices.md`. They also respect the approved team-formation artifacts: one stream-aligned core mob, one active module slice at a time, scheduled domain/platform review, and no invented named availability. The topology has four units and one real dependency edge, U02 depending on U01; economic ordering is selected here.

## Strategic Questions

### Q1. Which sequencing heuristic should W4-01 use?

A. Hybrid: walking-skeleton-first for B01, then risk-and-value sequencing that preserves the affirmed Reference -> Charge -> Container module progression (recommended)
B. Pure WSJF ranking, even if it changes the affirmed module progression
C. Pure value-first with no explicit architectural-risk gate
D. Pure risk-first with no user-visible walking skeleton
X. Other (please specify)

[Answer]: A - Hybrid walking-skeleton-first, then risk-and-value sequencing (Recommended) - 2026-08-10T12:46:29Z - **Mode:** guided - User response: `All A`

### Q2. Should Delivery Planning use WSJF-style scoring?

A. Use a lightweight comparative score - 40% user/business value, 40% risk reduction, 20% time criticality, divided by relative job size - as transparent supporting evidence, while the approved walking-skeleton and dependency gates remain binding (recommended)
B. Use no scoring; provide narrative rationale only
C. Let numerical WSJF override the approved team practices and hard dependencies
D. Use calendar duration alone
X. Other (please specify)

[Answer]: A - Lightweight 40/40/20 WSJF evidence divided by size (Recommended) - 2026-08-10T12:46:29Z - **Mode:** guided - User response: `All A`

### Q3. What Bolt granularity should apply?

A. One approved Unit per Bolt: B01/U01 route foundation, B02/U02 Reference completion, B03/U03 Charge uplift, B04/U04 CMM/Booking uplift (recommended)
B. Bundle all four units into one Construction Bolt
C. Split every route/API/test family into its own Bolt
D. Bundle U01+U02, then run Charge and CMM as one combined Bolt
X. Other (please specify)

[Answer]: A - One approved Unit per Bolt (Recommended) - 2026-08-10T12:46:29Z - **Mode:** guided - User response: `All A`

### Q4. Can multiple Bolts run concurrently through Construction?

A. Keep the four Bolts sequential with an explicit B01 approval gate and one active module slice; allow only non-conflicting preparatory research/reviewer scheduling outside the Bolt pipeline (recommended)
B. Run B02, B03, and B04 concurrently after B01
C. Run all four concurrently
D. Decide dynamically without recording a concurrency rule
X. Other (please specify)

[Answer]: A - Sequential Bolts with gated B01 and preparatory work only in parallel (Recommended) - 2026-08-10T12:46:29Z - **Mode:** guided - User response: `All A`

### Q5. How should external dependencies be treated?

A. Maintain explicit owner/lead-time/blocking-Bolt/mitigation entries for W2-02 shell/UI releases, Identity capabilities, Reference freshness/history, Charge filters/D&D, CMM v2/assertion, event poison/replay controls, review windows, and the isolated acceptance environment; no local substitutes (recommended)
B. Treat every dependency as resolved because the design is approved
C. Move blocked provider behavior into client-side simulations
D. Omit external dependencies until Construction fails
X. Other (please specify)

[Answer]: A - Explicit owner/lead-time/Bolt/mitigation tracking with no substitutes (Recommended) - 2026-08-10T12:46:29Z - **Mode:** guided - User response: `All A`

### Q6. Which risks should receive earliest attention?

A. First prove the shared shell/session/auth/edge and real Reference path; before the consuming Bolt, preflight Charge provider parity and CMM Identity/v2/event-control exits, keeping any failed exit blocking rather than expanding scope (recommended)
B. Prioritize visual polish before provider/security seams
C. Defer all dependency checks to final live acceptance
D. Start with CMM implementation because it is largest, ignoring the affirmed sequence
X. Other (please specify)

[Answer]: A - Prove platform/Reference first and preflight later provider exits (Recommended) - 2026-08-10T12:46:29Z - **Mode:** guided - User response: `All A`

## Per-Bolt Questions

### Q7. Approve the proposed B01 package?

A. B01 `reference-route-walking-skeleton` bundles U01, is the gated walking skeleton, and proves browser -> one `PlatformShell` -> session/Identity -> Reference BFF/service/database -> stable detail/return on live Compose; DoD is U01's observed DoD plus both audits; confidence hypothesis: the shared platform and ownership model works without a fork; owned by the core W4 mob with Reference, UI-platform, shell/auth, quality, and security reviewers (recommended)
B. Remove the live provider/database path
C. Make B01 documentation-only
D. Use a domain-local shell as a temporary bridge
X. Other (please specify)

[Answer]: A - B01 Reference route walking skeleton (Recommended) - 2026-08-10T12:46:29Z - **Mode:** guided - User response: `All A`

### Q8. Approve the proposed B02 package?

A. B02 `reference-operational-completion` bundles U02 after B01 approval and completes Reference list/detail/history/create/update/degradation states; DoD is U02's observed DoD; confidence hypothesis: the shared list/detail/action/recovery grammar remains truthful under provider and Identity outcomes; owned by the core W4 mob with Reference, UI-platform, quality/accessibility, and security reviewers (recommended)
B. Bundle B02 into B01 and remove the skeleton gate
C. Add unsupported lifecycle/search/sort scope
D. Defer Reference recovery evidence to final acceptance
X. Other (please specify)

[Answer]: A - B02 Reference operational completion (Recommended) - 2026-08-10T12:46:29Z - **Mode:** guided - User response: `All A`

### Q9. Approve the proposed B03 package?

A. B03 `charge-agreements-uplift` bundles U03 after the Reference pattern is approved and proves Agreement/rate/manual evidence, legal actions, bounded Reference options, exact retired routes, and honest D&D/relationship blockers; DoD is U03's observed DoD; confidence hypothesis: the pattern scales to a mature provider without client simulation or regression; owned by the core W4 mob with Charge, Reference-option, UI-platform, quality/accessibility, and security reviewers (recommended)
B. Start B03 before the Reference pattern gate
C. Add manual-pricing resolution and guessed Booking links
D. Replace provider-aligned controls with client filtering
X. Other (please specify)

[Answer]: A - B03 Charge Agreements uplift (Recommended) - 2026-08-10T12:46:29Z - **Mode:** guided - User response: `All A`

### Q10. Approve the proposed B04 package?

A. B04 `container-journeys-booking-uplift` bundles U04 after Charge acceptance and proves the new CMM app/mount, v2 timeline/assertion/capture, exact Booking relationship, active locations, event outcome separation, and poison/replay exit; DoD is U04's hard observed DoD and remains not done while event-control evidence is open; confidence hypothesis: the pattern supports a new deployable and cross-module/event seam without ownership drift or false success; owned by the core W4 mob with CMM, Booking/shell, Reference, UI-platform, quality/accessibility, security, and SRE reviewers (recommended)
B. Declare B04 done while poison/replay remains blocked
C. Move CMM pages into Booking or the shell app
D. Add a new backend/database/topic to simplify delivery
X. Other (please specify)

[Answer]: A - B04 Container Journeys/Booking uplift with hard event-control exit (Recommended) - 2026-08-10T12:46:29Z - **Mode:** guided - User response: `All A`

## Approval and Ambiguity Check

After answers are recorded, the plan will be checked for contradiction with the one-edge unit DAG, the affirmed sequential capacity model, ownership boundaries, external blockers, and the no-fork/no-fabrication constraints. Any ambiguity will be resolved before the four delivery artifacts and Inception phase-check are generated.

## Ambiguity Analysis

The ten selected answers are mutually consistent. They choose four sequential one-unit Bolts; B01 is the gated Reference walking skeleton; B02 completes Reference; B03 applies the proven pattern to Charge; and B04 adds CMM/Booking only after the earlier gates. Lightweight WSJF supports transparency but cannot override the U02-to-U01 dependency, the affirmed module sequence, platform/provider exits, or the hard B04 poison/replay completion condition. Preparatory research and reviewer scheduling may overlap, but the Construction Bolt pipeline and live acceptance reservation remain serialized.

# Delivery Planning Questions - W2-01 App Shell and Auth

## Source Context

This artifact consumes `requirements.md`, `stories.md`, `mockups.md`, `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, and `team-practices.md`. It records the sequencing answers used to generate `bolt-plan.md`, `team-allocation.md`, `risk-and-sequencing-rationale.md`, and `external-dependency-map.md`.

## Strategic Answers

| Question | Answer |
| --- | --- |
| Which sequencing heuristic applies? | Hybrid: walking-skeleton-first for Bolt 1, then risk-first for actor authorization, deny, sign-out, route compatibility, and final evidence. |
| Is a WSJF-style scoring model used? | Yes, ordinal only. Value, time criticality, risk reduction, and relative size are described qualitatively; no fabricated numeric WSJF precision is used. |
| What is Bolt granularity? | One approved vertical Unit per Bolt. U03 and U04 may be developed concurrently only if the implementation workflow creates non-conflicting branches, but each remains separately demonstrable. |
| Can multiple Bolts run in parallel? | Default is serial through the one accountable Platform+UI mob. U03 deny path and U04 sign-out guard are topologically parallel after U01, but both depend on the same shell/session surface, so parallel work needs explicit non-overlap. |
| Are there external dependencies? | Yes: Keycloak/auth local login, identity-service permission catalog/seeds, Compose/Nginx routing, Booking service/BFF availability, detector 6d, `aidlc-audit`, and Docker image availability. |
| What risk items go earliest? | Shell/auth/session handoff and removal of `local-user` fallback go first because all later behavior can produce false evidence if actor propagation is wrong. |

## Per-Bolt Answers

| Bolt | Units bundled | Walking skeleton? | Definition of Done | Confidence hypothesis | Owning mob |
| --- | --- | --- | --- | --- | --- |
| B01 | U01 | Yes | Live Nginx -> auth/Keycloak -> shell -> `/booking` read path proves non-`local-user` actor and correlation id. | The chosen shell/auth/Booking seam works end to end before wider shell chrome or Booking actions expand. | Platform+UI delivery mob, architect review hat, quality evidence hat. |
| B02 | U02 | No | `local.booking.user` creates and retrieves a Booking inside shell; identity-service allows a Booking action for the real subject. | The allow path can use identity-service authorization and preserve W1 Booking create/detail behavior. | Platform+UI delivery mob, backend authorization review hat. |
| B03 | U03 | No | `local.reference.admin` reaches Booking inside shell and receives access denied with deny evidence tied to the real subject. | The deny path fails closed and is visible to users without converting authorization failure into blank UI or `local-user`. | Platform+UI delivery mob, UX/accessibility review hat. |
| B04 | U04 | No | Sign-out clears the shell session; protected shell and Booking routes require login again; stale calls do not reach booking-service as `local-user`. | Session lifecycle is controlled tightly enough to prevent stale or missing-subject Booking calls. | Platform+UI delivery mob, security review hat. |
| B05 | U05 | No | `/bookings*` compatibility resolves to canonical `/booking*`; preserved W1 behavior works; W0-01, W0-02, W1-01, and W2-02 preservation evidence is captured. | Compatibility and preservation can be proven without broad prior-work rewrites. | Platform+UI delivery mob, preservation review hat. |
| B06 | U06 | No | Full live acceptance, detector 6d, `erp-fidelity-audit`, `aidlc-audit`, and evidence package are complete or honestly BLOCKED. | The W2-01 intent can be accepted on live Compose/Nginx evidence without rewriting W1's BLOCKED waiver as PASS. | Platform+UI delivery mob, release/evidence review hat. |

## Closed Choices

- First Bolt scope is B01/U01 because `team-practices.md` already selected protected shell entry, session handoff, and one Booking call that cannot fall back to `local-user`.
- Canonical route proof uses `/`, `/booking`, `/booking/new`, and `/booking/[id]`; `/bookings*` is compatibility work in B05.
- W2-01 stays inside shell/auth plus Booking mount. Reference-data, charge agreements, and container movement shell migration remain out of scope.

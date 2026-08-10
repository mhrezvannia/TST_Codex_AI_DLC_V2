# Unit of Work Story Map - W2-01 App Shell and Auth

## Source Context

This story map consumes `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, `decisions.md`, `requirements.md`, and `stories.md`. It verifies that every approved user story has vertical implementing units and every unit contributes to story delivery.

## Story to Unit Mapping

| Story | Implementing units | Coverage notes |
| --- | --- | --- |
| US-01 Protected Shell Entry | U01, U04 | U01 proves live shell login and one Booking read; U04 proves sign-out and stale-session guard. |
| US-02 Session Subject Reaches Booking | U01, U02, U03, U04, U06 | U01 proves no-`local-user` read; U02 proves allow create/detail; U03 proves deny; U04 proves missing/stale subject fail-closed; U06 packages detector/audit proof. |
| US-03 Shell Navigation, Denied Path, and Sign-Out | U01, U03, U04, U05 | U01 establishes shell nav; U03 proves denied path; U04 proves sign-out; U05 proves route compatibility. |
| US-04 Mounted Booking Proof Without Prior-Work Regression | U02, U05, U06 | U02 proves create/detail inside shell; U05 proves `/bookings*` compatibility and preservation; U06 packages final live acceptance and audits. |

## Unit to Story Coverage

| Unit | Stories covered | Requirements covered |
| --- | --- | --- |
| U01 Walking Skeleton - Shell Login to One Booking Read | US-01, US-02, US-03 | FR-01, FR-02, FR-03, FR-05, FR-09, FR-10, NFR-01, NFR-02, NFR-03, NFR-04, NFR-07, NFR-08 |
| U02 Booking Create Allow Path With Real Subject | US-02, US-04 | FR-04, FR-05, FR-06, FR-10, FR-12, NFR-03, NFR-04, NFR-06, NFR-07 |
| U03 Booking Deny Path Inside Shell | US-02, US-03 | FR-06, FR-07, FR-12, NFR-02, NFR-04, NFR-07, NFR-09 |
| U04 Sign-Out and Session Expiry Guard | US-01, US-02, US-03 | FR-03, FR-08, FR-11, NFR-01, NFR-02, NFR-03, NFR-05, NFR-07 |
| U05 Route Compatibility and Prior-Work Preservation | US-03, US-04 | FR-04, FR-09, NFR-06, NFR-07, NFR-10 |
| U06 Final Live Acceptance, Detector, and Audit Package | US-02, US-04 | FR-04, FR-05, FR-06, FR-11, NFR-06, NFR-08, NFR-10 |

## Cross-Cutting Concerns

| Concern | Units | Verification |
| --- | --- | --- |
| No hardcoded `local-user` on mounted paths | U01, U02, U03, U04, U06 | Live read/create/deny/sign-out proof plus detector 6d evidence. |
| Real-subject authorization | U02, U03, U06 | Allow/deny live proof for `local.booking.user` and `local.reference.admin`. |
| W1 waiver stays explicit | U05, U06 | Evidence package references W1 waiver/BLOCKED at `compose-start`; no PASS rewrite. |
| W0/W1/W2 preservation | U05, U06 | Diff review and targeted verification for W0-01, W0-02, W1-01, W2-02. |
| Local Compose/Nginx proof | U01-U06 | Every unit DoD is observed through the live local stack where applicable. |
| NFR-07 maintainability constraints | U01, U02, U03, U04, U05 | Frontend units stay in existing Next.js/React/TypeScript patterns and do not introduce Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js. |
| Accessibility/responsive behavior | U03, U04, U06 | Keyboard, focus, responsive, denied/sign-out evidence from refined mockups. |

## Coverage Verification

- Every story in `stories.md` is assigned to at least one vertical unit.
- Every unit contributes to at least one approved story.
- Every unit has an observed live-stack DoD in `unit-of-work.md`.
- Every must-have live acceptance item in `requirements.md` maps to a unit that observes the behavior, not only to final packaging.
- The W2-01 scope boundary remains intact: no unit migrates reference-data, charge agreements, or container movement into the shell; no unit owns W2-02 foundation work; no unit rewrites W1 live-proof waiver as PASS.

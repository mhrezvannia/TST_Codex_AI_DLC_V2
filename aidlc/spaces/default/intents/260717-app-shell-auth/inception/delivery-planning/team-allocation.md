# Team Allocation - W2-01 App Shell and Auth

## Source Context

This allocation consumes `requirements.md`, `stories.md`, `mockups.md`, `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, and `team-practices.md`. No separate team-formation artifact exists for this intent, so allocation follows the affirmed W2-01 practice of one accountable Platform+UI delivery mob.

## Delivery Mob

| Mob | Type | Ownership | Review hats |
| --- | --- | --- | --- |
| Platform+UI delivery mob | Stream-aligned vertical intent mob | End-to-end W2-01 shell/auth/Booking slice on `intent/W2-01-app-shell-and-auth` from `integ/main-reconciled` at `5dd6481` | Architect, UX/accessibility, backend authorization, quality/evidence, security, preservation |

The mob owns the full vertical path rather than splitting work into UI-only, backend-only, or infrastructure-only teams. This matches `team-practices.md`: one accountable driver through shell/auth/Booking seams, with specialist review hats applied at the relevant Bolt gates.

## Bolt Assignments

| Bolt | Primary owner | Required review hats | Notes |
| --- | --- | --- | --- |
| B01 Shell Login and Booking Read Skeleton | Platform+UI delivery mob | Architect, security, backend authorization, quality/evidence | Highest-risk seam; proves shell/auth/session/Booking read and no `local-user` fallback. |
| B02 Booking Create Allow With Real Subject | Platform+UI delivery mob | Backend authorization, architect, quality/evidence | Adds identity permissions/seeds and allow-path evidence while preserving W1 Booking create/detail. |
| B03 Booking Deny Inside Shell | Platform+UI delivery mob | UX/accessibility, security, backend authorization | Proves `local.reference.admin` denied state, fail-closed behavior, and NFR-07 frontend constraints. |
| B04 Sign-Out and Session Expiry Guard | Platform+UI delivery mob | Security, UX/accessibility, quality/evidence | Proves session clearing and stale-call prevention. |
| B05 Route Compatibility and Preservation Proof | Platform+UI delivery mob | Preservation, architect, quality/evidence | Verifies `/bookings*` compatibility and W0-01/W0-02/W1-01/W2-02 preservation. |
| B06 Final Live Acceptance and Audit Package | Platform+UI delivery mob | Quality/evidence, security, release review | Packages live proof, detector 6d, `erp-fidelity-audit`, `aidlc-audit`, and W1 BLOCKED waiver reference. |

## Branch and Integration Stance

- Primary intent branch: `intent/W2-01-app-shell-and-auth`.
- Base: `integ/main-reconciled` at `5dd6481`.
- Construction should preserve short-lived branch discipline. If child Bolt branches are used, they should merge back to the intent branch in Bolt order after their gate evidence is complete.
- Do not rewrite unrelated prior merged work. Any W0-01, W0-02, W1-01, or W2-02 touched file must have W2-01-specific justification and targeted verification.

## Coordination Rules

- B01 is mandatory before any parallel work.
- B03 and B04 may proceed in parallel after B01 only if edits are kept disjoint and shared shell/session contracts are already stable.
- B05 waits for B02 because route compatibility and preservation checks need a real create/detail path.
- B06 is serial and final because it packages evidence across all prior Bolts.

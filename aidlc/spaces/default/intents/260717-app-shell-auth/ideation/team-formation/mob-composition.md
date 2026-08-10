# Mob Composition Plan - W2-01 App Shell and Auth

## Source Context

This plan consumes `scope-document.md`, `intent-backlog.md`, and `feasibility-assessment.md`. It follows the program backlog ownership model: W2-01 is Platform+UI driven, with Booking contributing to the first mounted module.

## Mob Model

Recommended mob: **Platform+UI W2-01 stream mob**.

| Seat | Primary Focus | Secondary Focus |
|---|---|---|
| Driver | Keep the vertical slice moving through shell/auth/Booking/evidence. | Resolve scope conflicts with W2-02 and W4-01. |
| Navigator | Watch identity, BFF, and backend subject propagation. | Challenge any fake pass or local-only shortcut. |
| UI implementer | Shell, navigation, breadcrumbs, user menu, denied path. | Accessibility and responsive baseline. |
| Backend/BFF implementer | Session-derived headers and Booking backend authorization. | Tests and audit evidence. |
| Reviewer hats | Security, Booking, quality/release. | Approve only with source and live evidence. |

## RACI

| Area | Responsible | Accountable | Consulted | Informed |
|---|---|---|---|---|
| Shell protected route skeleton | Platform+UI mob | Platform+UI driver | Security reviewer | Program owner |
| Real subject propagation | Platform driver + Booking contributor | Platform+UI driver | Security, Booking reviewer | Quality reviewer |
| Denied path and sign-out | Platform+UI mob | Platform+UI driver | Security reviewer | Program owner |
| Booking mount | UI contributor + Booking contributor | Platform+UI driver | Booking reviewer | W4-01 future owner |
| Live evidence and audits | Quality/release reviewer | Program/product approver | Platform+UI driver | All contributors |
| Scope control | Product/program owner | Platform+UI driver | W2-02 and W4-01 owners | All contributors |

## Unit Coverage

| Proto-unit | Mob emphasis |
|---|---|
| U01 shell/login skeleton | Platform driver + UI contributor + security reviewer. |
| U02 real subject propagation | Platform driver + Booking contributor + security reviewer. |
| U03 nav/denied/sign-out | UI contributor + Platform driver + quality reviewer. |
| U04 Booking mount/live proof | Whole mob with Booking and quality review. |

## Working Agreements

- No layer-only handoff: every change must preserve the login -> shell -> Booking -> backend evidence path.
- No false evidence: W1 waiver remains blocked/waived, not pass.
- No scope theft: W2-02 owns design-system foundation; W4-01 owns broad module migration.
- No static actor acceptance: `local-user` may remain only in explicitly local/test bypasses, never in mounted production-like flows.

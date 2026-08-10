# Initiative Brief - W2-01 App Shell and Auth

## Source Context

This brief consumes:

- `intent-statement.md`
- `scope-document.md`
- `intent-backlog.md`
- `competitive-analysis.md`
- `feasibility-assessment.md`
- `constraint-register.md`
- `team-assessment.md`
- `wireframes.md`

## Executive Summary

W2-01 creates the first authenticated LinerCore application shell. A user signs in once, lands in one shell, navigates to Booking, performs Booking work under the real session subject, sees denied states when unauthorized, and signs out. This kills the disconnected app-island pattern and the mounted Booking path's hardcoded `local-user` behavior.

## Problem and Intent

The approved `intent-statement.md` identifies the current problem: auth exists as a separate island, business apps are separate workbenches, and Booking still carries a static local actor path. The intent is a narrow vertical slice: shell/auth plus Booking mount and real subject propagation.

## Market and Investment Rationale

The `competitive-analysis.md` and market research establish that unified launchpad/SSO behavior is table stakes in enterprise ERP/TMS/logistics platforms. The build-vs-buy conclusion is to build in-repo because the value is integration with existing auth, Keycloak, identity-service, Booking BFF/backend, Nginx, and audit evidence.

## Feasibility and Risk Highlights

The `feasibility-assessment.md` concludes W2-01 is feasible with constraints. Existing building blocks are present: `apps/auth`, Keycloak, identity-service authorization, Booking BFF/backend, Booking UI surfaces, and Compose/Nginx.

Key risks from the `constraint-register.md`:

- Static `local-user` remains in mounted Booking paths.
- Local bypass becomes too permissive.
- W2-01 scope expands into W2-02 or W4-01.
- W1 live-proof waiver is misrepresented as a pass.
- Compose runtime blockers prevent observed DoD.

## Scope Boundary

In scope:

- Shell host, protected route skeleton, top bar, nav, breadcrumbs, user menu.
- Existing auth app/session reuse.
- Session-derived subject to Booking BFF/backend.
- Booking mounted inside the shell.
- Denied path and sign-out.
- Live Compose proof and audit evidence.

Out of scope:

- Broad module migration to shell (`W4-01`).
- Design-system foundation (`W2-02`).
- Booking domain rewrite.
- Cloud/AWS deployment.
- Rewriting W1 waiver as pass.

## Proto-Unit Backlog

From `intent-backlog.md`:

| ID | Unit | Priority | Purpose |
|---|---|---|---|
| U01 | Shell, login, protected route skeleton | Must | Establish single entry point. |
| U02 | Session -> BFF -> Booking subject propagation | Must | Kill static actor path. |
| U03 | Nav, breadcrumbs, user menu, denied path, sign-out | Must | Make shell usable and enforce authorization. |
| U04 | Booking mount and live proof | Must | Complete vertical journey. |
| U05 | Non-mounted module placeholders/links | Should | Orient without W4-01 scope creep. |
| U06 | Future module migration pattern notes | Could | Help W4-01 reuse. |

## Concept Visuals

The `wireframes.md` artifact defines six rough screens:

- protected entry/login redirect;
- authenticated shell landing;
- Booking list mounted in shell;
- Booking detail/action mounted in shell;
- access denied inside shell;
- signed-out state.

The product-lead fallback reviewer marked the rough mockups `READY` with no required fixes.

## Team Plan

The `team-assessment.md` recommends one stream-aligned Platform+UI driver mob with Booking contributor/reviewer, security/platform reviewer, quality/release reviewer, and product/program approver. Named staffing and capacity are not supplied and must be confirmed later; no schedule or velocity is assumed.

## Go/No-Go Recommendation

**Recommendation: GO to Inception with conditions.**

Conditions:

1. Keep W2-01 constrained to shell/auth plus Booking mount.
2. Preserve prior merged work: W0-01, W0-02, W1-01, W2-02.
3. Keep W1 live-proof waiver explicit as blocked/waived evidence, not a pass.
4. Make real subject propagation the central acceptance path.
5. Confirm named reviewer availability before Construction.
6. Decide in Inception whether to formally change AI-DLC scope from enterprise to feature or continue enterprise-depth artifacts under the approved W2-01 boundary.

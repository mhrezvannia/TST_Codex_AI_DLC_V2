# Stakeholder Map - W2-01 App Shell and Auth

## Primary Stakeholders

| Stakeholder | Interest | Success Signal |
|---|---|---|
| Authenticated business user | One login, one application shell, predictable navigation, and clear sign-out. | Can enter the shell, open Booking, perform authorized work, and sign out without switching app islands. |
| Booking user / booking desk | Booking list, detail, and actions work inside the shell with the user's real subject. | Booking backend/audit evidence shows the session subject, not `local-user`. |
| Platform team | Keycloak/OIDC, identity-service authorization, BFF security, Nginx edge, and local-dev bypass boundaries remain correct. | Auth path reuses existing app/session surfaces and denied-path behavior works through identity authorization. |
| UI team | Shell navigation, breadcrumbs, user menu, and mounted module layout establish the pattern later module migrations copy. | Shell pattern is narrow, reusable, and does not duplicate W2-02 design-system foundation work. |

## Secondary Stakeholders

| Stakeholder | Interest | Success Signal |
|---|---|---|
| Reference Data, Charge, and CMM module owners | Their modules are not prematurely migrated or rewritten by W2-01. | W2-01 leaves their deeper shell migration to `W4-01` and preserves module ownership boundaries. |
| Quality / release review | Acceptance is live-observed, not document-only or container-start-only. | Compose proof, `aidlc-audit`, and `erp-fidelity-audit` evidence are attached; W1 waiver remains explicit. |
| DevSecOps / operations | Tokens, cookies, route protection, correlation, and trace propagation match enterprise standards. | No browser token exposure; protected routes, denied path, and trace/correlation behavior are testable. |
| Program backlog owner | W2-01 remains a vertical slice in the single program backlog. | Branch and evidence can merge without expanding into W4-01 or W2-02 scope. |

## Decision Makers vs Influencers

Decision makers:

- Platform + UI driver for W2-01 scope, shell/auth approach, and merge readiness.
- Product/program owner for acceptance of the W2-01 vertical journey.
- Security/platform reviewer for auth/session/authorization conformance.
- Quality/release reviewer for live evidence and audit gates.

Influencers:

- Booking contributor, because Booking is the first mounted module and carries the real-subject proof.
- W2-02 UI contributor, because shell should consume design-system work without owning its foundation.
- W1-01 delivery record, because Booking mount consumes merged W1 outputs while retaining the live-proof waiver status.

## Communication Requirements

- Record scope explicitly at each gate: W2-01 is shell/auth plus Booking mount, not global module migration.
- Keep the W1 waiver wording exact: blocked live proof due Elastic image pull failure, not a passing live run.
- Notify Booking contributors before units that touch Booking BFF/backend subject propagation.
- Notify UI/design-system contributors before committing shell primitives that could overlap W2-02 ownership.
- Include source paths and detector outputs in acceptance evidence so later W4-01 module migrations can reuse the pattern.

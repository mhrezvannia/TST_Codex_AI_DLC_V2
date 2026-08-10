# Team Assessment - W2-01 App Shell and Auth

## Source Context

This assessment consumes:

- `aidlc/spaces/default/intents/260717-app-shell-auth/ideation/scope-definition/scope-document.md`
- `aidlc/spaces/default/intents/260717-app-shell-auth/ideation/scope-definition/intent-backlog.md`
- `aidlc/spaces/default/intents/260717-app-shell-auth/ideation/feasibility/feasibility-assessment.md`

## Recommended Team Topology

Use one stream-aligned W2-01 driver mob with Platform+UI accountability, supported by focused contributor/reviewer roles.

Rationale:

- The slice crosses shell, auth, BFF, Booking backend, identity-service authorization, local Compose, and audit evidence.
- Splitting by layer would recreate the horizontal slicing problem the playbook warns against.
- A single accountable mob can prove the real subject path end to end before broader shell chrome.

## Roles

| Role | Responsibility |
|---|---|
| Platform driver | Keycloak/auth/session integration, identity-service seam, local bypass boundaries, Compose/Nginx proof. |
| UI contributor | Shell layout, navigation, breadcrumbs, user menu, denied path, Booking mount ergonomics. |
| Booking contributor/reviewer | Preserve W1/W2 Booking surfaces and verify BFF/backend subject propagation. |
| Security/platform reviewer | OIDC, HttpOnly cookie, CSRF/CSP, authorization, local bypass, denied path. |
| Quality/release reviewer | Live Compose proof, detector 6d, `aidlc-audit`, `erp-fidelity-audit`, evidence package. |
| Program/product approver | Scope acceptance and waiver honesty, especially W1 live-proof wording. |

## Availability and Capacity

No named roster, time zones, or capacity data were supplied. Do not invent dates, velocity, or allocation percentages.

Planning assumption:

- Treat the mob as role-covered rather than headcount-guaranteed.
- Require reviewer availability before Construction code-generation begins.
- Use gate evidence, not schedule promises, as the delivery control.

## Risks

- If Booking contributor review is unavailable, U02 and U04 are high-risk because they touch BFF/backend subject propagation and mounted Booking behavior.
- If security review is unavailable, local bypass and token/cookie handling should not be accepted as complete.
- If quality/release review is unavailable, the live Compose DoD cannot close.

## Recommendation

Proceed with a small stream-aligned mob and named review hats. Confirm actual individuals and availability in delivery planning before construction starts.

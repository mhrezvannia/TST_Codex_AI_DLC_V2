# External Dependency Map - W2-01 App Shell and Auth

## Source Context

This dependency map consumes `requirements.md`, `stories.md`, `mockups.md`, `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, and `team-practices.md`. It lists gated items that can block the Bolt plan.

## Dependency Register

| Dependency | Owner | Blocks | Lead time | Mitigation / workaround |
| --- | --- | --- | --- | --- |
| Nginx edge route to `apps/shell` | Platform+UI delivery mob | B01, B05, B06 | Same Bolt | Add shell service and route in the same Bolt that proves live entry; direct app-port checks are supporting evidence only. |
| Existing `apps/auth` sign-in/callback/session/sign-out | Platform+UI delivery mob consuming auth owner surfaces | B01, B04, B06 | Same Bolt | Reuse existing routes and `packages/auth`; do not add a parallel auth mechanism. |
| Keycloak local identity provider | Local Compose runtime | B01-B06 | Environment startup | Capture startup/health evidence; if blocked, record W2-01 BLOCKED rather than replacing live proof with unit tests. |
| identity-service Booking permissions and grants | Platform+UI delivery mob with backend authorization review | B02, B03, B06 | Same Bolt as B02 | Add `booking:read/create/confirm/validate/price` or equivalent catalog entries, grant to `booking-desk`, and keep deny user without Booking access. |
| `local.booking.user` allow fixture | Platform+UI delivery mob | B02, B06 | Same Bolt as B02 | Add to shared seed pack or W2-01 fixture before B02 closes; evidence must identify real subject. |
| `local.reference.admin` deny fixture | Platform+UI delivery mob | B03, B06 | Existing, verify in B03 | Preserve without Booking access; do not grant Booking permissions while fixing allow path. |
| Booking BFF and booking-service availability | Platform+UI delivery mob | B01-B06 | Environment startup | B01 proves read path; B02/B03/B04 extend the same seam; missing actor must fail closed. |
| Detector 6d hardcoded-auth scan | Quality/evidence review hat | B06 | Final acceptance | Run against mounted shell/Booking surfaces and include output under `artifacts/w2-01-live/app-shell-auth/`. |
| `erp-fidelity-audit` and `aidlc-audit` | Quality/evidence review hat | B06 | Final acceptance | Run only after live evidence package exists; failures block completion. |
| Docker image availability, including known W1 Elastic pull blocker | Local runtime | B06 and any live check | Unknown | Keep W1 waiver explicit as BLOCKED at `compose-start`; record any new W2-01 runtime blocker separately. |

## Non-Dependencies

- AWS, CDK, VPC, IAM, and public-cloud deployment are not W2-01 dependencies.
- W2-02 design-system foundation work is not a W2-01 dependency beyond consuming existing primitives and preserving its files.
- W4-01 broad module migration is not a W2-01 dependency.

## Escalation Rules

- A missing live identity fixture blocks B02, not the final acceptance package only.
- A broken Keycloak/Compose path blocks the affected live Bolt and must be recorded honestly.
- A detector or audit failure blocks B06 until fixed or explicitly recorded as a W2-01 blocker.
- W1's existing live-proof waiver must remain a separate BLOCKED record and cannot be converted into W2-01 evidence.

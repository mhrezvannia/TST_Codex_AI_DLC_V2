# CI/CD Pipeline - U01 Walking Skeleton

## Source Context

This CI/CD pipeline design consumes U01 `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md`, application `services.md`, and U01 `business-logic-model.md`. U01 pipeline design defines local build/test/evidence gates for the new shell service and existing auth/Booking path.

## Build Stages

| Stage | Scope | Required outcome |
| --- | --- | --- |
| Workspace install | Existing package manager workflow. | Dependencies install without adding prohibited frontend libraries. |
| Shell build | `apps/shell` once created. | Next.js/TypeScript build passes. |
| Auth/Booking build | `apps/auth`, `apps/booking`, shared packages touched by U01. | Existing behavior preserved. |
| Compose image build | `apps-shell`, existing app/service images. | Local image builds without cloud dependency. |

## Test Stages

| Stage | Scope | Required outcome |
| --- | --- | --- |
| Shell route tests | `/`, `/booking` protected behavior. | No-session redirect and session render behavior covered. |
| Booking BFF tests | Actor required before `serviceHeaders` and backend fetch. | Missing actor fails closed; no `local-user`. |
| Backend tests | booking-service blank actor rejection. | Protected path cannot synthesize `local-user`. |
| Live smoke | Compose/Nginx shell/auth/Booking read path. | Evidence captures route, actor, correlation, and blocker if any. |

## Security Gates

DevSecOps gates for U01:

- Dependency changes must not add Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js.
- No raw tokens or service tokens in browser-visible code.
- Local/test bypass must remain explicit, profile-gated, and excluded from protected proof.
- Direct app-port proof is supporting only; accepted proof uses Nginx.

## Deployment Strategy

U01 has no production deployment. The deployment target is local Docker Compose profiles `app` or `full`. Rollback is reverting the shell service/Nginx route changes and preserving existing `apps-auth`, `apps-booking`, and backend services.

## Secrets Management in CI/CD

Use existing local environment variable conventions and `infrastructure/env/local.env.example` patterns. Do not introduce AWS Secrets Manager, SSM Parameter Store, Vault, or new CI secret infrastructure for U01. Service tokens remain server-side and must not be printed in command logs or evidence.

## Artifact Management

Build/test/live evidence should feed the W2-01 evidence package under `artifacts/w2-01-live/app-shell-auth/` in later U06. U01-specific artifacts include shell route timing, auth redirect/return, Booking read actor/correlation, and blocker records when runtime cannot start.


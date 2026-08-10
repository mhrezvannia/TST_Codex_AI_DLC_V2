# CI/CD Pipeline - U03 Booking Deny

## Source Context

This CI/CD pipeline design consumes U03 `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md`, application `services.md`, and U03 `business-logic-model.md`. It verifies denied-path infrastructure, fixtures, and shell state.

## Build Stages

| Stage | Scope | Required outcome |
| --- | --- | --- |
| Frontend build | `apps-shell`, `apps-booking`, shared UI touched by deny state. | Denied UI compiles without prohibited libraries. |
| Backend build | booking-service authorization path if touched. | Deny mapping compiles and preserves fail-closed behavior. |
| Seed validation | identity catalog/seed files. | `local.reference.admin` remains without Booking permissions. |
| Compose image build | Existing local services. | No new runtime service or cloud dependency. |

## Test Stages

| Stage | Scope | Required outcome |
| --- | --- | --- |
| Route/UI tests | Shell `/booking` denied state. | One visible `h1`, keyboard-reachable recovery actions. |
| BFF/backend tests | Deny/missing actor paths. | No `local-user`, no fake empty list. |
| Authorization tests | booking-service to identity-service. | Deny/error/timeout fail closed. |
| Live deny smoke | Nginx `/booking` as `local.reference.admin`. | Deny evidence with subject/correlation. |

## Security Gates

- Shell navigation cannot be the authorization source of truth.
- `local.reference.admin` must remain denied.
- Backend deny must not disclose data or mutate Booking state.
- No Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js.

## Deployment Strategy

U03 deploys only in local Compose. Rollback preserves U01 shell routing and U02 allow fixtures while reverting deny UI/mapping changes if needed. No production, canary, blue-green, AWS, or policy-admin deployment is selected.

## Secrets Management in CI/CD

Use existing local env conventions. Do not print service tokens, raw cookies, or authorization internals in CI logs or evidence artifacts.

## Artifact Management

U03 evidence feeds `artifacts/w2-01-live/app-shell-auth/`: deny scenario transcript, actor/authorization evidence, denied UI evidence, no-data/no-mutation observation, correlation id, and blocker rows if needed.


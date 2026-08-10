# CI/CD Pipeline - U02 Booking Create Allow

## Source Context

This CI/CD pipeline design consumes U02 `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md`, application `services.md`, and U02 `business-logic-model.md`. U02 pipeline design verifies the create/detail allow path, identity authorization adapter, and seed/catalog changes.

## Build Stages

| Stage | Scope | Required outcome |
| --- | --- | --- |
| Frontend build | `apps-shell`, `apps-booking`, shared packages touched by U02. | No prohibited frontend libraries or token exposure. |
| Backend build | `booking-service`, identity-service seed/catalog code if touched. | Authorization adapter compiles and preserves W1 Booking behavior. |
| Seed validation | Existing seed-loader input. | `local.booking.user` and Booking permissions exist; `local.reference.admin` remains deny. |
| Compose image build | Existing local app/service images. | No cloud dependency or new runtime service. |

## Test Stages

| Stage | Scope | Required outcome |
| --- | --- | --- |
| BFF actor/idempotency tests | Booking create/detail paths. | Actor is required, idempotency preserved, no `local-user`. |
| Authorization adapter tests | booking-service to identity-service. | Allow permits mutation; deny/error/timeout blocks mutation. |
| Seed/catalog tests | identity seed data. | Allow and deny fixtures are deterministic. |
| Live create/detail smoke | Nginx `/booking/new` to `/booking/[id]`. | Created Booking retrieves by id/reference. |

## Security Gates

- Raw tokens, service tokens, and secrets remain server-side.
- Browser cannot supply actor authority.
- `local.reference.admin` must remain without Booking permissions.
- Dependency changes must not add Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js.

## Deployment Strategy

U02 deploys only to local Compose profiles `app` or `full`. Rollback is reverting seed/config/adapter changes while preserving U01 shell routing and W1 Booking behavior. No blue-green, canary, AWS, or production deployment is selected.

## Secrets Management in CI/CD

Use existing local env conventions. `BOOKING_SERVICE_TOKEN` and any identity-service service credentials remain in server-side env; command logs and evidence must mask or omit them.

## Artifact Management

U02 evidence feeds `artifacts/w2-01-live/app-shell-auth/`: create/detail scenario transcript, actor evidence, authorization allow decision, created id/reference, correlation id, and blocker rows when needed.


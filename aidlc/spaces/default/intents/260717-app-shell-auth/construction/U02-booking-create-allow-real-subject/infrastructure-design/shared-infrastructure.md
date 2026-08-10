# Shared Infrastructure - U02 Booking Create Allow

## Source Context

This shared infrastructure design consumes U02 `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md`, application `services.md`, and U02 `business-logic-model.md`. It identifies shared local resources used by the Booking create allow path.

## Shared Resource Inventory

| Shared resource | Existing owner | U02 use | Boundary |
| --- | --- | --- | --- |
| Nginx shell edge | U01/W2-01 shell infrastructure | `/booking/new` and `/booking/[id]` entry. | Reuse and do not bypass. |
| `apps-shell` | W2-01 shell | Protected route/session actor. | No Booking domain state ownership. |
| `apps-booking` | W1 Booking UI/BFF | Create/detail adapter. | Preserve W1 behavior. |
| booking-service database | W1 Booking | Persist created Booking. | No schema redesign unless W2-01-specific and verified. |
| identity-service catalog | Identity service | Booking permissions and `local.booking.user`. | No role-admin product; deterministic seed only. |
| `local.reference.admin` fixture | Prior identity/reference work | Deny fixture for U03. | Must remain without Booking permissions. |
| W0-01 platform/eventing | Platform foundation | Existing Booking dependencies and correlation. | No eventing redesign. |

## Access Boundaries

- Shell/BFF derives actor from session; browser does not supply service actor authority.
- booking-service calls identity-service for authorization before mutation.
- identity-service owns permission decisions.
- booking-service owns create idempotency and persistence.
- Evidence stores QA-safe subject/action/decision/correlation fields only.

## Cross-Unit Ownership

U02 creates shared prerequisites for later units:

- `local.booking.user` allow fixture for final proof.
- `local.reference.admin` preservation for U03 deny proof.
- booking-service identity authorization path reused by deny and final acceptance.
- create/detail evidence shape reused by U06.

## Preservation Controls

| Prior work | Control |
| --- | --- |
| W0-01 platform/eventing | Do not modify event/outbox/Kafka semantics for create proof. |
| W0-02 reference-data | Do not alter reference-data seed/completeness surfaces or UI. |
| W1-01 Booking | Preserve create/detail/idempotency behavior; only add real-subject authorization/actor hardening. |
| W2-02 design-system foundation | Consume existing UI patterns; no styling foundation work. |

## Failure Isolation

If identity-service authorization is unavailable or seed data is missing, U02 fails closed and records a W2-01 blocker. It must not retry as `local-user`, fake a created detail page, or convert W1 waiver evidence into PASS.


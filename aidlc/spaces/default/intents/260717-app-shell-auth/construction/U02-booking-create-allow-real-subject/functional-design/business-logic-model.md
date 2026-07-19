# Business Logic Model - U02 Booking Create Allow

## Source Context

This model consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. U02 extends the U01 walking skeleton with a live allow path: `local.booking.user` creates a Booking from `/booking/new`, booking-service authorizes the real subject through identity-service, persists the Booking through existing W1 behavior, and renders `/booking/[id]` inside the shell.

## Workflow

| Step | Component | Processing | Output |
| --- | --- | --- | --- |
| 1 | Shell `/booking/new` | Require session from U01 shell guard and resolve actor subject. | `local.booking.user` or corresponding Keycloak subject. |
| 2 | Booking create UI/BFF | Validate create form using preserved W1 Booking rules; attach actor, correlation, and idempotency key. | Create request to booking-service. |
| 3 | booking-service authorization adapter | Map operation to identity request: resource `booking`, action `create`, caller `booking-service`, subject from `X-LinerCore-Actor-Id`, correlation id. | identity-service authorize call. |
| 4 | identity-service | Evaluate `local.booking.user` role/permission catalog. | Allow decision for Booking create. |
| 5 | booking-service command handler | Execute existing create behavior and persistence. | New Booking id/reference and audit/log output. |
| 6 | Shell `/booking/[id]` | Load detail with session-derived actor and correlation id. | Created Booking detail inside shell. |
| 7 | Evidence capture | Collect actor header, identity allow decision, created id, detail retrieval, correlation id. | U02 evidence in the W2-01 live package. |

## Authorization Mapping

| Booking operation | identity resource | identity action | Scope |
| --- | --- | --- | --- |
| Create draft/booking | `booking` | `create` | Empty or tenant/local scope if present. |
| Detail read after create | `booking` | `read` | Created booking id. |
| Confirm, validate, price if encountered by preserved W1 UI | `booking` | `confirm`, `validate`, `price` | Booking id. |

The adapter treats deny, unknown subject, timeout, malformed response, and identity-service error as fail-closed outcomes. U02 does not add a role-admin UI; it adds or consumes deterministic local seed/catalog entries required by FR-12.

## Data Transformations

| Source | Transformation | Target |
| --- | --- | --- |
| Shell session subject | Normalize to `actorSubjectId` and pass into Booking BFF create/detail calls. | `X-LinerCore-Actor-Id`. |
| Create form state | Preserve existing Booking DTO shape and W1 validation semantics. | booking-service create command. |
| Authorization result | Map allow to command execution; map deny/error to shell denied/error state. | Booking response state and evidence. |
| Created booking id/reference | Route to canonical `/booking/[id]`. | Shell detail view. |

## Failure Paths

| Failure | Behavior |
| --- | --- |
| Missing actor | BFF fails closed before booking-service create; no `local-user` retry. |
| Missing Booking permission catalog/seed | U02 remains incomplete; fixture must be added before allow-path proof. |
| identity-service deny/error/timeout | booking-service does not create the Booking; evidence records fail-closed decision with correlation id. |
| booking-service validation failure | Preserve existing W1 validation/error behavior inside shell with correlation id. |
| detail load after create fails | Treat U02 DoD as failed; created Booking must be retrievable at `/booking/[id]`. |

## Traceability

| Requirement/story | U02 behavior |
| --- | --- |
| FR-04, US-04 | Booking create/detail surfaces render inside shell without W1 regression. |
| FR-05, NFR-03, US-02 | BFF and backend use session-derived actor, not `local-user`. |
| FR-06, FR-12 | identity-service authorizes real subject and local fixture exists. |
| NFR-04, NFR-06, NFR-07 | Evidence carries correlation, prior work is preserved, and frontend code stays in approved patterns. |

## Review

Verdict: READY

Findings:

1. Upstream coverage is sufficient. U02 traces to `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`: the design covers shell `/booking/new`, Booking BFF POST, booking-service create, identity-service authorization, Booking persistence/audit, and `/booking/[id]` retrieval with real-subject evidence.
2. Implementability is sufficient. The functional design uses the upstream contracts for `apps/shell`, canonical `/booking*` routes, `serviceHeaders(correlationId, actorSubjectId, idempotencyKey?)`, `requireBookingActor`, `BookingApiController.actor`, `BookingLocalIdentityFilter`, and `IdentityBookingAuthorizationAdapter.authorize(...)`; a developer can implement the create/detail allow path without inventing a new architectural seam.
3. Fail-closed behavior is sufficient. Missing actor, deny, unknown subject, timeout, malformed response, and identity-service errors all block Booking mutation and explicitly avoid `local-user` fallback.
4. Seed and permission coverage is sufficient. The design requires `local.booking.user`, `booking-desk`, Booking `read/create` permissions, preserved W1 action permissions if encountered, and keeps `local.reference.admin` without Booking permissions for the later deny unit.
5. Preservation boundaries are sufficient. U02 preserves W1 create/detail behavior, consumes W0-01, W0-02, W1-01, and W2-02 through stable interfaces only, does not rewrite the W1 waiver BLOCKED state, and leaves deny, sign-out, route compatibility, final audits, and broad preservation evidence to later units.
6. NFR-07 is carried. Frontend work is constrained to existing Next.js/React/TypeScript patterns and forbids Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, and Moment.js.

Required changes: none.

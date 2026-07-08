# Personas - Shared Platform MVP

## Source Trace

These personas are derived from `requirements.md`, `team-practices.md`, and the approved `user-stories-questions.md` plan. Brownfield-only upstream inputs `business-overview.md` and `component-inventory.md` are not applicable to this greenfield Shared Platform intent.

## Priority Ranking

1. Reference Data Administrator
2. Internal Carrier Staff User
3. Security Administrator
4. Platform Operator
5. Downstream Module Consumer
6. Delivery and QA Engineer

## Reference Data Administrator

Role: Internal operations or data governance user responsible for maintaining canonical reference data.

Goals:

- Maintain Party/Customer, Location/Port, Region, Voyage, Currency, ChargeCode, EquipmentType, Commodity, and TradeLane records.
- Prevent duplicate, invalid, inactive, or structurally inconsistent reference data.
- See whether changes have been audited and published as reference-change events.

Pain points:

- Duplicate data entry across modules.
- Manual maintenance without validation.
- No visibility into whether consumers have been notified of a change.

Context:

- Uses `apps/reference-data`.
- Needs create, read, update, deactivate, reactivate, search, filter, validation, audit, and publication status workflows.
- Requires role-based authorization and accessible admin UI behavior.

## Internal Carrier Staff User

Role: Authenticated internal user in pricing, sales, booking desk, equipment control, customer service, or finance-read roles.

Goals:

- Sign in through the shared internal auth flow.
- Understand whether access has been granted or denied.
- See current session and role information when support troubleshooting is needed.

Pain points:

- Fragmented sign-in paths across internal tools.
- Unclear access-denied states.
- No visible route to request missing access.

Context:

- Uses `apps/auth`.
- Does not manage customer-facing identity.
- May have read-only access to reference data depending on role.

## Security Administrator

Role: Internal security or platform access owner responsible for user roles and permissions.

Goals:

- Manage carrier roles and permissions through the platform authorization model.
- Audit role assignment changes.
- Enforce least privilege across Shared Platform apps and services.

Pain points:

- Generic admin roles that are too broad.
- Authorization decisions hidden inside individual applications.
- Insufficient audit evidence for sensitive access changes.

Context:

- Works through `identity-service` authorization APIs and later administration workflows.
- MVP includes role model and authorization surface, not a full customer identity system.

## Platform Operator

Role: Operations user responsible for runtime health, event publication, observability, and support diagnostics.

Goals:

- Monitor Kafka event publication health and failed outbox items.
- Trace requests and events by correlation id.
- Verify services are healthy and producing expected logs, metrics, and traces.

Pain points:

- Silent event publication failures.
- Logs that cannot be linked across API, audit, outbox, and Kafka boundaries.
- No operator-visible status for pending or failed reference changes.

Context:

- Uses operational views, logs, metrics, traces, health checks, and status exposed by platform services.
- Needs enough visibility to support staging and production promotion gates.

## Downstream Module Consumer

Role: Future Charge, Booking, or Container Movement service team consuming Shared Platform APIs and events.

Goals:

- Read canonical reference data through provider APIs.
- Subscribe to typed reference-change events with stable schema versions.
- Validate integrations through OpenAPI, Pact/message-pact, and Avro compatibility checks.

Pain points:

- Shared databases or undocumented reference semantics.
- One generic change event that forces consumers to guess payload meaning.
- Contract drift after downstream teams begin work.

Context:

- Represents future consuming modules only.
- This MVP may create contracts and tests for consumers, but must not build downstream runtime capabilities.

## Delivery and QA Engineer

Role: Engineer or QA owner responsible for CI quality gates, repeatable local execution, seed data, and contract test evidence.

Goals:

- Run the Shared Platform locally through Docker Compose.
- Validate backend services, frontend apps, contracts, schemas, and seed data in CI.
- Preserve the gated walking skeleton and 85% backend coverage practice from `team-practices.md`.

Pain points:

- Non-repeatable local environments.
- Contract or schema checks that run too late.
- Stories that lack testable acceptance criteria.

Context:

- Supports delivery across backend services, Kafka/Schema Registry, Keycloak, and Next.js apps.
- Needs stories to map to tests and deployment checks.

## Persona Relationships

- Reference Data Administrator creates and changes data that Downstream Module Consumers read and receive as events.
- Security Administrator defines roles that govern Reference Data Administrator, Internal Carrier Staff User, and Platform Operator access.
- Platform Operator observes the event and service health impact of administrator actions.
- Delivery and QA Engineer turns story acceptance criteria into automated tests, contract checks, and CI evidence.
- Internal Carrier Staff User validates the shared authentication path and baseline authorization experience.

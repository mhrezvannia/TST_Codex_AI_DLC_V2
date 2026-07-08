# Unit Story Map - Shared Platform MVP

## Source Trace

This story map links `stories.md` to units derived from `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, `decisions.md`, and `requirements.md`. It follows the approved topology in `units-generation-questions.md`.

## Story to Unit Mapping

| Story | Primary unit(s) | Supporting unit(s) |
|---|---|---|
| US-001 Sign in through shared internal auth | U05-app-auth | U02-identity-authz-service, U01-platform-skeleton |
| US-002 Sign out from Shared Platform apps | U05-app-auth | U01-platform-skeleton |
| US-003 Handle access denied and request access | U05-app-auth, U06-app-reference-data | U02-identity-authz-service |
| US-004 Review current session details | U05-app-auth | U02-identity-authz-service |
| US-005 Browse canonical reference sets | U06-app-reference-data, U03-reference-domain-api | U02-identity-authz-service |
| US-006 Search and inspect reference details | U06-app-reference-data, U03-reference-domain-api | U01-platform-skeleton |
| US-007 Create reference records with validation | U03-reference-domain-api, U06-app-reference-data | U02-identity-authz-service, U04-reference-event-outbox |
| US-008 Update reference records safely | U03-reference-domain-api, U06-app-reference-data | U02-identity-authz-service, U04-reference-event-outbox |
| US-009 Deactivate and reactivate reference records | U03-reference-domain-api, U06-app-reference-data | U04-reference-event-outbox |
| US-010 Maintain trade lanes as region pairs | U03-reference-domain-api, U06-app-reference-data | U09-local-seed-compose |
| US-011 View change history and publication status | U04-reference-event-outbox, U06-app-reference-data | U10-observability-deployment |
| US-012 Evaluate platform roles and permissions | U02-identity-authz-service | U10-observability-deployment |
| US-013 Support MVP carrier roles | U02-identity-authz-service | U09-local-seed-compose |
| US-014 Audit role and permission changes | U02-identity-authz-service | U10-observability-deployment |
| US-015 Define permission-review administration boundary | U02-identity-authz-service, U05-app-auth | U07-contracts-dx |
| US-016 Publish typed reference-change events | U04-reference-event-outbox | U07-contracts-dx, U08-quality-gates |
| US-017 Read canonical reference data through provider APIs | U03-reference-domain-api | U07-contracts-dx, U08-quality-gates |
| US-018 Freeze contracts for downstream review | U07-contracts-dx | U08-quality-gates |
| US-019 Monitor event publication health | U04-reference-event-outbox, U10-observability-deployment | U06-app-reference-data |
| US-020 Trace requests across API, audit, outbox, and Kafka | U10-observability-deployment | U02-identity-authz-service, U03-reference-domain-api, U04-reference-event-outbox |
| US-021 Run deterministic local Shared Platform seed data | U09-local-seed-compose | U01-platform-skeleton, U03-reference-domain-api |
| US-022 Enforce CI contract, schema, and coverage gates | U08-quality-gates | U02-identity-authz-service, U03-reference-domain-api, U04-reference-event-outbox, U05-app-auth, U06-app-reference-data, U07-contracts-dx |
| US-023 Build a gated walking skeleton | U01-platform-skeleton, U08-quality-gates, U10-observability-deployment | U02-identity-authz-service, U03-reference-domain-api, U04-reference-event-outbox, U05-app-auth, U06-app-reference-data, U09-local-seed-compose |

## Unit to Story Coverage

| Unit | Stories covered |
|---|---|
| U01-platform-skeleton | US-001, US-002, US-006, US-021, US-023 |
| U02-identity-authz-service | US-001, US-003, US-004, US-005, US-007, US-008, US-012, US-013, US-014, US-015, US-020, US-022, US-023 |
| U03-reference-domain-api | US-005, US-006, US-007, US-008, US-009, US-010, US-017, US-020, US-021, US-022, US-023 |
| U04-reference-event-outbox | US-007, US-008, US-009, US-011, US-016, US-019, US-020, US-022, US-023 |
| U05-app-auth | US-001, US-002, US-003, US-004, US-015, US-022, US-023 |
| U06-app-reference-data | US-003, US-005, US-006, US-007, US-008, US-009, US-010, US-011, US-019, US-022, US-023 |
| U07-contracts-dx | US-015, US-016, US-017, US-018, US-022 |
| U08-quality-gates | US-016, US-017, US-018, US-022, US-023 |
| U09-local-seed-compose | US-010, US-013, US-021, US-023 |
| U10-observability-deployment | US-011, US-012, US-014, US-019, US-020, US-023 |

## Intra-Unit Story Notes

These notes describe grouping inside each unit, not cross-unit implementation order:

- U02 groups carrier role catalog, authorization decisions, Keycloak adapter boundary, and role/permission audit.
- U03 groups reference aggregate model, persistence, validation, provider/admin OpenAPI, and status-independent audit metadata.
- U04 groups event schemas, outbox, publication adapter, and event status.
- U05 groups auth entry, callback, sign-out, access denied, session display, and request-access.
- U06 groups reference workspace navigation, lists, details, forms, validation display, read-only behavior, and event status UI.
- U07 groups OpenAPI/Avro examples, authorization API contract visibility, compatibility status, and downstream review artifacts.
- U08 groups automated quality gates across backend, frontend, contracts, schemas, and coverage.
- U09 groups deterministic seed data and local/on-prem Compose support.
- U10 groups correlation id propagation, logs, metrics, traces, health, smoke, and deployment readiness.

## Coverage Verification

- Every story US-001 through US-023 is assigned to at least one unit.
- Every unit maps to at least one story.
- Stories that span multiple components are intentionally mapped to multiple units.
- No story maps to Charge, Booking, or Container Movement runtime implementation.

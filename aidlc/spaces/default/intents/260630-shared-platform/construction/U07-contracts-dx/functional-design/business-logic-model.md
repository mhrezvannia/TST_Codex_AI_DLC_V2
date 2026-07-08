# Business Logic Model - U07 Published Contracts and Developer Experience

## Source Trace

This U07 functional design derives from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

It covers US-016, US-017, US-018, and US-022. It implements the approved application-design decisions to use REST/OpenAPI for synchronous APIs, Kafka/Avro with Schema Registry for reference-change events, and downstream modules as contract-only future consumers.

## Unit Purpose

U07 makes Shared Platform contracts reviewable, versioned, testable, and consumable without creating downstream runtime code. It publishes OpenAPI contracts for `reference-data-service` and `identity-service`, Avro schemas for nine typed reference-change events, examples, message-pact/provider fixtures, and compatibility status that later CI gates can enforce.

## Contract Publication Workflow

```text
Service contract source changes
  -> generate or validate OpenAPI/Avro artifacts
  -> validate examples against schemas/contracts
  -> run compatibility checks against previous accepted versions
  -> store compatibility status and findings
  -> publish contract catalog artifacts
  -> expose read-only catalog views to apps/reference-data
```

Decision points:

| Decision | Rule |
|---|---|
| Contract lacks version metadata? | Reject publication until version, owner, and status are present. |
| OpenAPI diff is incompatible? | Mark status failed and block downstream freeze. |
| Avro schema breaks compatibility? | Mark status failed; deployment must be blocked later by U08 gates. |
| Example does not validate against schema? | Mark example invalid and fail catalog validation. |
| Downstream runtime code is proposed? | Reject as out of scope; contracts and examples only. |

## OpenAPI Contract Workflow

```text
reference-data-service or identity-service defines API surface
  -> published-language or contract source emits OpenAPI
  -> examples validate request and response shapes
  -> provider contract fixture maps operations to expected behavior
  -> compatibility diff compares previous accepted version
  -> contract catalog records status
```

Required synchronous surfaces:

| Service | Contract scope |
|---|---|
| `reference-data-service` | Provider list/detail APIs for nine reference sets; admin create/update/deactivate/reactivate/search/filter APIs; event/status/history APIs where exposed. |
| `identity-service` | Authorization decision API, effective permissions/session support APIs, role/permission catalog visibility needed by Shared Platform apps. |

Contracts must preserve service-database isolation. Future consumers integrate through API contracts rather than direct database access.

## Avro Event Contract Workflow

```text
Reference aggregate change commits
  -> outbox stores typed event data
  -> Avro schema defines entity-specific payload
  -> common envelope defines event metadata
  -> Schema Registry compatibility validates evolution
  -> examples demonstrate create/update/status operations
```

The catalog includes one event contract per MVP reference set using `referencedata.<entity>.changed`. Every event example includes event id, event type, schema version, source, occurred-at time, correlation id, entity id, operation, and producer metadata.

## Message-Pact and Provider Fixture Workflow

```text
Contract fixture is added or changed
  -> validate fixture shape
  -> bind fixture to OpenAPI operation or Avro event
  -> execute provider verification where implementation exists
  -> record status and evidence
```

Fixtures represent future downstream expectations without implementing downstream services. They can express provider guarantees and message shape expectations while keeping Charge, Booking, and Container Movement outside runtime scope.

## Contract Freeze Workflow

```text
Candidate contracts reach review state
  -> publish catalog version
  -> downstream representatives review OpenAPI and event contracts
  -> findings are recorded
  -> accepted changes update contract version/status
  -> frozen version becomes CI baseline
```

Freeze does not mean permanent immutability. It means later changes require versioning, compatibility assessment, and documented impact.

## Error Handling

| Failure | Behavior |
|---|---|
| Missing contract artifact | Fail catalog validation and name the missing service/event. |
| Invalid OpenAPI | Fail publication with parser/validation detail. |
| Invalid Avro schema | Fail publication and do not mark compatible. |
| Compatibility check unavailable | Mark status unknown and prevent freeze. |
| Example invalid | Fail example set and identify artifact path. |
| Downstream stub detected | Treat as scope violation and block U07 readiness. |

## Non-Goals

- No Charge, Booking, or Container Movement runtime implementation.
- No downstream stub services or UI screens.
- No direct database contracts.
- No custom event broker outside Kafka/Schema Registry.
- No replacement for U08 CI enforcement; U07 defines the contract evidence U08 later gates.

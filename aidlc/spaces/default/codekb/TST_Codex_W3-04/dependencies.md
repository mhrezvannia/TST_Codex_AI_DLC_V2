# Dependencies

## Internal Dependency Topology

The primary Java direction in Booking and CMM is:

`domain-core <- application-service <- dataaccess/messaging`, with `container` assembling the executable service. `booking-service/messaging` depends on `platform-messaging`. Reference Data and Charge Agreement expose `published-language` modules where shared contracts are required.

Cross-service dependencies for W3-04 are:

| Consumer | Provider | Mechanism | Dependency purpose |
|---|---|---|---|
| Booking UIs | Booking BFF/service | HTTP/JSON | Capture and lifecycle operations. |
| Booking service | Reference Data service | HTTP/JSON | Customer, location, voyage, equipment and future commodity/party-role resolution. |
| Booking service | Charge Agreement service | HTTP vendor JSON | Exact pricing request and response. |
| CMM | Booking service | Kafka/Avro | Consume booking confirmation. |
| Apps/services | Identity/Keycloak | HTTP/session/token | User and service access. |
| Service adapters | `platform-messaging` | Java module | Common messaging/outbox infrastructure. |
| Frontend apps | `packages/*` | Yarn workspace imports | Auth, API behavior, types, transformations, UI, utilities. |

## External Runtime Dependencies

| Dependency | Role | Failure/compatibility concern |
|---|---|---|
| PostgreSQL 15 | Service records, snapshots, idempotency, audit, outbox | W3 migration must be additive, idempotent, and preserve incomplete legacy records explicitly. |
| Kafka and Confluent Schema Registry 7.7.1 | Event delivery and Avro schema compatibility | Runtime topic `booking.events` drifts from `booking.confirmed`; live compatibility was not tested. |
| Keycloak | Authentication/authorization | BFF/service credentials and session actor depend on availability. |
| Nginx | Edge routing | Must reconcile singular `/booking` and plural `/bookings` route ownership. |
| Charge Agreement HTTP endpoint | Pricing | Booking uses a 2.5-second command timeout and strict response correlation/equality checks. |
| Reference Data HTTP endpoint | Governed option lookup | Existing voyage and set projection is incomplete for W3-04. |
| Prometheus/Grafana/ELK/Jaeger/OpenTelemetry | Observability | Declared statically; telemetry completeness not verified. |

## Contract Dependencies

- `contracts/openapi/reference-data-service.yaml` defines the Reference Data surface.
- `contracts/openapi/pricing.v1.yaml` defines `/pricing-requests` and manual-pricing cases.
- `contracts/openapi/booking-pricing.v1.yaml` defines only Booking pricing, leaving the rest of Booking without a checked-in OpenAPI contract.
- `contracts/asyncapi` names the enterprise confirmation channel `booking.confirmed`.
- `contracts/avro/booking.confirmed.avsc` and Booking/CMM resource copies share SHA-256 `F718793FFCB3E64E67681DF2DCF92211B1354D39DB20C9DBC6F82932F7A9F5BF`; `equipmentId` is nullable.

Executable-contract coverage is incomplete: static schema identity does not prove that Booking publishes the intended topic, CMM accepts every schema-valid record, or live Schema Registry rules permit deployment.

## W3-04 Coupling and Blockers

1. The quantity-one/physical-ID invariant appears in Booking domain, both create forms, legacy snapshot canonicalization, and CMM consumption; changing one component alone is unsafe.
2. Full commercial fields are absent from Booking domain, command, API, shared TypeScript types, forms, persistence, pricing input, and confirmation contract.
3. `Voyage.java` lacks cargo cutoff and documentation deadline, and the Booking option adapter omits scheduled departure/arrival. OHS/schedule completeness therefore depends on a Reference Data contract change.
4. `PricingInput` defaults create hidden dependency on assumed trade lane and commodity rather than authoritative references.
5. The event schema permits null equipment ID while CMM rejects it; this is a direct producer/consumer semantic contradiction.
6. Duplicate Booking route/form stacks can independently change request shape.
7. Legacy migration/upcast needs authoritative source facts; it must not fabricate missing W3 fields.

## Dependency Governance Opportunities

- Make complete Booking HTTP and Avro contracts authoritative and executable in CI.
- Assign shared-platform ownership for voyage cutoff/deadline and Booking projection changes.
- Require exact reference values before pricing; remove business defaults.
- Introduce consumer tests for nullable equipment ID and requested quantity greater than one.
- Consolidate Booking UI/BFF ownership or define an explicit delegation contract.
- Add a migration compatibility matrix spanning old snapshots, new snapshots, events, and CMM consumption.

The dependency map is derived from static source/configuration; availability and live behavior were not evaluated.

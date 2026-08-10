# Dependencies - LinerCore W1-01 Baseline

## Internal Runtime Dependencies

| Consumer | Provider | Protocol | Current behavior |
|---|---|---|---|
| Booking | Identity | HTTP/authorization port | Authorization checks |
| Booking | Reference Data | HTTP | Customer, location, equipment validation |
| Booking | Charge Agreement | HTTP | Calls active-agreement lookup and assembles quote |
| Booking | CMM | HTTP | Direct confirm/reconfirm handoff; must be replaced in W1 normal flow |
| CMM | Reference Data | HTTP | Movement/reference validation |
| CMM | Booking | HTTP | Direct status callback; must be replaced in W1 normal flow |
| Booking | Kafka/Schema Registry | Avro | Publishes `booking.confirmed` through outbox |
| CMM | Kafka/Schema Registry | Avro | Publishes `containermovement.status` through outbox |
| Charge | Kafka/Schema Registry | Avro | Publishes agreement lifecycle events |

The target W1 dependency direction keeps Booking-to-Charge as synchronous HTTP and makes both Booking-to-CMM interactions Kafka-only. CMM and Booking therefore need consumer adapters, schema-aware deserialization, deduplication, and transactional persistence boundaries.

## Maven Module Dependencies

Each service container depends on its application, data-access, and messaging modules. Application-service modules depend on domain-core and Spring transaction APIs. Data-access modules depend on application ports plus Spring JDBC and Jackson. Messaging modules depend on application ports, `platform-messaging`, Spring Kafka, Avro 1.11.4, and Confluent 7.7.1 libraries.

`platform-messaging` is the shared publishing foundation and must remain the source of generic Kafka publication, schema registration, scheduled relay, and noop protection. W1 should add consumer-side abstractions only where real reuse is established; it must not duplicate the existing publisher infrastructure.

## Frontend Workspace Dependencies

All apps consume workspace packages through Yarn. `apps/booking` currently declares only `@erp/ui`, Next, React, and React DOM. Its source imports a missing local `lib/bookings` module and expects missing `/api/bookings` BFF routes. The UI package supplies the current visual tokens and operational primitives.

## External Services and Data

- PostgreSQL is required for durable service state and outbox/idempotency records.
- Kafka and Schema Registry are mandatory for W1's observed Definition of Done; local-noop publication does not satisfy it.
- Seeded Reference Data must include active customer, location/UN-LOCODE, equipment type, currency, and vessel/voyage records used by the thin flow.
- Keycloak is part of the complete local stack, although app-shell/auth expansion remains outside W1.

## Build and Delivery Dependencies

Backend builds require Maven access to Maven Central and the Confluent repository. Frontend builds require Yarn's immutable lockfile. Docker Compose builds Spring jars and Next workspaces before running the full profile. The environment exposes PostgreSQL on host port 55432 by default, avoiding a known host 5432 conflict.

The live exit gate additionally depends on contract validation/provider verification, the `aidlc-audit` detector, the `erp-fidelity-audit` detector, and evidence under `artifacts/`.

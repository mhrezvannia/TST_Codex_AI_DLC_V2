# Code Structure - LinerCore W1-01 Baseline

## Repository Layout

| Path | Purpose |
|---|---|
| `services/` | Maven reactor and Java services |
| `apps/` | Next.js operational applications |
| `packages/` | Shared TypeScript API, auth, config, types, UI, transformers, and utilities |
| `contracts/` | OpenAPI, AsyncAPI, Avro, examples, Pact-style fixtures, and catalog |
| `infrastructure/` | Dockerfiles, database bootstrap, nginx, observability, environment, and seeds |
| `scripts/` | Contract, seed, readiness, quality, smoke, and local-runtime automation |
| `docs/` | Program backlog, intent definitions, enterprise contracts, and worked examples |
| `aidlc/` | Intent records, method memory, knowledge, audit shards, and CodeKB |
| `.codex/` | AI-DLC engine, agents, sensors, rules, and tools |

## Java Services

The parent Maven reactor contains `platform-messaging`, `identity-service`, `reference-data-service`, `charge-agreement-service`, `booking-service`, and `container-movement-service`.

Common service module roles:

| Module | Responsibility |
|---|---|
| `domain-core` | Aggregates, value objects, lifecycle rules, outbox event models |
| `application-service` | Use cases, ports, authorization, idempotency, transactions |
| `dataaccess` | JDBC and in-memory repository adapters, JSON snapshots, schema SQL |
| `messaging` | Service-specific Avro mapping, publisher adapter, schema resources, serde tests |
| `container` | Spring Boot entry point, REST controllers, configuration, HTTP integrations |
| `application` | Additional facade module retained by Identity, Reference Data, and Charge |
| `published-language` | Shared DTO vocabulary retained by Identity, Reference Data, and Charge |

Booking and CMM do not currently have `application` or `published-language` modules. This is a structural difference, not itself a defect; W1 should follow their established boundaries unless a contract module demonstrably reduces duplication.

## W1 Backend Hotspots

- `Booking.java` is an immutable record whose aggregate fields remain flat: customer, origin, destination, equipment type, attributes, pricing snapshot, exceptions, and audit history.
- `BookingApplicationService` coordinates create/validate/price/confirm/reconfirm, movement status, and outbox publication. Confirm and reconfirm are transactional; movement-status consumption currently is not.
- `BookingApiController` owns all Booking HTTP routes and directly invokes `HttpContainerMovementClient` after confirm/reconfirm.
- `ContainerMovementApplicationService.consumeBookingConfirmed` and `captureMovement` are transactional and idempotency-aware.
- `ContainerMovementApiController` accepts booking-confirmed HTTP input and invokes `HttpBookingMovementStatusClient` after state changes.
- `ChargeAgreementApplicationService.price` contains real pricing behavior, while the REST controller does not expose the OpenAPI pricing paths.

## Frontend Structure

The TypeScript workspaces include apps for auth, reference data, charge agreements, and booking. Shared packages are `api-core`, `auth`, `config`, `shared-types`, `transformers`, `ui`, and `utils`.

`apps/booking` currently contains only `package.json` and `app/BookingWorkbench.tsx`. The component imports missing `lib/bookings`, fetches missing local `/api/bookings` routes, and the package test script names missing `app/page.test.tsx`. There is no `app/page.tsx`, list route, new route, stable detail route, layout, or BFF handler. Compose also declares `apps-container-movement`, but no `apps/container-movement` workspace exists.

## Contracts and Configuration

Contract sources are separated by protocol under `contracts/openapi`, `contracts/asyncapi`, and `contracts/avro`, with examples and provider fixtures. `contracts/catalog/contract-catalog.json` links seams to stories and requirements. Service-local Avro resources duplicate selected contract schemas for runtime loading; W1 must keep these byte/field compatible.

Application-local YAML files select `local` and `kafka` profiles. Compose supplies database, service URL, Kafka, Schema Registry, and topic environment variables. Database schemas are service-local SQL resources rather than version-numbered migrations.

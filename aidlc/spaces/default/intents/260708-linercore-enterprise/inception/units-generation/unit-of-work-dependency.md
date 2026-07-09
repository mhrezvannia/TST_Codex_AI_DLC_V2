# Unit Dependencies - LinerCore Enterprise

## Source Context

This artifact consumes `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, `decisions.md`, `requirements.md`, and `stories.md`. It converts approved Application Design dependencies into a unit DAG for downstream Construction stage fan-out. It describes topology only and does not recommend delivery order or identify a critical path.

## Dependency Rules

- A dependency means the upstream unit defines contracts, runtime capabilities, service foundations, or domain behavior required by the downstream unit.
- The DAG is cycle-free.
- Parallel development is possible where units do not depend on each other.
- Delivery Planning chooses Bolt grouping and economic sequencing from this topology.

## Machine-Readable DAG

```yaml
units:
  - name: local-runtime-foundation
    depends_on: []
  - name: contract-platform-catalog
    depends_on: []
  - name: shared-platform-identity-security
    depends_on: [local-runtime-foundation]
  - name: shared-platform-reference-events
    depends_on: [local-runtime-foundation, contract-platform-catalog, shared-platform-identity-security]
  - name: charge-agreement-pricing-domain
    depends_on: [contract-platform-catalog, shared-platform-identity-security, shared-platform-reference-events]
  - name: booking-lifecycle-domain
    depends_on: [contract-platform-catalog, shared-platform-identity-security, shared-platform-reference-events]
  - name: container-movement-domain
    depends_on: [contract-platform-catalog, shared-platform-identity-security, shared-platform-reference-events]
  - name: booking-charge-pricing-integration
    depends_on: [contract-platform-catalog, charge-agreement-pricing-domain, booking-lifecycle-domain]
  - name: booking-confirmed-journey-integration
    depends_on: [contract-platform-catalog, booking-lifecycle-domain, container-movement-domain]
  - name: movement-status-booking-integration
    depends_on: [contract-platform-catalog, booking-confirmed-journey-integration]
  - name: dnd-pricing-integration
    depends_on: [booking-charge-pricing-integration, movement-status-booking-integration]
  - name: enterprise-seed-migrations-devex
    depends_on: [local-runtime-foundation, charge-agreement-pricing-domain, booking-lifecycle-domain, container-movement-domain]
  - name: enterprise-web-shell-and-workflows
    depends_on: [booking-charge-pricing-integration, booking-confirmed-journey-integration, movement-status-booking-integration, dnd-pricing-integration]
  - name: observability-quality-operation-readiness
    depends_on: [contract-platform-catalog, enterprise-seed-migrations-devex, enterprise-web-shell-and-workflows]
```

## Prose Dependency Matrix

| Unit | Direct dependencies | Why |
|---|---|---|
| `local-runtime-foundation` | None | Provides local infrastructure substrate. |
| `contract-platform-catalog` | None | Defines executable integration contracts and validation tooling. |
| `shared-platform-identity-security` | `local-runtime-foundation` | Needs Keycloak/runtime substrate for auth hardening. |
| `shared-platform-reference-events` | `local-runtime-foundation`, `contract-platform-catalog`, `shared-platform-identity-security` | Needs runtime, schemas, and service auth conventions. |
| `charge-agreement-pricing-domain` | `contract-platform-catalog`, `shared-platform-identity-security`, `shared-platform-reference-events` | Pricing and D&D require contracts, auth, and reference values. |
| `booking-lifecycle-domain` | `contract-platform-catalog`, `shared-platform-identity-security`, `shared-platform-reference-events` | Booking APIs/events require contracts, auth, and reference validation. |
| `container-movement-domain` | `contract-platform-catalog`, `shared-platform-identity-security`, `shared-platform-reference-events` | CMM APIs/events require contracts, auth, and reference validation. |
| `booking-charge-pricing-integration` | `contract-platform-catalog`, `charge-agreement-pricing-domain`, `booking-lifecycle-domain` | The HTTP pricing seam needs provider, consumer, and Pact/OpenAPI assets. |
| `booking-confirmed-journey-integration` | `contract-platform-catalog`, `booking-lifecycle-domain`, `container-movement-domain` | The event flow needs producer, consumer, Avro/AsyncAPI, and Schema Registry subjects. |
| `movement-status-booking-integration` | `contract-platform-catalog`, `booking-confirmed-journey-integration` | Status publication depends on a journey/status context created from confirmed bookings. |
| `dnd-pricing-integration` | `booking-charge-pricing-integration`, `movement-status-booking-integration` | D&D trigger depends on Booking/Charge pricing seam and CMM status consumption. |
| `enterprise-seed-migrations-devex` | `local-runtime-foundation`, `charge-agreement-pricing-domain`, `booking-lifecycle-domain`, `container-movement-domain` | Seed and migrations require target service schemas and runtime. |
| `enterprise-web-shell-and-workflows` | `booking-charge-pricing-integration`, `booking-confirmed-journey-integration`, `movement-status-booking-integration`, `dnd-pricing-integration` | UI workflows must call real APIs and show event-backed state. |
| `observability-quality-operation-readiness` | `contract-platform-catalog`, `enterprise-seed-migrations-devex`, `enterprise-web-shell-and-workflows` | End-to-end evidence needs contracts, deterministic data/runtime, and UI/service flows. |

## Integration Points

| Integration | Units involved | Mechanism |
|---|---|---|
| User auth and capability checks | `shared-platform-identity-security`, all domain/UI units | Keycloak, JWT/RS256, authorization API, audit |
| Reference validation and events | `shared-platform-reference-events`, Charge, Booking, CMM, UI | HTTP API, outbox, Kafka, Avro/AsyncAPI |
| Booking pricing | `booking-charge-pricing-integration` | OpenAPI, HTTP Pact, idempotency, timeout/retry/circuit breaker |
| Booking confirmation to CMM | `booking-confirmed-journey-integration` | Kafka, Avro, AsyncAPI, Schema Registry, message-pact |
| Movement status to Booking | `movement-status-booking-integration` | Kafka, Avro, AsyncAPI, Schema Registry, message-pact |
| D&D trigger and calculation | `dnd-pricing-integration` | Booking boundary evaluation, Charge D&D OpenAPI/Pact |
| Enterprise UI | `enterprise-web-shell-and-workflows` | Typed service clients/BFF routes through reverse proxy |
| Full runtime evidence | `observability-quality-operation-readiness` | E2E tests, logs, metrics, traces, dashboards, CI gates |

## Parallel Development Opportunities

The following sets have no direct dependency between units in the set, so multiple valid topological orderings exist:

- `local-runtime-foundation` and `contract-platform-catalog`.
- `charge-agreement-pricing-domain`, `booking-lifecycle-domain`, and `container-movement-domain` after Shared Platform prerequisites are available.
- `booking-charge-pricing-integration` and `booking-confirmed-journey-integration` after their domain dependencies are available.

These are topology observations only. Delivery Planning must decide actual Bolt grouping, sequencing heuristic, and walking-skeleton composition.

## Risk Controls

- No unit may introduce cross-service database joins.
- No unit may move D&D calculation into Booking or CMM.
- No unit may move movement-status derivation into Booking.
- No unit may claim integration readiness without executable contracts and provider/consumer tests.
- No unit may claim completion from mock UI, TODO-only methods, or containers merely starting.


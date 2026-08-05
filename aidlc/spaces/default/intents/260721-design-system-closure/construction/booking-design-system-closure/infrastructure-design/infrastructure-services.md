# Infrastructure Services — booking-design-system-closure

## Design Inputs

Service selection preserves `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md`, runtime `services.md`, and `business-logic-model.md`.

## Existing Services

| Service | Existing responsibility | W2-02 change |
|---|---|---|
| nginx | Canonical edge routing | None; verify `/booking` route |
| apps-shell | Authenticated shell and canonical Booking presentation | UI closure only |
| apps-booking | Protected Booking BFF and duplicate presentation | Retain APIs/BFF; redirect presentation |
| Keycloak/auth/identity | Session, subject, roles/permissions | None |
| Booking service | Lifecycle, validation/pricing coordination, persistence/outbox | None unless traced compatibility defect |
| Reference Data service | Lookup/validation | None |
| Charge Agreement service | Active agreement/pricing | None |
| Container Movement service | Confirmed-Booking consumer | None |
| PostgreSQL stores | Service-owned persistence | No schema/ownership change |
| Kafka/Schema Registry | Existing async contracts | No topic/schema/transport change |

## Networking and Discovery

Compose service names and existing environment variables remain the internal discovery mechanism. nginx is the browser edge; shell uses same-origin routes; shell adapter calls the Booking BFF; the BFF calls the Booking service only; the Booking service calls Reference Data and Charge Agreement/pricing through its existing adapters. Direct browser-to-service, BFF-to-supporting-service bypass, shell-to-database, cross-service database, and app-to-app source imports are forbidden.

The Wave A env file isolates host ports from the manager demo. No DNS, CDN, public load balancer, service mesh, VPC, firewall, or cloud discovery layer is added.

## Storage, Messaging, and Caching

- Each existing service retains its own PostgreSQL ownership.
- Kafka and Schema Registry retain current asynchronous confirmation/event behavior.
- No cache, read replica, shard, search service, new queue/topic, blob store, shared UI database, or evidence database is created.
- Evidence remains repository files under the required artifact path; temporary raw traces stay in a gitignored staging directory until sanitized.

## Secrets and Configuration

Existing local environment/session configuration remains authoritative. New credentials or secrets are forbidden. Evidence commands/config dumps must redact secret/session/token values. The trusted canonical shell origin for redirects comes from an existing validated/configured runtime boundary, never an arbitrary header or query.

## Health and Failure

Existing container/service health determines local readiness. A failed dependency is surfaced through the typed UI state and preserved logs; it is not bypassed, mocked for the real happy path, or replaced by another stack. Difficult presentation states may use documented test interception/controlled isolated conditions without changing infrastructure contracts.

## Service Non-Selections

No AWS, Kubernetes, managed database, Redis, object storage, monitoring SaaS, WAF, secrets manager, autoscaling, backup, failover, or production service is selected. The generic infrastructure catalog is explicitly inapplicable to this local closure.

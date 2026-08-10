# Infrastructure Services - U05 Returned Status Detail

## Service Inventory

| Service | U05 responsibility | Boundary |
|---|---|---|
| CMM status outbox/relay/mapper | canonical status publication | CMM DB plus shared Kafka/SR |
| Booking listener/error handler | strict contract/order validation and DLT | Booking consumer group |
| Booking receipt/projection repository | dedupe and monotonic one-row upsert | Booking PostgreSQL |
| Booking detail API/BFF | local composite read and role filtering | Booking HTTP |
| Journey status controller | bounded polling/live announcement | browser only |
| W0 platform messaging | generic publisher/registrar/relay/noop guard | shared transport |

No distributed cache, browser event client, CMM read call, cross-database query, or alternate event framework is added. Compose DNS/network, PostgreSQL container, generic builders, observability stack, and schema preflight are reused.

## Projection and Ordering

Booking inserts the envelope ID and executes guarded SQL upsert in one transaction. The ordering tuple compares occurred time, business rank, received time, then event ID. Duplicate envelope is a no-op; stale distinct event records receipt disposition but not projection; failure rolls both back. The projection has one indexed row per `(booking_ref, container_ref)` and retention of receipts >=30 days.

Listener validation covers topic/key/source/type/integer version/schema, booking/container ownership, DCSA codes/timestamps/location, and body/cardinality limits before transaction. The detail DTO allow-lists safe movement fields and omits null location; expanded audit data requires a separate local role.

## Runtime Security

Booking BFF strips browser identity/service headers and supplies Booking-specific local token/role. Consumers validate producer source and contract because local Kafka has no ACL. DLT replay requires the separate replay token/role and writes audited origin/destination/envelope/reason. Logs never dump raw records, tokens, hosts, stack traces, or customer PII.

## Source Coverage

Services realize `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md` and `services.md`, and U05 `business-logic-model.md`.

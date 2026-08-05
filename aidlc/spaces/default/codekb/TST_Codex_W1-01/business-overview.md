# Business Overview - LinerCore W1-01 Baseline

## Business Domain

LinerCore is an internal liner-shipping operations platform. The current repository supports identity and authorization, reference-data stewardship, customer charge agreements, booking lifecycle management, and container journey tracking. W1-01 targets the thin commercial spine from a customer-service booking request through pricing and confirmation to a visible container journey.

The principal actor is a customer-service agent. The intended thin flow is: create a draft booking, validate customer/port/equipment references, obtain an agreement-based USD quote, confirm the booking, let Container Movement Management (CMM) open a journey from the confirmation event, and show the returned movement status on Booking detail.

## Current Business Capabilities

| Capability | Current implementation |
|---|---|
| Identity and authorization | Internal authorization decisions, role assignment, effective permissions, and role catalog |
| Reference data | Versioned reference records, validation, history, outbox events, and seeded business sets |
| Charge agreements | Create/update/approve/suspend/expire agreements, active-agreement lookup, pricing engine in the application layer, and lifecycle outbox events |
| Booking | Draft, validate, request pricing, store quote snapshot, confirm, amend, reconfirm, list/detail, D&D trigger placeholders, and movement-status ingestion |
| Container movement | Open/list/detail journeys, consume a booking-confirmed representation, capture movements, and produce status outbox events |
| Eventing | Shared Kafka/Avro publisher, Confluent schema registration, scheduled outbox relay, retries, and local-noop guard |

## W1-01 Current Gap

The backend contains much of the lifecycle logic, but the live vertical slice is not complete. Booking confirmation and CMM status still use direct synchronous HTTP calls from controllers even though producers also write outbox events. There are no Kafka consumers. The Booking and movement Avro records use flat fields rather than the frozen canonical routing/equipment and DCSA movement structures. The Booking UI is a single orphaned workbench component with no page, API route, data client, or test target.

Charge pricing also has contract drift: the OpenAPI contract declares `POST /api/pricing/quote` and `POST /api/pricing/dnd`, while the running controller exposes only agreement CRUD and `GET /api/charge-agreements/active-lookup`. Booking currently calls active lookup and assembles a quote in its own HTTP adapter.

## Scope Boundaries

W1-01 includes one routing leg, one equipment line with quantity one, USD, FCL dry, live reference validation, live Charge HTTP pricing, Kafka in both directions, durable idempotency, and Booking list/create/detail UI routes. It excludes multi-leg routing, amendments beyond the existing lifecycle, container-number reconfirmation, D&D/invoice completion, the global app shell/auth migration, and the full W2-02 design-system implementation.

The UI may inherit W2-02's visual direction only: neutral operational surfaces, navy anchors, teal success, amber pending, compact radii, IBM Plex typography, and a persistent quote/status rail. W2-02 feature scope is not imported.

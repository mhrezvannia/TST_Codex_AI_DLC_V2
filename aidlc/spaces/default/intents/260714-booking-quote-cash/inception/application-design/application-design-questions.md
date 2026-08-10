# Application Design Questions - W1-01

## Q1 - Kafka Consumer Transaction Boundary

How should each inbound Kafka event cross into Booking or CMM?

A. A thin Kafka listener maps the canonical record and invokes one `@Transactional` application-service method that commits dedupe plus domain/projection state and any resulting outbox row (recommended)
B. A generic inbox relay stores every record first and a second scheduled worker performs business processing
C. The Kafka listener writes repositories directly without an application-service boundary
X. Other (please specify)

`[Answer]:` A - Use a thin Kafka listener and one transactional application-service method for dedupe, domain/projection state, and any resulting outbox row.

## Q2 - Legacy Synchronous Booking-CMM Handoffs

What should W1 do with the current Booking-to-CMM and CMM-to-Booking HTTP handoff code?

A. Remove the outbound clients, wiring, and normal controller invocations, and retire the inbound compatibility command endpoints from the default runtime surface (recommended)
B. Keep the old endpoints behind an explicit diagnostic-only profile while removing all normal-path callers
C. Use HTTP as an automatic fallback whenever Kafka is unavailable
X. Other (please specify)

`[Answer]:` A - Remove the outbound clients, wiring, normal controller invocations, and default-runtime compatibility command endpoints.

## Q3 - Returned Movement Read Model

Where should the latest CMM movement status used by Booking detail live?

A. In a Booking-owned PostgreSQL projection keyed by booking reference and container reference, updated transactionally with event dedupe and returned through the Booking detail API (recommended)
B. In a separate cross-service read-model application introduced for W1
C. Only in CMM, with the browser querying CMM directly from the Booking page
X. Other (please specify)

`[Answer]:` A - Persist a Booking-owned latest-status projection transactionally with dedupe and return it through Booking detail.

## Q4 - Charge Pricing Integration

How should Booking obtain the contract-defined real price?

A. Add Charge's idempotent `POST /pricing-requests` application/API path over its existing agreement and pricing engine, and make Booking an HTTP contract consumer that persists the immutable returned snapshot (recommended)
B. Keep Booking's current active-agreement lookup and calculate the quote inside Booking
C. Copy the Charge pricing engine into a shared library used directly by Booking
X. Other (please specify)

`[Answer]:` A - Add Charge's idempotent pricing endpoint over its existing engine and have Booking persist the returned immutable pricing snapshot.

## Q5 - Canonical Event Cutover

How should W1 replace the current flat event records with the enterprise envelope plus `data` payload schemas?

A. Update Avro, AsyncAPI, examples, fixtures, service schemas, mappers, and consumers as one atomic contract cutover, with additive persistence changes but no dual legacy event path (recommended)
B. Publish and consume both flat and enterprise records during W1
C. Keep the flat broker records and translate only in the UI/API layer
X. Other (please specify)

`[Answer]:` A - Cut over Avro, AsyncAPI, examples, fixtures, service schemas, mappers, and consumers atomically with no dual legacy broker path.

## Q6 - Booking Frontend and BFF Boundary

Where should W1's user-facing implementation live?

A. Complete `apps/booking` as a Next.js App Router application with Booking-local BFF route handlers, shared `@erp/ui` primitives, and server-side backend/service-identity configuration (recommended)
B. Call Booking, Charge, Reference Data, and CMM services directly from browser components
C. Build a new cross-module frontend that owns both Booking and CMM screens
X. Other (please specify)

`[Answer]:` A - Complete `apps/booking` with App Router, Booking-local BFF handlers, shared `@erp/ui`, and server-side service configuration.

## Upstream Sources

Questions refine `requirements.md`, `stories.md`, `architecture.md`, `component-inventory.md`, and `team-practices.md` while preserving the approved Refined Mockups boundaries.

## Q7 - Unreleased Local Schema Subject Rebaseline

W0 live proof registered the obsolete flat Booking/CMM schemas under the final subject names. How should W1 establish the authoritative enterprise v1 contract?

A. Approve `EXCEPTION-W1-01-001`: export/fingerprint and permanently retire only the two unreleased local subjects, register canonical enterprise schemas as version 1, fail on any non-local legacy subject, and expire the exception when W1 merges (recommended)
B. Keep the legacy history and introduce new event major types/subjects, changing the approved W1 contract names
C. Publish both legacy and canonical records during migration
X. Other (please specify)

`[Answer]:` A - Approve `EXCEPTION-W1-01-001` for the two unreleased disposable-local subjects only; it expires when W1 merges and is forbidden for non-local registry history.

## Q8 - Local Compose Broker Security Waiver

W1's current single-broker Compose stack has no TLS, SASL, or service ACLs. How should this mandated-control deviation be governed?

A. Approve `WAIVER-W1-01-001` for local Compose only, mitigated by source/type/schema validation, noop guard, profile-scoped identity, and non-local fail-closed tests; expires 2026-10-15 or when W2-01/platform broker security lands, whichever is earlier (recommended)
B. Add Kafka TLS, SASL, and service-specific ACLs to W1 before implementation
C. Remove live Kafka from W1 acceptance
X. Other (please specify)

`[Answer]:` A - Approve `WAIVER-W1-01-001` for local Compose only with the stated mitigations; it expires 2026-10-15 or when secured broker identity lands, whichever is earlier.

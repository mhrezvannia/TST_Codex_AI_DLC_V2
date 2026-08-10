# Functional Design Questions - U01 Booking Draft Skeleton

## Q1. Legacy Snapshot Conversion

How should existing flat Booking JSON snapshots become the contract-shaped routing/equipment model?

A. Additive V2 columns/tables plus a deterministic repository upcaster for legacy snapshots, followed by an idempotent backfill that rewrites canonical snapshots while preserving IDs, numbers, status, revision, lifecycle, and pricing data (Recommended)
B. Drop and recreate Booking data
C. Keep the generic attributes map as the authoritative model
D. Reject every legacy row after migration
X. Other (please specify)

[Answer]: A. Additive V2 columns/tables plus a deterministic repository upcaster for legacy snapshots, followed by an idempotent backfill that rewrites canonical snapshots while preserving IDs, numbers, status, revision, lifecycle, and pricing data (Recommended)

## Q2. Draft Idempotency Boundary

How should repeated/concurrent create requests behave?

A. One transactional application boundary persists the canonical draft, command receipt/idempotency key plus request hash, and audit; same key/hash returns the existing draft and a different hash returns conflict (Recommended)
B. Keep booking and idempotency writes in separate transactions
C. Generate a new draft on every retry
D. Use browser memory only for duplicate protection
X. Other (please specify)

[Answer]: A. One transactional application boundary persists the canonical draft, command receipt/idempotency key plus request hash, and audit; same key/hash returns the existing draft and a different hash returns conflict (Recommended)

## Q3. Booking Route Composition

How should the stable Next.js routes divide server and client responsibilities?

A. Server pages/BFF own loading, backend URL, identity/correlation, and error normalization; focused client components own form input, focus, table interaction, and later polling, with no fallback records (Recommended)
B. Keep one all-client workbench page with demo fallback data
C. Let the browser call Booking, Charge, Reference Data, and CMM directly
D. Render static mock data until later Bolts
X. Other (please specify)

[Answer]: A. Server pages/BFF own loading, backend URL, identity/correlation, and error normalization; focused client components own form input, focus, table interaction, and later polling, with no fallback records (Recommended)

## Source Context

Questions refine U01 from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. Source verification covers the current flat `Booking` record, `CreateBookingCommand`, `BookingApplicationService.createDraft`, `JdbcBookingRepository`, `booking-schema.sql`, `BookingApiController`, and incomplete `apps/booking` workbench.

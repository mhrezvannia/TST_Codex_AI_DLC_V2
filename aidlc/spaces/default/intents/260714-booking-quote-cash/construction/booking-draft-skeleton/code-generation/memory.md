<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. -->
> This file is maintained during stage execution.

## Interpretations

- 2026-07-16T10:20:00Z - U01 establishes the canonical Booking and migration foundation while later units own validation, pricing, events, projection, recovery, and release proof.
- 2026-07-16T11:15:00Z - Treat the legacy Booking SQL as a byte-faithful Flyway V1 input; the guarded takeover compares PostgreSQL catalog values before explicitly baselining only an exact V1 schema.

## Deviations

- 2026-07-16T11:42:00Z - The in-app browser was unavailable after session resume, so fresh screenshot automation could not run; route rendering was verified through the host production build and the Compose-managed Next container at desktop HTTP boundaries.
- 2026-07-16T11:42:00Z - The standard app Dockerfile dependency reinstall timed out against registry.yarnpkg.com from inside Docker; the live proof used the green host production build over the existing dependency-complete local image without changing the project Dockerfile.

## Tradeoffs

- 2026-07-16T10:20:00Z - Brownfield files are modified in place and protected by migration/upcast tests rather than replaced with a parallel implementation.
- 2026-07-16T11:30:00Z - Keep W0 messaging and the Booking-to-CMM synchronous call unchanged in U01; later W1 units own event-contract migration and removal of the synchronous path.

## Open questions

- 2026-07-16T11:42:00Z - Re-run the unmodified Next app Dockerfile when container outbound npm access is restored to replace the local evidence-image workaround with a normal image-build record.

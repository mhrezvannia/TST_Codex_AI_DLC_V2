<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). -->
> This file is maintained by the orchestrator during stage execution.

## Interpretations

- 2026-08-09T13:20:00Z - Interpreted the selected shellless-app option as domain-owned Next.js deployables mounted through one platform shell/edge contract; one shell is a product composition invariant, not physical co-location of every page.
- 2026-08-09T14:05:00Z - Source inspection corrected the mechanism: Nginx cannot wrap independent Next.js documents. Every canonical app must render the same W2-02-owned PlatformShell implementation and route registry, with no domain-local shell.
- 2026-08-09T14:05:00Z - Canonical Booking-to-Journey composition belongs to apps/shell at /booking/[bookingId], not apps/booking.

## Deviations

- 2026-08-09T13:20:00Z - Declined AWS service mapping despite the AWS support perspective; approved W4 requirements and team practices define isolated local Compose acceptance only and prohibit invented cloud scope.

## Tradeoffs

- 2026-08-09T13:20:00Z - Chose an additive provider-owned CMM timeline projection over BFF/browser calculation; this adds a producer/consumer contract change but keeps lifecycle truth in the owning bounded context.
- 2026-08-09T13:20:00Z - Kept domain apps separate behind one shell registry rather than moving code into apps/shell; this preserves domain cohesion at the cost of explicit edge/session integration work.
- 2026-08-09T14:05:00Z - Selected opt-in CMM v2 media plus a signed subject assertion and server-issued capture-attempt token. This preserves existing v1 compatibility and avoids browser actor/idempotency authority without adding a BFF database.
- 2026-08-09T14:05:00Z - Preserved existing Kafka topics and documented the absent poison/DLQ/replay contract as BLOCKED; adding a dead-letter topic would exceed the approved no-new-topic boundary.

## Open questions

- 2026-08-09T14:05:00Z - Approval Queue admission remains conditional on executable Agreement and Rate Draft/pending filter and pagination evidence.
- 2026-08-09T14:05:00Z - CMM read/capture Identity capabilities and Kafka poison/replay handling remain named platform/service-owner dependencies until executable evidence exists.

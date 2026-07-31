# Infrastructure Services — U05 Booking Consumption and Repricing

## Inputs and selection

This artifact consumes `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`.

U05 reuses Booking Spring/JDBC/PostgreSQL, Charge REST, Identity, Reference
Data, the unchanged nginx route, and the Booking app. It selects no new store, cache, queue, topic,
search service, replica, or discovery mechanism.

## Persistence access

| Operation | Bounded path |
| --- | --- |
| PRICE claim/replay | widened `booking_idempotency` primary key plus state/lease/due |
| completion | owner/fence/state CAS after Booking lock |
| current Booking | existing primary key |
| typed history | exact descending composite index and tuple cursor |
| snapshot append | immutable primary identity; byte-equivalent collision only |

History defaults 20, caps 100, and loads current Booking, one typed page, and
at most one Legacy entry with fixed queries. Full history, N+1, update, and
delete paths are forbidden.

## Charge client and resilience

The adapter fixes URL, v1 media, service identity, correlation, body, and key.
Its pricing-only Apache HC5/RestTemplate pool is max-total/per-route 10 behind
a fair 10-permit/100-ms semaphore; connect is 500 ms, connection acquisition
100 ms, response/overall 2 seconds, and response body 64 KiB. Tomcat is bounded
to 32 threads/32 accept queue/64 connections with no retry executor. Retry sees
only typed timeout/503 and makes at most two two-second calls. The
outer count-window circuit is 5/minimum 5/100%, waits 30 seconds, and admits
one half-open probe. All 4xx/domain/denied/malformed/cancellation results are
ignored by circuit failure recording.

A concurrent half-open rejection persists `probeStartedAt + 5s`. Timeout
cancels and releases all client resources before retry. State is intentionally
process-local; durable receipt due/state prevents restart from losing truth.

## Identity and failure isolation

Human commands reauthorize from the signed session before existence/replay.
Only the configured Booking service identity calls Charge. Missing nonlocal
credentials/bypass fails readiness. Browser-supplied identity, key, date, host,
and correlation never become authority.

Timeout/503/circuit persists bounded Booking-local evidence without a Charge
case or total. Charge no-rate/ambiguity remains terminal Charge case evidence.
Denied, malformed, conflict, validation, in-progress, and Booking-changed stay
distinct.

## Migration and recovery

Booking data access owns the exact V3 receipt/snapshot columns, checks,
backfill, final four-column DESC cursor index, and partial due index specified
in `deployment-architecture.md`; the prepared two-column snapshot index is not
created. Existing CREATE receipts and flattened snapshots remain byte-exact.

The U05 pipeline owns the checksummed Booking dump, isolated restore, candidate
startup, and recovery manifest before deployment. U06 consumes that proof later
but is not required to make U05 recovery executable.

## Capacity and ownership

U04 owns provider semantics; U05 owns Booking receipts/snapshots/repricing;
U06 owns later integrated live/restore proof; W2-02 owns shell, nginx, and
shared UI. Booking never reads
Charge storage. Production retention/partitioning/distributed circuit policy
requires a future architecture decision.

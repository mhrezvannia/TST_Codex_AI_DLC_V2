# Scalability Requirements - U02 Charge Domain Routing and BFF

## Capacity boundary

U02 adds no deployable, cache, broker, database, worker, or global state store.
The existing Next.js Charge app and nginx proxy remain stateless between
requests. PostgreSQL and domain services remain the commercial authorities.
Targets below are isolated-local capacity evidence, not a production forecast.

## Bounded scaling behavior

| ID | Requirement | Pass condition |
| --- | --- | --- |
| SCALE-U02-001 | Serve the fixed read/mutation route mix at 10 concurrent clients. | PERF-U02-001/002 pass per route and aggregate; no OOM, restart, socket exhaustion, or retained-request growth. |
| SCALE-U02-002 | Request/response processing remains bounded at 32 KiB/512 KiB and configured page/query limits. | limit and limit+1/slow-stream tests prove early rejection and bounded memory. |
| SCALE-U02-003 | Route policies remain compile-time enumerated. | adding a domain route requires code/test change; no host/path/media selector or generic proxy exists. |
| SCALE-U02-004 | Multiple existing app instances require no affinity or shared BFF state. | a blocking test alternates the same read and deliberate mutation-attempt contexts across two independently started Charge Next processes with identical approved configuration; session verification, capability result, fixed route, correlation propagation, and derived request key match, with no process-local dependency. |
| SCALE-U02-005 | Backend unavailability is bounded by the 2500 ms deadline and existing connection/permit controls. | a slow dependency cannot create unbounded sockets, retries, queues, or memory. |

No cache is selected: caching authorization, Rate/Agreement state, manual-case
existence, or mutation results risks stale disclosure and false authority.
No RTK or new client state framework is selected; route/query/form-local state
remains sufficient. Automatic mutation retry is prohibited.

## Growth triggers

The following trigger a later measured design decision rather than scope growth
in U02:

- a fixed route independently fails the 100/200 ms BFF-overhead gates after
  profiling;
- bounded response parsing or page size causes unacceptable heap/event-loop
  pressure;
- connection acquisition or backend permit exhaustion occurs at accepted load;
- production observations establish a need beyond the existing topology.

Optimize serialization, request streaming, route code, and proxy configuration
before considering new infrastructure. Any future cache or queue requires a
separate consistency, disclosure, invalidation, and operational design.

## Overload and validation

Overload returns a typed safe failure and does not serve skeleton/fallback
commercial success. Reads may be deliberately retried by a caller after a typed
transient failure; mutations are never automatically retried. Validation uses
the deterministic U02 load driver, bounded-body fault tests, open-connection and
event-loop telemetry, and the mandatory two-process statelessness test. The two
processes are test-harness instances of the existing deployable, not a new
Compose service or production topology claim.

## Upstream coverage

This artifact consumes `business-logic-model.md`, `business-rules.md`,
`requirements.md`, and `technology-stack.md`; it preserves their stateless BFF,
bounded forwarding, no-cache/no-RTK, and existing-topology decisions.

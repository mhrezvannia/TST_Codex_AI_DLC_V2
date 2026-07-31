# Scalability Design - U02 Charge Domain Routing and BFF

## Capacity and topology boundary

This design maps `scalability-requirements.md` while preserving
`performance-requirements.md`, `security-requirements.md`,
`reliability-requirements.md`, `tech-stack-decisions.md`, and
`business-logic-model.md`. U02 adds no deployable, cache, broker, database,
worker, gateway, client state framework, or production topology.

The accepted local design point is 10 concurrent clients across the fixed
read/mutation route mixes. The Charge Next.js process is stateless between
requests; domain services and their databases remain authoritative.

## Per-process resource bounds

Each process exposes 20 protected-request admission permits. Admission occurs
before body consumption and is held through one backend call and browser
delivery/cancellation, with 100 ms admission, 2500 ms backend, and five-second
egress bounds. Ten clients have 2x headroom; higher bursts are rejected before
allocating or queueing bodies without a bound.

Each request has a 32 KiB inbound or 512 KiB outbound bounded byte area plus at
most 64 KiB base bookkeeping. The measured conservative ceiling is 24 MiB:
1 MiB chunks, 513 KiB byte area, 1 MiB text, 16 MiB parsed graph, 2 MiB normalized
graph, 1 MiB queued output, and 2.5 MiB margin. Twenty admissions are <=480 MiB
plus 64 MiB runtime margin; ten clients are <=240 MiB plus margin. Adversarial
fixtures must validate the 16/24 MiB ceilings or force a lower limit/parser.
Page/query/identifier/return-URL limits are enforced before forwarding. After
delivery/cancellation, body areas, graphs, and admission are released on stream
close/cancel/error or the five-second egress deadline.

Reference selectors are isolated behind 10 separate permits, 100 ms wait,
2000 ms deadline, 128 KiB decoded response, 128-character query, 50-option, and
256-character label limits; they cannot starve Charge domain forwarding.

## Stateless multi-process behavior

Session verification uses the signed cookie and identical approved secrets;
route policy is checked-in code; correlation/replay-key derivation is pure and
deterministic. No in-process cache, sticky session, prior request, RTK store, or
local commercial record is required.

The blocking test alternates the same read and deliberate mutation-attempt
contexts across two independently started instances of the existing Charge app.
It proves identical session/capability result, fixed route/media, correlation,
and derived request key. These are test instances, not a new Compose service or
horizontal-production claim.

## Growth and scaling decision path

When a route misses the 100/200 ms overhead gates, evidence is evaluated in this
order: span matching, permit wait, streaming/copy count, serialization,
event-loop delay, sockets, and nginx/path behavior. Code/stream/proxy tuning
precedes any infrastructure proposal.

A later cache, queue, gateway, or new state layer requires a separate decision
covering disclosure, consistency, invalidation, retry/idempotency, recovery,
operations, and cost. U02 does not cache authorization, Rate/Agreement/manual-
case data, errors, or mutation results. URL/query/form-local state remains
sufficient.

## Overload and acceptance

Overload, deadline, malformed/oversized response, and invalid request return
their typed safe non-2xx result. No skeleton or stale commercial success is
served. Mutations are not automatically retried; a lost response is reconciled
against downstream authority before deliberate action.

Acceptance captures per-process permit/in-flight/socket/event-loop/heap/RSS
telemetry, exact route percentiles, and 60-second quiescence. OOM, restart,
retained requests, open-ended sockets, or a process-local affinity dependency is
blocking.

This artifact consumes `performance-requirements.md`,
`security-requirements.md`, `scalability-requirements.md`,
`reliability-requirements.md`, `tech-stack-decisions.md`, and
`business-logic-model.md`.

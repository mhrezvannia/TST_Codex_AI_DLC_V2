# Performance Design - U02 Charge Domain Routing and BFF

## Design basis and measurement boundary

This design implements `performance-requirements.md` while preserving
`security-requirements.md`, `scalability-requirements.md`, and
`reliability-requirements.md`. It uses the brownfield choices in
`tech-stack-decisions.md` and the exact routing/session flows in
`business-logic-model.md`. It measures only nginx plus Charge Next.js BFF
overhead; U01/U03/U04 domain latency and the pricing p99 remain separate.

BFF overhead is browser-facing elapsed time minus the correlation-linked child
backend span on the same isolated host. Raw parent/child timestamps and the
signed delta are retained. Missing/duplicate child spans, correlation mismatch,
or a negative delta invalidates the run; values are never clamped or discarded.

## Forwarding and latency design

Each Next process has one admission semaphore with 20 permits for protected
requests. After session/capability checks but before request-body consumption,
a request waits at most 100 ms; that wait consumes the 2500 ms backend deadline.
The permit is held across body parsing, one backend call, normalization, and
browser delivery. A stream wrapper releases it on delivery close, cancellation,
error, or a five-second egress deadline. At the accepted 10-client load, all calls receive
a permit without queuing; the additional ten permits bound short overlap from
aborts and response finalization. A higher burst that cannot acquire within
100 ms returns the normalized typed 503 and performs no backend call.

Node's native `fetch`/`AbortController` and native connection reuse are retained.
There is no proxy SDK, automatic mutation retry, queue, commercial cache, or
connection pool created per request. The 2500 ms backend timer starts before
permit acquisition and ends after bounded backend consumption; a separate
five-second egress timer bounds slow-browser retention while admission is held.

Per route and aggregate BFF overhead must meet p95 <=100 ms and p99 <=200 ms.
The backend deadline is a failure ceiling, not an allowed healthy latency. The
driver measures every read/mutation route independently so aggregation cannot
hide a slow policy.

## Bounded body and memory design

Browser mutations pre-reject a declared `Content-Length` above 32 KiB, then
always count actual decoded UTF-8 bytes. Backend responses pre-reject a declared
length above 512 KiB but do not trust a missing/smaller header. Both paths read
the stream into one bounded byte area sized to limit+1, abort immediately on the
extra byte, decode once with fatal UTF-8 handling, and parse/normalize once.
`request.json()`, `response.json()`, unbounded `.text()`, and body cloning are
not used on protected forwarding paths.

The measured conservative ceiling is 24 MiB per admission: 1 MiB native chunks,
513 KiB limit+1 byte area, 1 MiB decoded UTF-16 text, 16 MiB parsed graph,
2 MiB normalized graph, 1 MiB serialized/queued output, and 2.5 MiB fixed/native
margin. Twenty admissions bound payload/slow-client retention at 480 MiB plus a
64 MiB runtime margin (544 MiB total); ten clients use <=240 MiB plus margin.
Adversarial 512 KiB high-node-count fixtures must measure within the 16/24 MiB
graph/admission ceilings. A breach blocks acceptance and requires a lower
response limit or bounded incremental parser. All allocations and the permit
are released after delivery, cancellation, error, or egress timeout.

## Edge and route performance

Nginx handles exact `/charge-agreements` with a 308 and forwards the unchanged
base-path URI under `^~ /charge-agreements/`. Next's `basePath` emits matching
HTML, route-handler, and asset URLs without an added asset prefix. Root redirect,
deep-link HTML, asset, and health probes each retain their own 100-sample route
results and zero routing/schema errors.

Existing `/`, `/auth`, `/reference-data`, `/booking`, and `/bookings` locations
are regression-probed and excluded from Charge overhead calculations. No route
test targets or controls manager port 8088; isolated evidence uses 18088.

## Resource telemetry and acceptance

The deterministic driver performs 20 discarded warm-ups per route, the exact
100-call family mixes, unique mutation fixtures/request UUIDs, and nearest-rank
percentiles. It records parent/child spans, correlation, status/code, bytes,
permit wait, event-loop delay, in-flight count, sockets, heap/RSS, per-request
allocation peak, and timeouts.

After 60 seconds of quiescence, in-flight work is zero, upstream connections are
at most idle baseline+2, and heap/RSS meet the greater-of-120%-or-32-MiB bounds.
Unexpected statuses remain failures. Sensitive session/header/body/commercial
content is absent from evidence.

## Upstream coverage

This design consumes `performance-requirements.md`,
`security-requirements.md`, `scalability-requirements.md`,
`reliability-requirements.md`, `tech-stack-decisions.md`, and
`business-logic-model.md`.

## Gate revision

The request-changes gate confirms admission is acquired before body consumption
and held through delivery/cancellation or the five-second egress deadline. The
enforced 24 MiB ceiling makes 20 admissions 480 MiB plus 64 MiB runtime margin
= 544 MiB. This implements the sole remaining iteration-two High finding while
preserving its historical NOT-READY verdict.

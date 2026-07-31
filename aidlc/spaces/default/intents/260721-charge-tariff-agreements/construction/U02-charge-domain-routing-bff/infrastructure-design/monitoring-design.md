# Monitoring Design - U02 Charge Domain Routing and BFF

## Observability boundary

U02 reuses existing stdout logs, Node process metrics, nginx access telemetry,
OpenTelemetry/Jaeger, Prometheus, and Grafana. It creates no monitoring service
and defines local/acceptance gates rather than production pages or SLOs.

Metrics and traces diagnose routing and BFF overhead; they never authorize,
cache, or fabricate domain data. Sensitive session, assertion, selector,
customer, commercial, and provider content is excluded.

## Metrics and measurements

| Instrument | Allowed labels | Gate |
| --- | --- | --- |
| BFF overhead histogram | closed route ID, operation, outcome | per-route and aggregate p95 <=100 ms, p99 <=200 ms |
| admission wait/exhaustion | outcome only | <=100 ms wait; ten-client workload has no queue/exhaustion |
| in-flight/permits | pool kind | 20 protected and 10 selector hard caps |
| request/response bytes | route class, outcome | <=32 KiB inbound, <=512 KiB domain, <=128 KiB selector |
| backend duration/deadline | backend class, outcome | <=2500 ms Charge, <=2000 ms Reference |
| egress close/timeout | outcome | release by close/cancel/error or five seconds |
| Node event-loop/heap/external/RSS | process only | <=24 MiB/admission; heapUsed <=432 MiB, external (includes arrayBuffers) <=48 MiB, `rss-heapUsed-external` <=64 MiB, RSS <=544 MiB |
| sockets | backend class/state | after 60 s, idle baseline +2 maximum |
| route/proxy result | route class/status | zero base-path, asset, schema, or preservation errors |
| config/health | UP/DOWN reason class | invalid configuration never forwards |

IDs, subjects, correlation IDs, query values, paths with record IDs, amounts,
error text, and URLs are prohibited metric labels.

## Parent-child latency proof

The browser/nginx/BFF parent span and exact Charge child span share safe
correlation and trace context. BFF overhead is signed parent elapsed minus
correlation-linked child elapsed on the same isolated host. Missing/duplicate
child spans, correlation mismatch, clock-domain mismatch, or negative delta
invalidates the sample; values are never clamped or discarded.

The driver retains raw monotonic timestamps, route policy ID, expected/actual
status, bytes, permit wait, in-flight count, event-loop delay, sockets,
heap/external/RSS, and host/runtime metadata. Read and mutation routes have
separate 20 warm-ups and exact 100-call result families.

## Logs and redaction

Structured logs allow timestamp, app, closed route/operation/outcome/status
class, safe correlation, elapsed time, byte counts, permit wait, timeout class,
and configuration state. They prohibit cookies, session/assertion secrets,
assertions, Authorization/service headers, subjects, permissions, queries,
bodies, business IDs/values, amounts, provider payloads, and exception text.

nginx logs must not record cookies or protected query strings. Retained evidence
passes deterministic secret/value/redaction scans before manifest indexing.
Correlation is searchable in logs/traces but never a metric label.

## Dashboard

The local U02 dashboard contains:

1. overhead p50/p95/p99/max and sample counts by closed route;
2. admission/selector permits, waits, exhaustion, in-flight, and egress timeout;
3. Charge/Reference child latency and typed failure;
4. inbound/outbound byte distributions and oversize rejection;
5. Node heap/external/array-buffer/RSS, GC, event-loop delay, and restart;
6. sockets before/load/60-second quiescence;
7. nginx exact/prefix/deep-link/asset/health results;
8. configuration health and redaction/preservation gate status.

## Local alert and acceptance gates

| Condition | Action |
| --- | --- |
| overhead percentile breach or invalid span pairing | fail route family; retain raw data |
| admission/body allocation before permit | fail security/resource proof |
| >24 MiB/admission, >432 MiB heapUsed, >48 MiB external, >64 MiB `rss-heapUsed-external`, or >544 MiB RSS | fail; lower limits/permits or change parser |
| retained permit/body/socket after timeout/quiescence | fail leak/reliability proof |
| malformed/oversized provider becomes 200 or leaks content | fail security proof |
| health schema/status differs direct vs nginx | fail route/config proof |
| protected route forwards while configuration DOWN | fail closed-readiness proof |
| existing nginx route regression | abort acceptance |
| manager guard differs before/after | abort and preserve diagnostics |
| secret/session/assertion/commercial content detected | block evidence; rotate if credential exposure |

These are CI/acceptance failures, not production notification rules. A future
operations design must assign owner, severity, channel, retention, and runbook.

## Diagnostic runbooks

For routing failure, render the exact Wave A config, run `nginx -t`, verify base
path and no-suffix proxy semantics, then probe Charge and preserved routes.
Never test against 8088.

For overload/leak, correlate permit lifecycle with body/stream close paths,
AbortController state, sockets, event-loop delay, heap/external/RSS, and the
five-second egress timer. Do not raise memory/permits until a measured design
review.

For configuration DOWN, validate only the presence/shape/fingerprint of origins,
secrets, bounds, and bypass mode without printing values. Healthy probes remain
process-local; dependency outages produce protected-route 503 without changing
configuration health.

## Upstream traceability

This monitoring design consumes `performance-design.md`,
`security-design.md`, `scalability-design.md`, `reliability-design.md`,
`logical-components.md`, `components.md`, `services.md`, and
`business-logic-model.md`. It verifies their overhead calculation, bounded
streams/admission, safe errors, stateless restart, exact routing, and
preservation contracts.

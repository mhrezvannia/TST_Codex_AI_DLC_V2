# Monitoring Design - U03 Agreement Authority

## Observability boundary

U03 uses existing Micrometer/stdout/OpenTelemetry and the optional local
Prometheus/Grafana/Jaeger stack. It defines acceptance gates, not production
pages/SLOs. Telemetry cannot authorize, alter transactions, reset outbox rows,
or fabricate publication success.

## Metrics and SLIs

| Instrument | Closed labels | Gate |
| --- | --- | --- |
| vendor query/command latency | operation, outcome, media | list/detail p95 <=750 ms; commands p95 <=1,000 ms |
| dependency-fault maximum | dependency, typed outcome | every injected fault <=2,000 ms, separate from healthy p95 |
| datasource/query | operation class | pool acquire <=2 s; no N+1/deadlock |
| authority lock | operation/outcome | one overlap winner; independent keys progress |
| commercial transaction | operation/commit/rollback | exact version/link/activity/outbox atomicity |
| assertion verification | closed result | no subject/nonce/header as label; duplicate/capacity visible |
| relay backlog | state/age band | 100 rows recover <=120 s |
| relay publish | event type, typed result, attempt band | exact retry/permanent/eight-attempt behavior |
| JVM/container | process only | three-cycle heap/RSS/GC/CPU quiescence |

IDs, subjects, correlation, customer/match/link values, reasons, event IDs,
payloads, and error text are forbidden labels.

## Logs, traces, and correlation

One safe correlation links BFF assertion outcome, authorization, reference/rate
validation, lock, transaction, activity, outbox and relay. Logs allow closed
operation/outcome/media/error codes, safe IDs only where approved, elapsed time,
pool/lock wait and relay attempt. They exclude assertion/header/secret, customer
or commercial values, payload, SQL parameters, stack/provider text.

Traces cover ingress, dependency calls, transaction/lock, enqueue, and
claim/publish/mark phases. Broker acknowledgement and database mark are separate
spans so ack-before-mark is observable. Redaction scans block evidence.

## Dashboard and gates

Dashboard panels cover per-operation latency/outcomes, exact query counts/plans,
pool/locks, assertion failures/cache occupancy, transaction atomicity, outbox
state/oldest age/attempts, publish latency/results, JVM/container resources, and
legacy/vendor-media preservation.

Local gate conditions:

- unexpected outcome, per-operation percentile, query/N+1, pool/deadlock or
  lock-winner breach fails;
- any partial version/link/activity/outbox commit or hash change fails;
- assertion malformed/replay/capacity bypass fails;
- any row matching both/neither ownership classifiers, any publish of an
  invalid U03-owned row, or missing PERMANENT quarantine fails;
- retry/permanent/delay misclassification, stale-worker mark, deleted terminal
  row, relay pool acquisition >2 seconds under ten commands, or recovery >120 s
  fails;
- legacy byte/route/event compatibility regression fails;
- manager guard or W1 evidence status change aborts acceptance.

Broker/registry outage makes relay state degraded and alerts the local gate but
does not make a successful commercial enqueue disappear.

## Recovery runbooks

For Charge unready, verify exact target/project, Flyway/catalog, datasource,
assertion and repository/outbox wiring. Never baseline drift or edit V1-V4.

For relay backlog, inspect closed state/age/attempt/failure code, broker/registry
health, claim lease and ownership predicates. Never edit payloads, auto-reset
PERMANENT, or requeue outside an approved audited repair.

For uncertain mutation, perform authorized detail/activity/outbox
reconciliation. Never blind-retry or infer success from broker state.

## Upstream traceability

This monitoring design consumes `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`. It verifies their
latency, atomicity, assertion, relay, recovery, and compatibility claims.

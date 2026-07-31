# Monitoring Design — U04 Pricing Provider and Manual Cases

## Input contract and observability boundary

This design consumes `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`.

U04 reuses the existing Prometheus, Grafana, OpenTelemetry, Jaeger, and
container log profiles. Local thresholds are acceptance gates, not production
SLIs, paging policies, or availability promises.

## Metrics and dimensions

| Signal | Type | Bounded labels | Evidence |
| --- | --- | --- | --- |
| pricing duration | histogram | outcome, basis | p99 <=800 ms by scenario |
| manual read duration | histogram | list/detail, outcome | p95 <=750 ms |
| receipt transition | counter | insert/live/conflict/takeover/complete/replay/stale | state-machine proof |
| candidate duration | histogram | agreement/base/surcharge/local | snapshot/query budget |
| manual case | counter | create/reuse, bounded reason | canonical convergence |
| datasource | standard gauges | pool state | max 10, acquisition pressure |
| JVM/container | standard gauges | service/container | post-GC heap/RSS stability |
| readiness | gauge/counter | safe reason class | DB/catalog/auth posture |

Booking references, request hashes, case IDs, owner tokens, correlations,
subjects, customer/party IDs, and commercial values are prohibited metric
labels.

## Logs and traces

Structured logs contain stable event, outcome, duration, replay flag, safe
authority identifiers, and redacted correlation. They omit payloads, booking/
party/customer identifiers, hashes, keys, case snapshots, owner tokens,
credentials, authorization material, rates, amounts, totals, SQL parameters,
and response bytes.

Trace spans cover authorization, claim, candidate snapshot, Agreement
selection, each tariff category, calculation, terminal commit, replay, and
manual reads. Span attributes use bounded outcome/basis/category only. Trace
context crosses BFF/Charge and Booking/Charge boundaries without leaking the
trusted identity envelope.

## Gates and alerts

CI/local acceptance fails on any of the following:

- scenario-specific p99 pricing above 800 ms or manual p95 above 750 ms;
- resolver, calculator, renderer, or case-write activity during terminal replay;
- duplicate canonical case, stale-owner completion, inconsistent terminal
  bytes, or more than one resolver in any two-context race;
- query plan/table scan outside the declared bounded plan;
- monotonic post-GC heap/RSS growth over three cycles;
- readiness before catalog/auth/repository posture is valid;
- logs, metrics, traces, or test artifacts containing prohibited values;
- manager port 8088, W1, sibling route, or sibling service regression.

No production pager threshold is invented. A future environment design must
translate these signals into production SLOs and ownership.

## Dashboards

The U04 dashboard has four panels:

1. request rate/latency/errors by fixed terminal outcome and basis;
2. claim, takeover, conflict, stale-owner rejection, replay, and case convergence;
3. candidate-category latency, pool use/acquisition, query time, heap/RSS;
4. readiness/failure causes and manual list/detail latency.

Evidence exports the dashboard/query definitions, raw latency samples, query
plans, three-cycle resource readings, and redacted trace/log exemplars with the
candidate image and migration hashes.

## Incident and reconciliation workflow

For high conflict/takeover/stale-owner signals, correlate safe IDs, verify
PostgreSQL-time lease behavior, and inspect conditional-update outcomes without exposing
tokens or payloads. For replay mismatch, stop promotion and preserve stored
bytes; never regenerate an acknowledged terminal response. For case mismatch,
run the offline read-only reconciliation and use a separately approved
forward-repair action.

After restart, the runbook waits at most 120 seconds for readiness, then performs
one authorized byte-identical replay and one authorized manual detail. Restore
execution remains U06-owned.

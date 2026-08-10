# Monitoring Design — U05 Booking Consumption and Repricing

## Inputs and posture

This design consumes `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`.
Existing Prometheus/Grafana/OpenTelemetry/Jaeger and bounded container logs are
reused; local gates are not production SLOs.

## Signals

Timers cover capture, raw Charge attempt, retry operation, completion, history,
and direct command-to-response subtype. Counters cover claim/replay/takeover,
stale fence, snapshot collision, timeout/503, circuit open/half-open/rejected,
manual reason, changed Booking, pool/transaction failure, and readiness.

Labels are bounded operation/outcome/basis/reason/replay/retry/circuit only.
Money, payload/fingerprint, customer/route/equipment, owner, identity,
credentials, and correlation are never metric dimensions.

## Logs and traces

Logs contain safe event/code, sequence, basis/source IDs, replay/fence/circuit
state, redacted correlation, and elapsed time. They omit canonical bodies,
provider/DB payloads, SQL parameters, credentials, unit rates, amounts, totals,
and stacks at the HTTP boundary. Traces separate both local transactions from
the transaction-free Charge attempts.

## Gates and dashboards

Acceptance fails on latency/resource bounds, more than two raw calls, circuit
counting any ignored outcome, half-open due drift, client permit/socket/thread
growth, duplicate/divergent snapshot, stale completion, cursor gap/duplicate,
N+1/full history, manager/W1 regression, or prohibited evidence.

Dashboards show command latency by subtype; receipt/fence outcomes; retry/
circuit state; provider attempt latency; history/query plans; datasource,
JVM/container, and readiness. Evidence records raw samples, exact populations,
query plans, circuit clock, pool/client permits, three resource cycles, image/
migration hashes, and redacted exemplars.

Numeric gates include RSS <=480 MiB, heap <=282 MiB, nonheap <=80 MiB,
direct/native <=48 MiB, request/helper thread stacks <=48 MiB, HTTP permits and
open Charge connections <=10, request threads <=32, Hikari active <=10 with no
2-second acquisition timeout, and CPU inside the 1-core container limit.

## Recovery runbook

On provider outage, verify typed outcome classification and durable due time;
never clear receipts or fabricate a price. On stale/collision signals, preserve
both canonical hashes and stop promotion. After restart, prove readiness and
RPO-0 replay within 120 seconds. U05 owns the pre-promotion Booking dump/
isolated-restore artifact; U06 later consumes it for integrated proof.

# W2-03 Structured Logs and Saved Queries

## Status and upstream basis

Status: **QUERY CONTRACT DEFINED; AGGREGATION BACKEND NOT PROVISIONED**.

The log contract consolidates `performance-design`, `security-design`,
`reliability-design`, `monitoring-design`, and `infrastructure-services`.
The current local topology emits structured stdout and bounded U06 JSONL
evidence, but no Loki, CloudWatch Logs, production retention store, or deployed
candidate was proven. Queries below use a portable pipeline notation and must
be translated only after the actual local log datasource is verified.

## Structured event schema

Required safe fields:

| Field | Rule |
|---|---|
| `timestamp` | UTC ISO 8601 |
| `level` | bounded enum |
| `service` | bounded service name |
| `environment` | `local-acceptance` for this intent |
| `event` | stable event code |
| `journey` | bounded journey enum |
| `operation` | bounded operation enum |
| `outcome` | typed bounded outcome |
| `basis` | `AGREEMENT`, `TARIFF`, `MANUAL`, or absent |
| `reasonClass` | bounded safe reason, never free-form exception text |
| `correlationId` | safe 1-128 character diagnostic value; searchable only |
| `traceId` | safe trace linkage; searchable only |
| `durationMs` | non-negative monotonic elapsed duration |
| `statusClass` | bounded HTTP/status class |
| `runId` | isolated acceptance run identifier |

Optional stable resource identifiers may appear only when approved by the
source `security-design`; they must never become metric labels or dashboard
variables.

Forbidden content includes authorization/session/service tokens, credentials,
request/response bodies, canonical pricing payloads, commercial amounts,
customer/party/reference data, request hashes, owner tokens, SQL/parameters,
stack traces at the HTTP boundary, internal URLs, cookies, and browser storage.

## Query notation

The following saved-query grammar is intentionally backend-neutral:

```text
FROM <stream>
| WHERE <bounded predicates>
| STATS <aggregations> BY <bounded dimensions>, BIN(<duration>)
| SORT <field> <ASC|DESC>
| LIMIT <count>
```

For local evidence, the locked U06 evaluator should execute equivalent
filtering over validated JSONL. A future Grafana Loki adapter may translate
these definitions to LogQL. CloudWatch Logs Insights is not configured because
no AWS environment was approved.

## Q01 - typed errors by journey

```text
FROM application
| WHERE level IN ("ERROR", "WARN")
| STATS count() AS events BY service, journey, operation, outcome,
  reasonClass, BIN(5m)
| SORT events DESC
```

Purpose: distinguish authorization, validation, no-rate, timeout, 503, circuit,
integrity, and readiness outcomes without exposing provider payloads.

## Q02 - slow requests

```text
FROM application
| WHERE durationMs > 450
| SELECT timestamp, service, journey, operation, outcome, basis,
  correlationId, traceId, durationMs
| SORT durationMs DESC
| LIMIT 100
```

Purpose: investigate early-warning breaches. Threshold-specific dashboard and
gate evaluation remains authoritative; this query is diagnostic.

## Q03 - pricing terminal distribution

```text
FROM application
| WHERE event = "PRICING_TERMINAL"
| STATS count(), percentile(durationMs, 95), percentile(durationMs, 99)
  BY basis, outcome, reasonClass
```

Expected distinctions include Agreement success, Tariff fallback,
`MANUAL_PRICING_REQUIRED`, ambiguity, authorization denial, validation failure,
timeout/503, and circuit outcome. A no-rate terminal must have a matching safe
manual-case event.

## Q04 - manual fallback consistency

```text
FROM application
| WHERE event IN ("PRICING_TERMINAL", "MANUAL_CASE_COMMITTED")
| GROUP BY correlationId
| ASSERT terminal.outcome = "MANUAL_PRICING_REQUIRED"
  IMPLIES count(manual_case_committed) = 1
```

Purpose: detect missing or duplicate manual-case evidence. The query may use
correlation for joining logs but must not emit correlation as a metric label.

## Q05 - Booking receipt, replay, and Reprice

```text
FROM application
| WHERE journey IN ("BOOKING_PRICE", "BOOKING_REPRICE")
| STATS count() BY operation, outcome, basis, replay, reasonClass
| SORT operation, outcome
```

Expected diagnostics include claim, completion, replay, fence conflict,
snapshot collision, retry, circuit state, and changed/unchanged Reprice.
Canonical bodies and commercial values remain excluded.

## Q06 - dependency containment

```text
FROM application
| WHERE event = "DEPENDENCY_CALL"
| STATS count(), max(durationMs), percentile(durationMs, 95)
  BY service, dependency, operation, outcome, reasonClass, BIN(5m)
```

Purpose: prove Identity, Reference Data, Charge, database, broker, and registry
failures are typed and bounded. It must not collapse `NO_RATE` into
unavailability.

## Q07 - readiness and restart timeline

```text
FROM application
| WHERE event IN ("PROCESS_STARTED", "READINESS_CHANGED", "SEMANTIC_PROBE")
| SELECT timestamp, runId, service, event, outcome, reasonClass, durationMs
| SORT timestamp ASC
```

Purpose: verify 120-second service and ten-minute aggregate startup/restart
bounds. A green process-local health event without the semantic probe is not
readiness proof.

## Q08 - database and contention symptoms

```text
FROM application
| WHERE event IN ("POOL_ACQUIRE", "LOCK_WAIT", "DEADLOCK",
                  "TRANSACTION_TERMINAL", "QUERY_PLAN_GATE")
| STATS count(), max(durationMs), percentile(durationMs, 95)
  BY service, event, operation, outcome, reasonClass
```

Purpose: locate pool acquisition above two seconds, deadlocks, leak symptoms,
N+1/query-plan failures, and transaction ambiguity.

## Q09 - security and redaction gate

```text
FROM evidence_scan
| WHERE outcome != "PASS"
| SELECT timestamp, runId, artifactClass, scannerRule, outcome, safeLocation
| SORT timestamp ASC
```

The scanner must report a safe location and rule, never echo the matched secret
or prohibited commercial content. Any unsafe trace is discarded and its
required evidence cell becomes `BLOCKED`.

## Q10 - manager and sibling preservation

```text
FROM acceptance
| WHERE event IN ("MANAGER_FINGERPRINT", "SIBLING_PROBE")
| GROUP BY runId, target
| ASSERT before.hash = after.hash AND before.semantic = after.semantic
```

Any manager drift on port 8088 is a P1 stop condition.

## Retention and verification

- Retain only redacted, hash-addressed evidence required by the U06 manifest.
- Non-trace logs are capped at 512 MiB and the entire run root at 2 GiB.
- Production runtime retention, archive tiering, privacy classification, and
  deletion ownership remain unapproved.
- Validate JSON grammar, required fields, bounded enums, timestamp ordering,
  correlation linkage, and redaction before a query result is retained.

Current query execution result: **NOT RUN - NO DEPLOYED CANDIDATE AND NO
VERIFIED AGGREGATION BACKEND**.


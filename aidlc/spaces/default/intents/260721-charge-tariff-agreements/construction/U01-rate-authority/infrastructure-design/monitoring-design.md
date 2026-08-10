# Monitoring Design - U01 Rate Authority

## Observability boundary

U01 uses the existing Spring/Micrometer, structured stdout logging, correlation
propagation, Prometheus, Grafana, OpenTelemetry, and Jaeger seams. The optional
Compose `observability` profile is sufficient for local and acceptance proof;
no production monitoring vendor, paging service, retention SLA, or on-call
commitment is selected.

Observability may diagnose and fail an acceptance gate. It may never authorize
a Rate operation, synthesize a successful outcome, expose a commercial amount,
or become a required write inside the commercial transaction. The transactional
`RateActivity` row remains the attributable business audit record.

## Metrics and SLIs

Metric names are implementation-facing proposals and must follow the existing
Micrometer naming convention discovered in the Charge service. All dimensions
are closed, low-cardinality registries.

| Instrument | Type | Allowed dimensions | Acceptance use |
| --- | --- | --- | --- |
| Rate HTTP/application duration | histogram | operation, outcome, category, derived lifecycle | list/detail p95 <=500 ms; mutations p95 <=750 ms |
| Rate outcome | counter | operation, typed outcome | unexpected outcome count must be zero |
| authorization/reference dependency duration | histogram | dependency, outcome | healthy Identity <=100 ms budget; Reference call/fan-out <=250/300 ms |
| dependency unavailable | counter | dependency, reason class | prove timeout, permit, body, contract containment |
| datasource acquire/active/pending | timer/gauge | pool only | acquire <=2 s; no leak or unbounded pending work |
| approval/successor lock wait | timer | lock class, outcome | independent-key progress; same-key deterministic serialization |
| transaction result | counter | operation, commit/rollback | exact activity/commercial atomicity |
| migration/readiness | gauge/counter | state/reason class | catalog drift or missing config remains unready |
| Rate authorization adapter mode | startup/info fingerprint | closed value `local-map` or `identity-http` | Wave A gate requires `identity-http`; never a request label |
| JVM/container | standard gauges | service/container | heap, GC, RSS, CPU and restart evidence |

Forbidden metric dimensions include Rate/version IDs, subject IDs, correlation
IDs, request bodies, amounts, currency values, database errors, exception text,
URLs, and free-form reference values.

Prometheus already scrapes
`charge-agreement-service:8084/actuator/prometheus` every 15 seconds. U01
requires that endpoint to expose only the intended management surface on the
Compose network. Public nginx routing does not proxy actuator endpoints.

## Logs and correlation

Charge emits structured JSON or the existing parseable structured format to
stdout/stderr. Compose log rotation for the Charge and Charge-app containers
must align with the existing bounded posture (`max-size: 10m`, `max-file: 3`)
before acceptance evidence is retained.

Allowed fields are timestamp, level, service, operation, typed outcome/code,
correlation ID, safe subject/service identifier, optional Rate/version stable
identifier, request duration, and safe readiness/migration reason class.
Prohibited fields are tokens, cookies, secrets, Authorization headers,
request/response bodies, SQL/parameters, stack traces at the HTTP boundary,
commercial amounts, customer payloads, and full provider error payloads.

Every BFF request creates or propagates one correlation ID. Charge forwards it
to Identity and Reference Data, associates it with transaction/activity
evidence, and returns it in safe error envelopes. Acceptance joins BFF, Charge,
dependency, database activity, and timing evidence by correlation without
using correlation as a metric label.

## Tracing

When the observability profile is enabled, OpenTelemetry propagates W3C trace
context across nginx/BFF, Charge, Identity, and Reference Data where the
existing applications support it. Spans cover:

- BFF route and Charge HTTP controller;
- service authorization and reference fan-out;
- application command/query;
- bounded JDBC/transaction and lock wait;
- safe outcome classification.

Trace attributes follow the same redaction and cardinality rules as logs. Raw
HTTP bodies, SQL bind values, tokens, amounts, and customer/reference payloads
are never captured. Trace export failure is non-authoritative and cannot change
the Rate result. Acceptance redaction scans retained trace exports before they
enter the evidence manifest.

## Dashboards

The U01 local dashboard is a version-controlled Grafana definition with these
panels:

1. list/detail and mutation p50/p95/p99/max with sample count;
2. operation throughput and typed outcome distribution;
3. Identity and Reference Data latency/unavailable/permit state;
4. Hikari active/idle/pending/acquisition latency;
5. PostgreSQL transaction, lock wait, and deadlock evidence;
6. JVM heap/GC, process RSS/CPU, restart and readiness state;
7. Flyway version/catalog readiness;
8. acceptance run metadata link: commit, image digest, fixture and evidence
   manifest identity.

The dashboard uses no high-cardinality variables. Per-request investigation
uses correlation search in safe logs/traces rather than metric labels.

## Alert and gate definitions

Because no production operations model is approved, the following are local/CI
gate conditions, not production pages:

| Condition | Window | Action |
| --- | --- | --- |
| readiness false after 120 s in available acceptance environment | one startup/restart | fail acceptance; inspect Flyway, DB, credential, adapter configuration |
| unexpected Rate outcome | any sample | fail the relevant test/gate |
| list/detail p95 >500 ms or mutation p95 >750 ms | required post-warm-up samples | fail performance proof; retain raw timings/plans |
| pool acquisition >2 s, deadlock, connection leak | any accepted workload | fail concurrency proof |
| dependency body/permit/deadline bound exceeded | any fault case | fail containment proof |
| Wave A Rate adapter mode is not `identity-http` | rendered config, startup, or evidence probe | abort before business acceptance |
| commercial/activity count or hash mismatch | restart/restore/fault run | fail reliability proof; do not promote evidence |
| secret/commercial payload found in logs/traces/evidence | any scan | block retention/promotion and rotate if necessary |
| manager guard changes on port 8088 | before/after comparison | abort Wave A acceptance and preserve diagnostics |

A future production design must assign owners, severity, notification channel,
retention, error-budget policy, and runbook links before these become pages.

## Incident and diagnostic runbooks

### Charge unready

1. Confirm the target is `linercore-wave-a`, not a manager project.
2. Read safe readiness reason and container status.
3. Verify PostgreSQL health, expected database identity, Flyway checksum/catalog
   state, and required non-local credentials without printing secrets.
4. If the catalog drifted, stop promotion. Use a later forward-repair migration
   or restore a verified backup into a new isolated database.
5. Never baseline a partial catalog, edit an applied migration, or run a
   destructive reset as recovery.

### Dependency unavailable

1. Correlate the typed 503 with dependency/outcome metrics and safe trace/log
   evidence.
2. Verify fixed URL, credential presence, permit saturation, response size/type,
   and shared deadline.
3. Verify Wave A reports `identity-http`, contains no local-map bean, and has
   correlated real Identity decision evidence.
4. Confirm no Rate/activity rows committed for failed mutations.
5. Do not enable cached/default authority or automatic mutation retry.

### Contention or latency regression

1. Preserve raw samples, fixture identity, query count/plans, pool/permit/lock
   state, heap/RSS/CPU, and host metadata.
2. Separate read and mutation families.
3. Fix N+1/query/index issues before changing resource bounds.
4. Re-run fresh same-key and independent-key rounds; do not discard unexpected
   outcomes.

## Evidence retention and compliance

Retained U01/U06 evidence contains configurations hashes, image IDs, safe
metrics/log/trace excerpts, test results, catalog/count/hash proofs, and
redacted timings. It excludes secrets and commercial/customer payloads.
Repository retention is limited to the intent's acceptance record; no PCI,
HIPAA, GDPR, SOC 2, or production log-retention certification is claimed.

The original W1 blocked/waived evidence is immutable and explicitly non-PASS.
Green U01 or later W2-03 evidence is stored separately and may not rewrite,
replace, or summarize that historical status as PASS.

## Upstream traceability

This monitoring design consumes `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`. It assigns
observable proof to their latency, bounded-resource, authorization, reference,
transaction, migration, restart, restore, UI/BFF, and preservation decisions.

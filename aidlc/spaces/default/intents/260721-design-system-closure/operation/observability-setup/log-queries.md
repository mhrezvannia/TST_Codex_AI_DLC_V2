# Log Queries — W2-02 Design-System Closure

## Inputs

Log handling follows `booking-design-system-closure/nfr-design/performance-design.md`, `security-design.md`, `reliability-design.md`, `booking-design-system-closure/infrastructure-design/monitoring-design.md`, and `infrastructure-services.md`.

## Safe local diagnostic queries

Use read-only, service-scoped commands and redact before retaining output:

```powershell
docker logs --since 15m <wave-a-container> 2>&1 |
  Select-String -Pattern 'ERROR|WARN|correlation|timeout|denied'
```

```powershell
docker ps -a --format '{{json .}}' |
  ForEach-Object { $_ | ConvertFrom-Json } |
  Where-Object { $_.Labels -match 'com.docker.compose.project=linercore-wave-a' }
```

Useful fields are timestamp, level, service/app, environment, operation, correlation-safe identifier, result and safe error code. Never retain Authorization, Cookie, Set-Cookie, tokens, passwords, credentials, session values, request bodies, or real production identifiers.

## Run-artifact queries

The evidence package supports deterministic queries without a log index:

- case records by route/state/theme/viewport;
- gate records by command/result/timestamp;
- terminal lineage by sequence/run/predecessor;
- trace-sanitizer report by input/output hash and forbidden-value count;
- browser report by expected/unexpected/skipped/flaky totals.

These files are canonical for W2-02 diagnosis because they are immutable and workspace-bound.

## Aggregation status

No production log aggregation or retention policy is configured. Elasticsearch is currently stopped after an OOM kill, and Kibana cannot answer its status endpoint. Kibana queries are therefore unavailable and no indexed-log PASS is claimed.

Restarting or resizing those protected-manager services requires separate authorization and program-level remediation.

## Retention

Raw browser traces remain temporary and are removed after sanitization. Durable W2-02 evidence is retained with the intent record according to repository history. Docker log retention and Elastic index lifecycle are not specified by this intent.

# Log Queries - W1-01

## Local Evidence Queries

Use these patterns against retained local logs and evidence files under `artifacts/w1-01-live/<run-id>/`. If Kibana becomes available in the full observability profile, the same filters should be translated into saved Kibana searches over redacted service logs.

```text
# Find release-blocking Compose pull failures
docker.elastic.co OR kibana OR compose-start OR timed out
```

```text
# Find one business journey by correlation id
correlationId="<id>" OR bookingId="<id>" OR containerId="<id>" OR eventId="<id>"
```

```text
# Find outbox relay failures
outbox AND (FAILED OR IN_PROGRESS OR retry OR lease OR dead-letter OR schema)
```

```text
# Find Kafka publication and consumption errors
kafka AND (producer OR consumer OR schema-registry OR deserialization OR DLT OR offset)
```

```text
# Find Charge pricing failures
charge-agreement-service AND (pricing OR quote OR SERVER_ERROR OR 5xx OR timeout)
```

```text
# Find nginx user-path smoke failures
localhost:8088 OR nginx OR /bookings OR booking-ui-health
```

## Structured Logging Requirements

Services should emit structured logs with `timestamp`, `level`, `service`, `correlationId`, `requestId`, `eventId`, and safe business identifiers. Logs must not include tokens, connection strings, unrestricted payload dumps, or customer PII. This follows the redaction controls from `security-design.md`.

## Source Coverage

The query set supports `monitoring-design.md` evidence lookup, `security-design.md` redaction rules, `reliability-design.md` fail-fast diagnosis, `performance-design.md` error retention, and `infrastructure-services.md` observer boundaries.

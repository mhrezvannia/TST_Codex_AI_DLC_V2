# Tracing Config - W1-01

## Runtime Configuration

The local observability profile includes OpenTelemetry Collector and Jaeger configuration in `infrastructure/observability/otel-collector.yml`. The expected flow is:

```text
apps-booking / nginx
  -> booking-service
  -> reference-data-service
  -> charge-agreement-service
  -> kafka / schema-registry
  -> container-movement-service
  -> booking-service projection
  -> apps-booking visible status
```

Every request and event in that chain should carry the same correlation identity. Kafka event headers and outbox rows must retain enough correlation data to connect HTTP command, event publication, CMM processing, Booking projection, and browser-visible status.

## Span Expectations

| Span | Required attributes |
|---|---|
| Booking UI page and API call | `service.name`, route, status, correlation ID |
| Booking command handling | booking ID, safe container ID, status transition, correlation ID |
| Charge pricing call | pricing outcome, HTTP status, latency bucket, correlation ID |
| Outbox publish | event type, subject, schema ID, attempt count, correlation ID |
| CMM returned status handling | movement status, event ID, projection target, correlation ID |
| Booking projection update | booking ID, source event ID, projection freshness, correlation ID |

## Runtime Status

Tracing is configured as an observability intent but has not been proven in a fresh full-stack run. The `deployment-execution` stage is blocked before observability containers can be verified because Docker cannot pull the Kibana image from `docker.elastic.co`.

## Source Coverage

Tracing requirements implement the correlation and evidence chain from `monitoring-design.md`, the redaction constraints from `security-design.md`, the fail-fast evidence state from `reliability-design.md`, the timing targets from `performance-design.md`, and the component list in `infrastructure-services.md`.

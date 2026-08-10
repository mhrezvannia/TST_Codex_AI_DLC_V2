# W2-04 Distributed Tracing Configuration

## Status and Upstream Trace

This tracing design follows the latency boundaries in `performance-design`,
the disclosure controls in `security-design`, the recovery/fencing model in
`reliability-design`, the correlation requirements in `monitoring-design`, and
the service topology in `infrastructure-services`.

**Status: COLLECTOR DESCRIPTOR PRESENT, APPLICATION EXPORT NOT ACTIVATED.**
Jaeger and the OpenTelemetry Collector were stopped, and no Booking/CMM OTLP
exporter or Micrometer/OpenTelemetry tracing dependency/configuration was found.

## Existing Collector Path

The checked-in collector accepts OTLP gRPC on 4317 and HTTP on 4318, batches
telemetry, emits debug output, and exports traces to Jaeger over OTLP. Grafana
declares Jaeger as a datasource. The service containers do not currently point
to the collector, so this wiring alone produces no distributed trace.

## Required Trace Topology

One accepted journey should create linked spans for:

```text
Booking confirmation consume
  -> CMM journey transaction
  -> expected-move persistence
  -> CMM capture HTTP
     -> Identity authorization
     -> Reference Data validation
     -> movement/audit/outbox transaction
  -> outbox relay
  -> Kafka containermovement.status publish
  -> Booking consumer receipt/projection transaction
  -> Booking detail/timeline read
```

Separate traces must cover duplicate, wrong-next, DENY, Identity unavailable,
Reference Data unavailable, publisher retry, and Booking consumer retry paths.

## Span and Attribute Contract

Required safe attributes:

- service, environment, operation, result, safe error code;
- correlation ID, event ID, request ID, Kafka topic/partition/offset when
  operationally required;
- outbox/receipt disposition and fencing version;
- dependency name and timeout/unavailable outcome;
- freshness state and bounded duration.

Do not attach tokens, cookies, credentials, raw request/event payloads, provider
response bodies, stack traces, subject claims, or unrestricted business data.
Booking/container/journey identifiers must be access-controlled and are not
metric labels.

## Activation Configuration

For the isolated local profile only:

- add the approved tracing bridge/dependency to Booking and CMM;
- set the OTLP endpoint to the internal collector address;
- propagate W3C `traceparent` plus the existing trusted
  `X-Correlation-Id`;
- instrument inbound HTTP, dependency HTTP, JDBC transaction boundaries,
  outbox relay, Kafka publish/consume, and UI/server read boundaries;
- use 100% sampling only for bounded isolated acceptance fixtures.

Production sampling, retention, exporter security, tenant filtering, and cost
are intentionally undefined until a production target and baseline exist.

## Validation

Activation passes only when a current-image isolated run shows the complete
trace path, retry/error spans, redaction, correlation continuity, and no orphan
consumer span. Collector and Jaeger health without application spans is
insufficient.


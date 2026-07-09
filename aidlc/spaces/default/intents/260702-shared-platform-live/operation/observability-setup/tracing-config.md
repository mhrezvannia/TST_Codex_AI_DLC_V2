# Tracing Config

## Inputs

Tracing config consumes `performance-design`, `security-design`, `reliability-design`, `monitoring-design`, and `infrastructure-services`.

## Existing Assets

- `infrastructure/observability/otel-collector.yml`
- `compose.yaml` services: `otel-collector`, `jaeger`
- Jaeger UI: `http://localhost:16686`

## Trace Paths

Required trace spans after runtime is healthy:

- Browser to `apps-reference-data` BFF.
- BFF to `identity-service` authorize.
- BFF to `reference-data-service` list/detail/create/update/history.
- Reference Data service to outbox/Kafka publisher.
- Seed loader to Identity and Reference Data service APIs.

## Correlation

Every span should carry:

- `x-correlation-id`
- `service.name`
- `reference.set` where applicable
- `subject.id` only where safe and non-sensitive

## Current Status

Tracing configuration exists but runtime trace validation is blocked until services run.

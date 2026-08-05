# Tracing Configuration — W2-02 Design-System Closure

## Inputs

Tracing follows `booking-design-system-closure/nfr-design/performance-design.md`, `security-design.md`, `reliability-design.md`, `booking-design-system-closure/infrastructure-design/monitoring-design.md`, and `infrastructure-services.md`.

## W2-02 trace evidence

The binding trace is the sanitized Playwright archive from the successful create-to-confirm journey. Its pipeline:

1. writes raw trace data only to ignored staging;
2. parses and redacts sensitive headers, tokens, identities and payload values;
3. rebuilds and rescans every archive entry;
4. replay-validates the sanitized archive;
5. promotes only the clean archive with hashes and sanitizer report.

Formal run 36 completed this pipeline and removed raw staging.

## Shared local tracing services

Observed protected-manager services:

- Jaeger UI: HTTP 200 on port 16686;
- Jaeger OTLP gRPC/HTTP: published on 14317/14318;
- OTel Collector gRPC/HTTP: TCP reachable on 14319/14320;
- both containers have been running for approximately 28 hours.

The current repository defines Jaeger and OTel under both `observability` and `full` profiles.

## Instrumentation claim

Service configuration permits OTLP transport, but W2-02 does not prove that every browser → Shell → BFF → service hop emits one complete distributed trace. Correlation-safe request evidence and the sanitized browser trace satisfy the closure contract.

No sampling rate, retention duration, baggage policy, tail sampling, production trace backend, or trace-derived SLO is configured.

## Security controls

Trace evidence must never retain cookies, authorization headers, credentials, local session values, request bodies, or unrelated payloads. Correlation and event identifiers are permitted for diagnosis but are forbidden as high-cardinality metric labels.

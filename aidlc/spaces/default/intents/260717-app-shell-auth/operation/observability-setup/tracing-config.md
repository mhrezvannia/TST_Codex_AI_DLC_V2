# Tracing Config - W2-01 App Shell and Auth

## Upstream Inputs

This tracing config consumes `performance-design`, `security-design`, `reliability-design`, `monitoring-design`, and `infrastructure-services`.

## Trace Path

Required trace/correlation propagation:

```text
Browser -> Nginx -> apps-shell -> apps-booking -> booking-service -> identity-service
```

## Trace Fields

| Field | Rule |
| --- | --- |
| `traceparent` or correlation id | Generated at edge or shell and propagated through BFF/backend |
| `route` | Record canonical route, not raw secret-bearing URL |
| `actorSubjectId` | Record safe subject reference only; never raw token/cookie |
| `bookingId` | Record only when needed for proof; avoid PII expansion |
| `authorizationDecision` | allow, deny, error, timeout |

## Collector Configuration

OTel Collector 0.114.0 receives OTLP gRPC/HTTP and exports traces to `jaeger:4317`; the deprecated `logging` exporter was replaced with `debug`. Jaeger 1.63.0 is running and its UI returns HTTP 200. Alternate host ports are used only for Windows-reserved bindings; container ports stay `4317/4318`.

## Current Status

Collector and trace backend infrastructure are live. W2 applications do not yet emit OTLP spans, so no end-to-end browser-to-Identity trace is claimed.

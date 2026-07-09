# Tracing Config - Charge Agreement Walking Skeleton

## Source Alignment

This artifact consumes `performance-design`, `security-design`, `reliability-design`, `monitoring-design`, and `infrastructure-services`.

## Trace Points

| Trace Point | Span Name | Notes |
| --- | --- | --- |
| Browser route | `charge-agreements.page.load` | Captures UI shell readiness once browser automation is enabled |
| Frontend API route | `charge-agreements.module-info.proxy` | Captures app API route to backend module-info call |
| Backend module-info | `charge-agreements.module-info.read` | Captures dependency-free backend metadata response |
| Reverse proxy | `local-proxy.charge-agreements.forward` | Captures proxy route and upstream target |

## Correlation Fields

Use a request correlation field when live instrumentation is added:

```text
x-correlation-id
x-module=charge-agreements
x-runtime=local
```

## Deferred Instrumentation

AWS X-Ray and OpenTelemetry collector setup are deferred. U01 has a single local backend, local frontend, and reverse proxy path; trace design is documented so later service/API units can add instrumentation without redefining names.


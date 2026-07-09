# Log Queries - Charge Agreement Walking Skeleton

## Source Alignment

This artifact consumes `performance-design`, `security-design`, `reliability-design`, `monitoring-design`, and `infrastructure-services`.

## Local Log Sources

| Source | Expected Content |
| --- | --- |
| Backend process output | Spring Boot startup, health endpoint requests, module-info requests |
| Frontend process output | Next.js startup, API route requests, render/build errors |
| Reverse proxy output | Route match, upstream target, upstream error, response status |
| Build/test output | Maven, TypeScript, Vitest, and Next build results |

## Saved Query Patterns

Backend failures:

```text
ERROR OR Exception OR "Failed to start" OR "port 8084"
```

Frontend failures:

```text
error OR "Failed to compile" OR "port 3002" OR "api/health"
```

Proxy failures:

```text
"charge-agreements" AND (ECONNREFUSED OR "upstream" OR "404" OR "502")
```

Sensitive metadata guard:

```text
module-info AND (token OR password OR secret OR credential OR customer)
```

## Retention

Local logs are retained as run artifacts for the current validation session only. Cloud retention rules are deferred until a cloud or container deployment target exists.


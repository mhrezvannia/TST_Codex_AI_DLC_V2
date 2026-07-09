# Infrastructure Design Questions - local-runtime-foundation

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

No additional human questions were required for this Construction unit. Prior stages already resolve the local runtime profile model, secure defaults, readiness semantics, and Windows-first execution posture.

## Resolved Infrastructure Inputs

| Topic | Resolved input used for design |
|---|---|
| Deployment | Docker Compose profiles: `core`, `app`, `observability`, `devtools`, and `full`. |
| Compute | Local containers for infrastructure and app services, with independent IDE mode for host-run services/frontends. |
| Storage | Local Docker volumes for PostgreSQL, Keycloak, Kafka/Schema Registry, logs, and optional observability services. |
| Networking | Shared Compose network, deterministic local ports, nginx reverse proxy, callback URLs, and route ownership checks. |
| Monitoring | Health matrix, timing reports, bounded logs, readiness categories, and benchmark evidence. |
| Security | Secret-free `.env.example`, ignored local `.env`, deterministic Keycloak bootstrap, local-only auth bypass constraints, and service JWT visibility. |
| Scaling | Profile groups support complete first-release topology while preserving focused module development modes. |

## Ambiguity Analysis

No blocking ambiguity was found. Exact Compose filenames, script names, port values, health endpoint paths, and Windows command wrappers are implementation details constrained by this design.

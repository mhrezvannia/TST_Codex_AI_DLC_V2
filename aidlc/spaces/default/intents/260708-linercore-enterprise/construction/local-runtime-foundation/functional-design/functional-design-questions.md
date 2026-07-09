# Functional Design Questions - local-runtime-foundation

## Source Context

These questions consume `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`.

Graphify was queried through `python -m graphify` for local-runtime context because the `graphify.exe` shim returned access denied in this shell. The graph result surfaced existing Identity, Reference Data, Keycloak, local readiness, Kafka/Schema Registry, and technical-environment references that align with the inception artifacts.

## Q1 - Compose Profile Shape

How should Docker Compose profiles be structured?

A. Use `core`, `app`, `observability`, `devtools`, and `full`, where `full` composes all required infrastructure, backend services, frontends, reverse proxy, contract-test support, and observability. Recommended because this is explicitly required by `requirements.md`, `components.md`, and `unit-of-work.md`.
B. Use only one default Compose profile.
C. Use one profile per service only.
D. Use Kubernetes locally instead of Compose.
E. Defer profiles until Operation.
X. Other (please specify)

[Answer]: A

## Q2 - Runtime Service Topology

Which local services must be in the runtime foundation?

A. PostgreSQL, Keycloak, Kafka, Schema Registry, reverse proxy, shared network, profile wiring, health/readiness checks, and hooks for services/frontends/observability. Recommended; domain services can be added as they are built.
B. PostgreSQL only.
C. PostgreSQL and Keycloak only.
D. Kafka and Schema Registry only after Operation.
E. Public cloud managed services instead of local infrastructure.
X. Other (please specify)

[Answer]: A

## Q3 - Environment And Secrets Handling

How should local configuration be handled?

A. Provide `.env.example` with no secrets, local-only defaults, deterministic port names, documented override rules, and explicit prevention of unsafe auth-bypass settings outside local mode. Recommended by `requirements.md` and team practices.
B. Commit real local secrets for convenience.
C. Require every developer to invent local environment names.
D. Keep all configuration inside Compose YAML only.
E. Defer configuration documentation until CI/CD.
X. Other (please specify)

[Answer]: A

## Q4 - Health And Readiness Evidence

What counts as runtime readiness?

A. Health checks for infrastructure and services, profile-specific status commands, logs access, migration/seed hooks, contract-test hooks, and a clear distinction between container-started and application-ready. Recommended because team practices forbid hiding Docker/Kafka/Schema Registry/Keycloak blockers.
B. Containers start without checking application readiness.
C. Only frontend pages load.
D. Only unit tests pass.
E. Readiness is judged manually.
X. Other (please specify)

[Answer]: A

## Q5 - Independent IDE Development Mode

How should local runtime support one app/service running outside Docker?

A. Infrastructure remains in Docker; one selected service or frontend can run from the host IDE using documented env vars, ports, service URLs, and callback URLs. Recommended because `unit-of-work.md` requires independent IDE support.
B. Everything must always run inside Docker.
C. Everything must always run on the host.
D. IDE mode is unsupported.
E. IDE mode waits until Operation.
X. Other (please specify)

[Answer]: A

## Q6 - Runtime Boundary

What work is explicitly outside this unit?

A. Domain behavior, business seed fixtures, migrations owned by service domains, production cloud provisioning, and observability dashboard semantics are outside this unit; this unit exposes hooks and local substrate only. Recommended to keep boundaries aligned with `unit-of-work.md` and `services.md`.
B. This unit should implement all service business logic.
C. This unit should own all business seed data.
D. This unit should define production cloud infrastructure.
E. This unit should decide all observability SLOs.
X. Other (please specify)

[Answer]: A

## Recommended Answer Set

Recommended answers for confirmation: Q1 A, Q2 A, Q3 A, Q4 A, Q5 A, Q6 A.

Rationale: this preserves the local-first enterprise runtime requirement, keeps runtime evidence honest, supports Windows developers, and avoids moving domain or Operation responsibilities into the infrastructure foundation.

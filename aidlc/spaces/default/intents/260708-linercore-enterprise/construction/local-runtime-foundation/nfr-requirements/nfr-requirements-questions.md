# NFR Requirements Questions - local-runtime-foundation

## Source Context

These questions consume `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

Recommended answers were applied under explicit stage-level approval for remaining NFR Requirements units.

## Q1 - Startup Budget

What startup target should local runtime profiles meet?

A. `core` should become infrastructure-ready within 5 minutes and `full` should become application/evidence-ready within 15 minutes on a normal Windows development machine. Recommended.
B. `full` may take up to 30 minutes.
C. Only `core` has a target.
D. Startup time is not measured.
E. Defer startup targets to Build and Test.
X. Other (please specify)

[Answer]: A

## Q2 - Readiness Honesty

How should runtime readiness be reported?

A. Distinguish `container_started`, `infrastructure_ready`, `application_ready`, and `evidence_ready`; never mark container startup as enterprise readiness. Recommended.
B. Container startup is enough.
C. Health checks are manual.
D. Only service logs are needed.
E. Defer readiness semantics to Operation.
X. Other (please specify)

[Answer]: A

## Q3 - Security Defaults

What security posture should local runtime enforce?

A. Secret-free `.env.example`, deterministic Keycloak bootstrap, explicit local-only bypass flags, service JWT/RS256 settings, and no accidental non-local bypass. Recommended.
B. Local auth can be disabled by default.
C. Secrets may be committed for local convenience.
D. Security is deferred to production.
E. Defer auth defaults to Identity implementation.
X. Other (please specify)

[Answer]: A

## Q4 - Local Capacity Baseline

What local capacity should the runtime design support?

A. One instance of each enterprise backend/frontend, PostgreSQL logical databases/users, Kafka, Schema Registry, Keycloak, reverse proxy, and observability services under the `full` profile. Recommended.
B. Shared Platform only.
C. Backends only, no frontend.
D. Infrastructure only.
E. Defer capacity to deployment stages.
X. Other (please specify)

[Answer]: A

## Q5 - Reliability Policy

How should runtime failures be handled?

A. Fail fast with exact blocker, owner, port/service/profile, remediation command, and preserve logs; reset must be explicit and scoped to local volumes. Recommended.
B. Retry indefinitely.
C. Treat missing optional services as green.
D. Hide infrastructure blockers behind warnings.
E. Defer failure handling to operations.
X. Other (please specify)

[Answer]: A

# Market Trends - Shared Platform Local Functionality

## Context

This report consumes `ideation/intent-capture/intent-statement.md`. The relevant trends are the standards and operational expectations that make Shared Platform a prerequisite for the rest of LinerCore.

## Relevant Trends

| Trend | Impact on this initiative |
| --- | --- |
| Standards-based container visibility | DCSA Track & Trace makes normalized movement data and event semantics important for later Container Movement work. Shared Platform must preserve contract discipline and correlation conventions. |
| Contract-first integration | Pact and Schema Registry compatibility checks are now table-stakes for independently built services. Shared Platform must provide real contracts and running provider behavior, not only placeholder schemas. |
| Centralized OIDC and least-privilege authorization | Keycloak/OIDC is commodity; carrier-specific role decisions belong in `identity-service`. The local stack should prove this split. |
| On-prem/self-hosted delivery | Enterprise Tech-Env mandates on-prem Docker Compose, GitHub Actions self-hosted runners, and self-hosted registries. Local functionality should mirror that deployment posture. |
| Developer experience as a delivery risk | If the local platform cannot run easily, downstream module teams will build against stale stubs and drift from contracts. Local Compose, seed execution, and quality gates are strategic enablers. |

## Table-Stakes Capabilities

| Capability | Why it is table-stakes |
| --- | --- |
| Docker Compose local stack | Needed to run backing services and prove local development flows. |
| Java/Maven backend verification | Required for Spring Boot services and CI quality gates. |
| Keycloak-backed auth with explicit bypass | Authentication must be real for integration, while local bypass must remain deliberate and visibly non-production. |
| Reference-data CRUD and history | Reference-data admins need more than a read-only demo. |
| Outbox/status visibility | Event publication must be observable before downstream modules consume it. |
| Contract and schema compatibility checks | Prevents downstream Charge, Booking, and Container Movement from integrating against unstable seams. |

## Differentiators

The differentiator is not owning commodity infrastructure. The differentiator is making the carrier-specific foundation reliable:

- nine canonical reference sets with correct ownership and validation;
- carrier role and permission model;
- reference-change events and correlation propagation;
- seed data that prepares the exact LinerCore MVP slice;
- integration-ready endpoints for the next modules.

## Risks from Trends

| Risk | Mitigation |
| --- | --- |
| Overbuilding commodity auth/broker/CI functionality | Adopt mandated tools; build only LinerCore-specific behavior around them. |
| Local stack diverges from on-prem stack | Keep Docker Compose and self-hosted runner assumptions aligned with Enterprise Tech-Env. |
| Contracts remain placeholder-only | Drive contracts from running service behavior and provider tests. |
| Auth bypass leaks into production assumptions | Make bypass opt-in and test/scan that production defaults use Keycloak/OIDC. |

## External References

- DCSA Open Track & Trace: https://dcsa.org/standards/open-track-trace/
- Keycloak: https://www.keycloak.org/
- Confluent Schema Registry: https://docs.confluent.io/platform/current/schema-registry/
- Pact: https://docs.pact.io/
- Docker Compose: https://docs.docker.com/compose/
- GitHub Actions self-hosted runners: https://docs.github.com/actions/hosting-your-own-runners

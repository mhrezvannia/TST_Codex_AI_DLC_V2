# External Dependency Map - LinerCore Enterprise

## Source Context

This map consumes `requirements.md`, `stories.md`, `mockups.md`, `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, `team-practices.md`, `mob-composition.md`, and `skill-matrix.md`.

The accepted Delivery Planning answer is that the first release should not depend on remote runtime servers or production external providers. External schedule, capacity, movement, finance, and cloud dependencies are deferred behind local deterministic adapters until internal enterprise flows pass locally.

## Dependency Summary

| Dependency | Owner | Lead time | Blocks | Mitigation |
|---|---|---|---|---|
| Named pricing and D&D SME | Product/domain owner | 1-2 weeks | B03, B07 | Use approved docs and deterministic rule fixtures; review edge cases at mob close. |
| Named booking SME | Product/domain owner | 1-2 weeks | B04, B06, B07, B08 | Use user stories and booking fixtures; escalate lifecycle ambiguities. |
| DCSA/EDI movement specialist | Delivery lead | 1-3 weeks | B05, B06, B07 | Use DCSA v2.2-aligned deterministic validation subset; park unclear edge cases. |
| Contract council membership | Delivery lead plus QA | Immediate | B01, B02, B06, B07, B10 | Assign architecture, module leads, QA, and platform representative. |
| Runtime council membership | Delivery lead plus platform | Immediate | B01, B02, B09, B10 | Assign platform, DevOps, SRE, security, and QA representatives. |
| Local Docker availability on Windows | Platform owner | Immediate | B01, B02, B09, B10 | Document prerequisites and provide host-runtime fallback only for independent dev mode, not completion. |
| Kafka and Schema Registry local stability | Platform owner | 1 week | B01, B02, B06, B10 | Use health checks, retries, local fixtures, and contract compatibility tests. |
| Keycloak realm and JWT/RS256 configuration | Security/platform owner | 1 week | B01, B02, B08 | Seed local realm and service clients; block unsafe auth bypass. |
| Security approval for least privilege and service auth | Security owner | 1-2 weeks | B02, B08, B10 | Denied-path tests and audit evidence required before claims. |
| CI runner availability | Pipeline owner | 1-2 weeks | B10 | Local gate scripts must exist before CI; CI mirrors local gates. |
| Observability stack resources | Runtime/Operation owner | 1 week | B01, B10 | Minimal correlation evidence in B01; full stack in B10. |

## Deferred External Provider Dependencies

| Provider type | First-release stance | Future seam |
|---|---|---|
| Schedule provider | Local deterministic fixture adapter | Booking operational validation adapter |
| Capacity provider | Local deterministic fixture adapter | Booking capacity adapter |
| External movement feed | Manual/API capture and deterministic fixtures | CMM movement adapter |
| Finance/invoicing provider | Out of scope for first release | Future commercial integration |
| Public cloud runtime | Not required for first local release | Operation provisioning stages define promotion environments |

## Approval And Governance Gates

| Gate | Applies to | Required evidence |
|---|---|---|
| Walking skeleton approval | B01 | Real vertical slice with auth, reference, pricing, booking, event, CMM, UI, runtime, and correlation evidence. |
| Contract council approval | B02, B06, B07 | OpenAPI, Avro, AsyncAPI, HTTP Pact, message-pact, Schema Registry compatibility. |
| Runtime council approval | B01, B02, B09, B10 | Compose profiles, health checks, logs, traces, seed/reset scripts. |
| Security review | B02, B08, B10 | JWT/RS256, least privilege, denied-path tests, audit logs, no unsafe auth bypass. |
| Operation readiness review | B10 and Operation stages | SLO evidence, dashboards, alerts, runbooks, rollback, backup, DR, incident readiness. |

## Dependency Monitoring

- Program coordination reviews this map weekly.
- Contract council reviews API/event blockers twice weekly during Construction.
- Runtime council reviews local runtime, CI, and observability blockers twice weekly during Construction.
- Unresolved external dependencies are not treated as completed work; they remain visible in Bolt reviews.

## No Remote Runtime Assumption

The complete application target remains local Windows execution through `docker compose --profile full up -d --build`. Public cloud or production external provider availability is not a prerequisite for Construction, and lack of those providers must not block local enterprise flow proof.


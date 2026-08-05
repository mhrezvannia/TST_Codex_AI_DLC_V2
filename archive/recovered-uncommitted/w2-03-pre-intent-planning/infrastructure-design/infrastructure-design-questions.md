# Infrastructure Design Questions - W2-03

## Resolved Decisions

| Focus | Decision | Authority |
| --- | --- | --- |
| Release topology | Canonical local/on-prem Docker Compose behind Nginx; no public-cloud dependency for W2-03 acceptance. | Project rules and W2-03 DoD |
| State | PostgreSQL `linercore_pricing` with an explicit durable named volume and additive migrations. | Reliability design and brownfield migration rule |
| Messaging | Existing Kafka, Schema Registry, and transactional outbox; quote completion does not wait for broker publication. | Existing platform architecture |
| Identity | Existing Keycloak/OIDC and identity-service seams; local credentials remain local-profile only. | Project security rules |
| Observability | Existing Prometheus, Grafana, OpenTelemetry/Jaeger, and structured logs, extended for W2-03 pricing. | Existing infrastructure |
| Delivery | Self-hosted on-prem GitHub Actions, deploy-on-merge to staging, separate production approval. | Org and project rules |

## Ambiguity Analysis

No AWS account, region, production Kubernetes/ECS target, or production RTO/RPO is approved. This stage therefore defines the local acceptance topology and portable container/IaC requirements only; it does not invent cloud resources or costs.

## Upstream Coverage

This aggregate design consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md` across the existing W2-03 units.

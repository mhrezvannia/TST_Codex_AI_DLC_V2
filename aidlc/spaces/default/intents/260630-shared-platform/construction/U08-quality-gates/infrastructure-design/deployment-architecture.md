# Deployment Architecture - U08 Quality Gates

## Compute Model

U08 runs as GitHub Actions workflow infrastructure on self-hosted on-prem runners. It uses scripts/jobs for classification, gate execution, evidence collection, and aggregation.

## Network Topology

Runners access repository sources, local/on-prem dependencies needed for tests, Docker/Testcontainers-compatible services where configured, and artifact storage. Required gates do not run on public-cloud CI runners.

## Storage Strategy

Gate evidence is stored as CI artifacts/log paths with gate metadata. Previous rerun evidence is preserved rather than overwritten silently.

## Environment Definitions

| Environment | Infrastructure rule |
|---|---|
| PR | Path-scoped required/advisory gates and aggregation. |
| Main | Baseline evidence and compatibility status. |
| Promotion | Consumes health/smoke evidence but production approval is outside U08. |

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

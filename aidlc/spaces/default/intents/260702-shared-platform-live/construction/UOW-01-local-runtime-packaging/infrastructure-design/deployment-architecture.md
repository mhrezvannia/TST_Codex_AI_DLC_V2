# Deployment Architecture - UOW-01 Local Runtime Packaging

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Architecture

- Compute model: local processes or containers for apps/services; Compose containers for backing services.
- Network model: local Compose network with Nginx gateway on port 8088.
- Storage model: local PostgreSQL volume/reset path.
- IaC approach: `compose.yaml`, Dockerfiles or compose override/dev profile, scripts.

## Sizing

Single developer or self-hosted runner. No cloud resources.


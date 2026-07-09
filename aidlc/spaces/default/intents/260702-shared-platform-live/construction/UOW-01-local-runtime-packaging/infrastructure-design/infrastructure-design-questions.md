# Infrastructure Design Questions - UOW-01 Local Runtime Packaging

## Context

Consumes `performance-design`, `security-design`, `scalability-design`, `reliability-design`, `logical-components`, `components`, `services`, and `business-logic-model`.

## Answers

- Deployment strategy: local Compose plus buildable Dockerfiles or dev profiles.
- Monitoring: prerequisite/readiness evidence files and optional Prometheus/Grafana profile.
- CI/CD: self-hosted runner uses the same prerequisite checks.


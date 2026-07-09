# Cost Analysis

## Inputs

This analysis consumes `dashboards`, `alarms`, `slo-config`, `deployment-log`, `load-test-results`, and `incident-plan`.

## Current Cost Posture

Cloud spend status: no AWS runtime is provisioned for this intent.

The environment inventory and `deployment-log` show a local/on-prem Compose target. There are no active AWS VPC, subnet, security group, Secrets Manager, Parameter Store, ECS, RDS, or managed Kafka resources for this workflow. Therefore AWS Cost Explorer, AWS Config, and Trusted Advisor would not provide meaningful workload recommendations yet.

## Local Cost and Time Risks

| Area | Current signal | Cost impact | Recommendation |
| --- | --- | --- | --- |
| Docker Desktop unavailable | Runtime cannot start | Engineering time loss | Fix Docker before further live validation work |
| Java and Maven unavailable | Backend tests and service builds blocked | Engineering time loss | Install Java 21 and Maven 3.9+ |
| Direct `yarn` unavailable | Some scripts depend on shell command resolution | Low setup friction | Keep Corepack path documented or expose direct `yarn` |
| Optional observability stack down | No local Grafana/Prometheus runtime metrics | Acceptable until services run | Start optional profile after base services pass |
| AWS resources absent | No cloud charges | Positive | Keep cloud provisioning deferred until local pass |

## Optimization Opportunities

1. Keep the local-only target until the Shared Platform passes readiness, live contracts, seed apply, and smoke checks.
2. Avoid provisioning managed AWS resources before the local Compose path is proven.
3. Add a single local bootstrap command that checks prerequisites, builds images, starts dependencies, starts apps, applies seed data, and writes evidence.
4. Keep optional observability services behind the Compose `observability` profile so they do not consume resources during normal code/test loops.
5. When cloud deployment becomes relevant, introduce cost allocation tags and budget alarms before first persistent environment creation.

## Decision

The best cost optimization is not cloud right-sizing yet. It is removing local setup toil and preventing premature cloud spend while the runtime remains blocked.

# Tech Stack Decisions - UOW-01 Local Runtime Packaging

## Context

Consumes `business-logic-model`, `business-rules`, `requirements`, and `technology-stack`.

## Decisions

| Area | Decision |
| --- | --- |
| Script runtime | Node.js 24 and Yarn 4 from existing `technology-stack`. |
| Compose | Docker Compose local/on-prem topology from `compose.yaml`. |
| Backend prerequisites | Java 21 and Maven 3.9+ from service POMs. |
| Evidence format | JSON summary plus human-readable markdown/runbook output. |

## Rationale

Use the existing monorepo tools and avoid new runtime dependencies before the walking skeleton proves the local path.


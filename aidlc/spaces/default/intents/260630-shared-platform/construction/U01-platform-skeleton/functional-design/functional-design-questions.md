# Functional Design Questions - U01 Platform Skeleton

> Stage: Functional Design
> Unit: `U01-platform-skeleton`
> Source context: `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`.

## Q1. Repository structure

What repository/workspace structure should the skeleton design assume?

A. One workspace with backend service folders, frontend apps, shared packages, infrastructure/docker-compose, contracts, and docs (recommended)
B. Separate repositories for every service and app
C. Backend-only skeleton first; frontend and infra later
X. Other (please specify)

[Answer]: A. One workspace (Recommended)

## Q2. Backend skeleton depth

What backend skeleton depth should U01 define?

A. Full mandated hexagonal Maven module shape for both backend services with placeholder ports/adapters and compile gates (recommended)
B. Single Spring Boot module per service, refactor later
C. Only folder names, no buildable skeleton
X. Other (please specify)

[Answer]: A. Full hexagonal (Recommended)

## Q3. Frontend skeleton depth

What frontend skeleton depth should U01 define?

A. Next.js App Router app starters for `apps/auth` and `apps/reference-data`, shared `@erp/*` package placeholders, BFF route layout, and `proxy.ts` route protection placeholders (recommended)
B. Only one app starter, split later
C. Defer frontend skeleton to frontend units
X. Other (please specify)

[Answer]: A. Two app starters (Recommended)

## Q4. Local runtime baseline

What local runtime baseline should U01 define?

A. Docker Compose baseline for Postgres, Keycloak, Kafka/SR, service containers, frontend apps, Nginx, and optional observability profile placeholders (recommended)
B. Only backend databases in Docker Compose
C. No Docker Compose until infrastructure design
X. Other (please specify)

[Answer]: A. Full Compose (Recommended)

## Q5. Shared conventions

Which shared conventions should be fixed in U01?

A. Correlation id, standard error envelope, config naming, health endpoint shape, logging fields, contract artifact layout, and CI script names (recommended)
B. Only formatter/linter conventions
C. Defer conventions to each service/app unit
X. Other (please specify)

[Answer]: A. Platform conventions (Recommended)

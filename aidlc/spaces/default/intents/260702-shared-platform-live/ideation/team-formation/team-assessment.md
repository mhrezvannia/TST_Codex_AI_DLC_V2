# Team Assessment - Shared Platform Local Functionality

## Purpose

This team assessment consumes `scope-document`, `intent-backlog`, and `feasibility-assessment`. It defines the delivery structure needed to make Shared Platform locally functional with the current local AI-assisted execution model.

## Available Delivery Model

The practical team model is a local AI-assisted delivery cell:

| Role | Current holder | Responsibilities |
| --- | --- | --- |
| Product owner / approver | User | Confirms scope, accepts gates, clarifies business intent when required. |
| Delivery conductor | Codex with AI-DLC | Runs workflow stages, keeps artifacts and state aligned, sequences work. |
| Implementation executor | Codex | Reads repository, edits code, runs verification, reports blockers. |
| Specialist perspectives | AI-DLC agents | Product, delivery, architecture, developer, quality, security, operations, platform recommendations. |
| Local environment owner | User and local machine | Provides Java 21, Maven 3.9+, Docker runtime, credentials, and machine-level services. |

This model is sufficient to continue through Inception and Construction if machine prerequisites are resolved or CI/self-hosted runner evidence is available.

## Capacity Assessment

| Capacity area | Status | Impact |
| --- | --- | --- |
| Frontend execution | Available | Node and Yarn are installed; frontend checks and app edits can proceed. |
| Backend execution | Blocked locally | Java and Maven are not on PATH, so backend compile/test evidence needs installation or runner support. |
| Container runtime | Blocked locally | Docker daemon is not running, so Compose runtime evidence needs Docker Desktop or approved runtime. |
| Product decisions | Available at gates | User is available for mandatory AI-DLC approvals; optional questions should be minimized. |
| Security/compliance perspective | Available through artifacts | Constraints already define OWASP/API/CIS, PII, auth, and audit requirements. |
| Operations perspective | Partially available | Local runbook and smoke scripts can be produced; live runtime proof depends on Docker/backend prerequisites. |

## Delivery Risks

| Risk | Severity | Owner | Treatment |
| --- | --- | --- | --- |
| Java/Maven unavailable | High | Local environment owner | Install Java 21 and Maven 3.9+ or use a properly provisioned runner. |
| Docker daemon unavailable | High | Local environment owner | Start Docker Desktop or approved Docker-compatible runtime. |
| Static BFF data hides functional gaps | High | Implementation executor | Prioritize BFF-to-backend wiring and mutation tests. |
| Auth bypass becomes normalized | Medium | Implementation executor / security perspective | Keep bypass local-only and add production-profile safeguards. |
| Downstream module pressure expands scope | Medium | Product owner / delivery conductor | Enforce the approved Shared Platform boundary and project memory order. |

## Capacity Allocation Agreement

Execution capacity should be allocated in this order:

1. Remove local runtime blockers or create runner-based evidence path.
2. Build the Shared Platform walking skeleton across Compose, backend, auth, BFF, UI, persistence, and events.
3. Complete P0 backlog units U01-U08.
4. Complete integration-readiness units U09-U11.
5. Add U12 production-safety guardrails before leaving the intent.

No capacity is allocated to Charge, Booking, Container Movement, finance integration, or production deployment in this intent.

## Onboarding Checklist

Before a contributor or agent starts implementation:

1. Read `scope-document` and `intent-backlog`.
2. Confirm Java 21, Maven 3.9+, Node, Yarn, and Docker runtime status.
3. Confirm local env files and ports for Keycloak, PostgreSQL, Kafka, Schema Registry, backend services, and Next.js apps.
4. Run existing frontend checks that do not require Docker/backend prerequisites.
5. Preserve `AUTH_BYPASS=true` as local-only.
6. Keep browser traffic through Next.js BFF routes.
7. Trace every implementation unit to U01-U12.

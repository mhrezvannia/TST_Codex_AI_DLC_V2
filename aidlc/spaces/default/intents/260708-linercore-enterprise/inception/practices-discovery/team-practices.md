# Practices Discovery - Team Practices

## Way of Working

The LinerCore enterprise program uses AI-DLC stage gates and short-lived delivery branches against the main integration line. The current working branch is `enterprise/linercore` for enterprise preparation, but feature and Bolt work should remain small, reviewed, and traceable back to the active enterprise intent, the completed Shared Platform MVP intent, the `shared-platform-mvp-complete` tag, Graphify analysis, and the authoritative program documents.

## Walking Skeleton

The first Construction Bolt must be an enterprise walking skeleton, not a Shared Platform-only continuation. It should prove a minimal real vertical slice across authentication, reference data, pricing/agreement readiness, booking confirmation, event publication/consumption, CMM journey/status handling, frontend access, and local runtime health before the remaining module ladder is accelerated.

## Testing Posture

Tests live with the code they validate and must run through blocking quality gates before merge. Unit tests, integration tests, contract tests, message contract tests, local readiness checks, and end-to-end enterprise flow checks are all required before any module is called complete; existing Java/JUnit, Vitest, Turbo, Maven, and contract scripts remain the default tooling unless later design stages replace them with stronger project evidence.

## Deployment

Local execution is the primary delivery environment for this program, with Docker Compose expected to evolve into `core`, `app`, `observability`, `devtools`, and `full` profiles. CI currently runs quality and readiness gates, but enterprise readiness cannot be claimed until PostgreSQL, Kafka, Schema Registry, Keycloak, all backend services, all frontend apps, reverse proxy, contracts, seed data, and observability are wired and health-checked together.

## Code Style

Backend services follow the existing Java 21, Spring Boot, Maven, and service-module pattern with domain-core kept free of Spring, persistence, messaging, and frontend concerns. Frontend code follows the Yarn/Turbo, Next.js, React, TypeScript strict, shared `@erp/*` package style, with ESLint enforcement including no explicit `any`; broad architectural or cross-module edits must use Graphify query, explain, or path first.

## Source Context

This draft references `aidlc/spaces/default/codekb/TST_Codex/code-structure.md`, `technology-stack.md`, `dependencies.md`, `code-quality-assessment.md`, `architecture.md`, and `business-overview.md`. It also uses Graphify query, Graphify explain, Graphify path, current git history at commit `86e2105`, `compose.yaml`, `package.json`, `.github/workflows/quality-gates.yml`, and the active enterprise AI-DLC intent.

# Team Practices - Shared Platform

## Way of Working

We use trunk-based development on `main` with short-lived feature or Bolt branches. Each Bolt branch is squash-merged into `main` so the trunk remains linear and maps cleanly to the AI-DLC delivery sequence.

## Walking Skeleton

For this greenfield MVP, the first Construction Bolt is a gated walking skeleton. After it ships, the workflow asks the autonomy ladder prompt to decide whether later Bolts run autonomously or with gates.

## Testing Posture

Tests are written alongside code and must run in CI before merge. For the Shared Platform, both backend services target 85% line coverage, matching the module technical environment; contract, integration, and compatibility tests are first-class deliverables.

## Deployment

Merges to `main` deploy to staging through GitHub Actions on self-hosted runners in the on-premises network. Production promotion requires a separate manual approval and successful smoke/health checks.

## Code Style

Code follows Enterprise Technical Environment v1.1 and project-level configuration. Backend code uses the Java/Spring hexagonal service skeleton with a pure domain core; frontend code uses TypeScript strict mode, the Next.js App Router frontend constitution, Yarn/Turborepo, and approved `@erp/*` packages only.
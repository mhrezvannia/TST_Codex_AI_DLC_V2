# W4-01 Team Practices

## Way of Working

W4-01 stays on the short-lived `intent/W4-01-module-list-detail-uplift` branch and resynchronizes with the current `integ/main-reconciled` baseline before Construction. The UI team remains the single Driver; Reference Data, Charge, and Container Movement owners review changes inside their domains, and any shared contract change remains append-only with producer and consumer sign-off before the final exit-gated merge.

## Walking Skeleton

The first Construction slice is a gated Reference Data list-to-detail journey through the canonical authenticated shell, real authorization/session propagation, the existing BFF and service, shared `@erp/ui` primitives, responsive operational states, the isolated live Compose stack, and both audits. Charge Agreements follows only after that pattern is proven, then Container Journeys completes the required three-module sequence.

## Testing Posture

Tests are written alongside code, with test-first treatment for defects, contracts, and risky state transitions. W4-owned changed frontend code carries executable 80 percent line coverage, while unit, component, route, shell-integration, four-viewport Playwright, accessibility, live Compose, `aidlc-audit`, and `erp-fidelity-audit` evidence remain blocking according to risk; breadth or file counts never substitute for measured results.

## Deployment

The canonical W4 acceptance environment is the isolated `linercore-wave-a` Compose project operated through `scripts/wave-a-compose.mjs`, with the manager demo guarded before and after acceptance. Repository evidence supports validation and local release acceptance only: W4 claims no production deployment cadence, staging topology, cloud platform, branch-protection enforcement, or automated production rollback without separate executable evidence.

## Code Style

TypeScript stays strict, follows the shared ESLint and EditorConfig rules, uses Next.js App Router conventions, keeps domain UI and BFF code feature-local, and composes the single LinerCore shell with shared auth, tokens, and `@erp/ui`. Any Java touched preserves framework-free domain cores, application ports/services, service-owned persistence, adapter/container boundaries, and boundary-level error translation; W4 introduces neither a universal formatter nor a universal `Result<T,E>` migration.


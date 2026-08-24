# Team Practices — W3-04 Booking Request Completeness

Evidence basis: `code-structure.md`, `technology-stack.md`, `dependencies.md`, `code-quality-assessment.md`, `architecture.md`, and `business-overview.md`.

## Way of Working

W3-04 stays on its short-lived `intent/W3-04-booking-request-completeness` branch, synchronizes with `integ/main-reconciled`, and integrates through the program backlog protocol. The repository does not prove one universal merge style or external branch-protection policy, so neither is invented.

## Walking Skeleton

PB-01 is the first gated Construction slice: a real shared-shell request creates and reopens with authoritative voyage schedule facts and equipment quantity greater than one without a physical identifier. Commercial breadth, legacy correction, pricing, and confirmation build only after that cross-layer spine is proven.

## Testing Posture

Tests are written alongside W3-04 changes and evidence at least 80% line coverage of changed executable production lines in every W3-touched module. Coverage is necessary but insufficient: domain/completeness, additive migration/restart, pricing and event contracts, duplicate/conflict/degraded paths, Playwright accessibility/responsive behavior, isolated live Compose, `aidlc-audit`, and `erp-fidelity-audit` are mandatory, and a missing prerequisite is BLOCKED rather than PASS.

## Deployment

Fast Java/frontend/contract/lint/build checks block integration, followed by one serialized manual acceptance run on the approved isolated Compose topology with live contracts, browser/accessibility evidence, demo protection, and audits. This practice does not claim an established staging/production deployment pipeline, cadence, rollback mechanism, or continuous delivery.

## Code Style

Java preserves framework-free domain cores, application-service transaction boundaries, ports/adapters, service-owned persistence, immutable typed outcomes, correlated boundary errors, idempotency, audit, and transactional outbox patterns. TypeScript remains strict, centralizes Booking BFF security/error behavior, uses shared workspace types and `@erp/ui` inside the one LinerCore shell, and adds no repository-wide formatter or architecture-tool mandate within W3-04.


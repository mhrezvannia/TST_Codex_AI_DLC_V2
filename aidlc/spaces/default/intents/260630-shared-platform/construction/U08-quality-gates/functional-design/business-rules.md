# Business Rules - U08 Quality Gates

## Source Trace

These U08 business rules trace to `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

## CI Runner Rules

BR-U08-001: CI workflows must run on self-hosted GitHub Actions runners in the on-premises network.

BR-U08-002: CI must use Java 21 and Maven conventions for backend services.

BR-U08-003: CI must use Yarn/Turborepo conventions for frontend apps and packages.

BR-U08-004: npm, pnpm, unexpected frontend lockfiles, public-cloud CI runners, and unmanaged package-manager changes must fail the relevant gate.

## Backend Gate Rules

BR-U08-005: `identity-service` and `reference-data-service` must each run formatting/lint/static checks where configured.

BR-U08-006: Each backend service must compile successfully.

BR-U08-007: Each backend service must run unit tests.

BR-U08-008: Each backend service must run adapter integration tests where adapters exist.

BR-U08-009: Each backend service targets 85 percent line coverage.

BR-U08-010: Domain-core modules must not import Spring, JPA, Kafka, Jackson, Lombok, or adapter modules.

BR-U08-011: Backend gate failures must block merge.

## Frontend Gate Rules

BR-U08-012: Frontend apps and shared packages must run TypeScript strict checks.

BR-U08-013: Frontend apps and shared packages must run lint checks.

BR-U08-014: Frontend tests must run for affected apps/packages where configured.

BR-U08-015: Accessibility-relevant checks must run for auth and reference-data workflows where configured.

BR-U08-016: Frontend gate failures must block merge when the affected app/package is in the PR scope.

## Contract and Schema Rules

BR-U08-017: OpenAPI artifacts must validate syntactically and semantically before merge.

BR-U08-018: OpenAPI changes must run compatibility/diff checks against the accepted baseline.

BR-U08-019: Pact/message-pact or equivalent fixtures must validate for affected synchronous or message contracts.

BR-U08-020: Avro schemas must validate and pass Schema Registry compatibility checks before merge.

BR-U08-021: Contract examples must validate against their published contract/schema.

BR-U08-022: Required contract/schema gate failures must block merge.

## Smoke and Seed Rules

BR-U08-023: The walking skeleton must prove at least one CI path with compile/type checks and a smoke test.

BR-U08-024: Local seed data changes must run deterministic validation and must not introduce non-repeatable test data.

BR-U08-025: Smoke checks must use service/API/BFF paths rather than direct database reads.

## Evidence Rules

BR-U08-026: Every gate result must identify the gate id, scope, command or workflow step, status, and evidence path.

BR-U08-027: Required gates must be clearly distinguished from advisory checks.

BR-U08-028: A skipped required gate must fail unless the skip reason is a deterministic unaffected-path decision.

BR-U08-029: Gate aggregation must fail the PR if any required gate fails.

BR-U08-030: Gate evidence must be suitable for approval review at AI-DLC gates and later audit.

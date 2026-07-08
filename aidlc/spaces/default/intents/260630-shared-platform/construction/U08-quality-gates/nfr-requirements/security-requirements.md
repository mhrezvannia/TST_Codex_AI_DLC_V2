# Security Requirements - U08 Quality Gates

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines CI gate classification, backend/frontend checks, contract/schema checks, seed/smoke checks, and failure evidence. `business-rules.md` requires on-prem self-hosted runners, package-manager enforcement, domain-core purity, contract/schema gates, and evidence. `requirements.md` fixes NFR-004, NFR-006 through NFR-010, C-001 through C-006, and no public cloud.

## Security Requirements

- CI workflows run on self-hosted GitHub Actions runners in the on-prem network.
- Public-cloud CI runners must not be used for required gates.
- npm, pnpm, unexpected frontend lockfiles, unmanaged package-manager changes, and prohibited frontend libraries fail relevant gates.
- Domain-core purity checks fail if backend domain modules import Spring, JPA, Kafka, Jackson, Lombok, or adapter modules.
- Contract/schema checks prevent unsafe API/event changes from merging.

## Evidence Security

- Gate evidence must avoid printing secrets, tokens, Vault values, or production credentials.
- Evidence paths/logs must be suitable for AI-DLC gate review and later audit.
- Required/advisory status must be explicit to avoid social bypass of blocking controls.

## Supply Chain Requirements

- Dependency installation uses locked Yarn/Turborepo frontend conventions.
- Backend checks use Java 21 and Maven conventions.
- Contract/schema changes must validate against accepted baselines.
- Seed changes must not introduce non-repeatable or sensitive test data.

## Non-Goals

- No production deployment approval policy.
- No public-cloud security tooling dependency.
- No runtime feature security implementation.


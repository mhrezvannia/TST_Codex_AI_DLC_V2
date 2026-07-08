# Shared Infrastructure - U08 Quality Gates

## Shared Dependencies

U08 uses self-hosted GitHub Actions runners, backend/frontend toolchains, contract/schema tooling, CI artifact storage, and local/on-prem test dependencies.

## Access Boundaries

Required gates do not use public-cloud runners. Advisory checks are reported separately. Manual skip semantics for required gates are not part of this design.

## Cross-Unit Contracts

U02/U03/U04/U05/U06/U07/U09 provide code/artifact surfaces that U08 gates. U10 consumes smoke/gate evidence for readiness visibility.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

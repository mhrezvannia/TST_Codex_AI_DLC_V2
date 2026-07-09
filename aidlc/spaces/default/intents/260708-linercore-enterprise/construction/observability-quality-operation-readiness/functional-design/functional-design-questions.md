# Functional Design Questions - observability-quality-operation-readiness

## Source Context

These questions consume unit-of-work.md, unit-of-work-story-map.md, requirements.md, components.md, and services.md.

Recommended answers were applied under explicit stage-level approval to use recommended Functional Design answers for remaining units.

## Q1 - Scope

What should this unit own?

A. Own logs, metrics, traces, dashboards, alerts, SLO evidence, E2E flow gates, CI/CD checks, runbooks, readiness, rollback, backup, DR, and incident readiness. Recommended from unit-of-work.md and components.md.
B. Reduce scope to documentation only.
C. Move this unit's responsibilities into a different domain unit.
D. Defer all scope to code generation.
E. Treat the unit as optional.
X. Other (please specify)

[Answer]: A

## Q2 - Boundary

What must this unit not do?

A. It must not mask incomplete domain work or mark enterprise completion from documents, mock screens, or container startup alone. Recommended to preserve service ownership boundaries from requirements.md and services.md.
B. It may own any adjacent service data.
C. It may use cross-service SQL joins.
D. It may claim completion from mocks or documents.
E. It may bypass approved contracts.
X. Other (please specify)

[Answer]: A

## Q3 - Evidence

What evidence is required?

A. Tests, contracts, local runtime compatibility, traceability to unit-of-work-story-map.md, and explicit failure evidence where applicable. Recommended.
B. Manual inspection only.
C. UI screenshots only.
D. Container startup only.
E. No evidence until Operation.
X. Other (please specify)

[Answer]: A

## Recommended Answer Set

Recommended answers applied: Q1 A, Q2 A, Q3 A.


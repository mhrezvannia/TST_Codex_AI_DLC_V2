# Team Practices - W3-01 D&D Rules & Rates

**Brownfield evidence:** [code-structure.md](../../../codekb/TST_Codex_W3-01/code-structure.md), [technology-stack.md](../../../codekb/TST_Codex_W3-01/technology-stack.md), [dependencies.md](../../../codekb/TST_Codex_W3-01/dependencies.md), [code-quality-assessment.md](../../../codekb/TST_Codex_W3-01/code-quality-assessment.md), [architecture.md](../../../codekb/TST_Codex_W3-01/architecture.md), and [business-overview.md](../../../codekb/TST_Codex_W3-01/business-overview.md)

## Way of Working

Deliver W3-01 on its short-lived intent branch as a small, risk-first vertical. Preserve W2-03 contracts and service ownership, require the named approval gates and maintainer fixture signoff, and keep every increment reviewable across domain, contract, UI, and evidence.

## Walking Skeleton

Prove the smallest real Charge-owned path first: versioned D&D terms and port-local calculator, additive provider response and signed fixtures, then LinerCore UI and live acceptance. Contract, persistence, calculation, UI, and proof travel with the slice that exercises them rather than becoming horizontal releases.

## Testing Posture

Write focused tests alongside changes, using regression-first when practical rather than claiming strict TDD. Require at least 80% changed-line coverage for touched Charge backend and Charge UI production code, plus blocking deterministic rule/boundary tests, contract fixtures, Playwright accessibility, isolated Compose, demo guards, `aidlc-audit`, and `erp-fidelity-audit` evidence.

## Deployment

CI is a blocking validation surface, not an established production deployment pipeline. W3-01 acceptance is the isolated local Compose topology only; do not infer production cloud, promotion, rollback, availability, capacity, backup, or disaster-recovery commitments.

## Code Style

Preserve Java ports-and-adapters boundaries with framework-free domain modules, service-owned persistence, immutable values, explicit identifiers/statuses, typed exceptions, correlation evidence, and boundary translation. Keep TypeScript strict and feature-local, reuse authenticated shell and `@erp/ui`, and evolve `pricing.v1` additively without a new D&D service or cross-service persistence access.


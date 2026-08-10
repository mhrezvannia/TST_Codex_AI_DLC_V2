# Practices Discovery Evidence - W2-04

## Pipeline and deployment finding

Git history shows intent-prefixed branches and reconciled integration merges,
with W2-04 at `c2f13dd` over `c96b5b3`. `.github/workflows/quality-gates.yml`
blocks on Maven tests, workspace script tests, frontend tests/typecheck/lint/
build, Compose validation, quality aggregation, readiness, and both audits on a
self-hosted on-prem runner. Playwright is not an ordinary CI step. The Wave A
script fixes project `linercore-wave-a`; demo guard protects
`linercore-shared-platform` at port 8088.

## Quality finding

JUnit, Vitest, contract tooling, component tests, and live-acceptance scripts
exist, but strict TDD cadence and numeric coverage enforcement are not evidenced.
CMM lacks the target DCSA lifecycle matrix, observable rejection, controller/
PostgreSQL, sequence evolution, Container Movement UI, and live return-path
coverage. The user affirmed risk-based tests alongside code and a manual
blocking final live gate with one evidence-preserving environmental retry.

## Developer finding

Java follows lower-case packages, PascalCase role nouns, verb-led methods, and
`domain-core -> application ports -> adapters -> Spring container`; TypeScript
uses PascalCase components and camelCase helpers. EditorConfig, ESLint,
TypeScript strictness, and shared UI tokens are established. The user declined
an incidental formatter/result-style migration and affirmed explicit stable
domain rejection outcomes with exceptions mapped at REST/infrastructure edges.

## Security and supply-chain finding

Authorization ports, actor/correlation propagation, service-owned data, and
fail-closed non-local expectations are present. No CodeQL, SAST, DAST, secret
scanner, dependency scanner, Dependabot/Renovate, or equivalent security
workflow/config was found. This is recorded as a gap, not described as security-
complete; W2-04 must not weaken least privilege or expose transport details.

## Questions asked

Evidence resolved branch/integration, walking-skeleton, deployment target, and
core code conventions. The interview therefore asked only about test cadence
and coverage, serialized live-gate policy, and new Java formatting/result-style
mandates. All recommended options were approved.

## Source coverage and freshness

The scan used `code-structure.md`, `technology-stack.md`, `dependencies.md`,
`code-quality-assessment.md`, `architecture.md`, and
`business-overview.md`, then verified current git/CI/config evidence at
`c2f13dd9c2ca2fe754a075f6688c74d7bdb90b0f`.

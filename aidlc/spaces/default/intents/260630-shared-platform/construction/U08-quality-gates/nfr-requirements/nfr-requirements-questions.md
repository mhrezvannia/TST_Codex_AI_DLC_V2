# NFR Requirements Questions - U08 Quality Gates

## Source Trace

This question record derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

## Q1. Gate enforcement

How should required gate failures behave?

A. Required backend, frontend, contract, schema, seed, and smoke gate failures block merge with evidence (recommended)
B. Advisory only
C. Manual review decides each failure
X. Other (please specify)

[Answer]: A. Merge-blocking required gates (Recommended)

## Q2. Runner environment

Which runner profile applies?

A. Self-hosted GitHub Actions runners in the on-prem network (recommended)
B. Public-cloud hosted runners
C. Developer laptops only
X. Other (please specify)

[Answer]: A. Self-hosted on-prem runners (Recommended)

## Q3. Backend coverage

What coverage threshold applies?

A. `identity-service` and `reference-data-service` each target at least 85 percent line coverage (recommended)
B. 70 percent aggregate coverage
C. No coverage gate
X. Other (please specify)

[Answer]: A. 85 percent per backend service (Recommended)

## Q4. Skipped required gates

How should required gates be skipped?

A. Only by deterministic unaffected-path classification; otherwise skipped required gates fail (recommended)
B. Any maintainer can skip
C. Skips are always advisory
X. Other (please specify)

[Answer]: A. Deterministic path-based skip only (Recommended)

## Q5. Evidence

What evidence must each gate emit?

A. Gate id, scope, command/workflow step, status, required flag, and evidence/log path (recommended)
B. Pass/fail only
C. No retained evidence
X. Other (please specify)

[Answer]: A. Structured gate evidence (Recommended)

## Ambiguity Analysis

- `business-rules.md` fixes self-hosted runners, Java/Maven, Yarn/Turborepo, 85 percent coverage, contract/schema compatibility, and evidence requirements.
- `requirements.md` fixes CI blocking behavior.
- No follow-up questions are needed for U08.


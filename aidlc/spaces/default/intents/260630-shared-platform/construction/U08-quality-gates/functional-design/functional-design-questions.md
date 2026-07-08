# Functional Design Questions - U08 Quality Gates

> Stage: Functional Design
> Unit: `U08-quality-gates`
> Source context: `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`.

## Q1. Gate scope

Which quality gates should U08 define?

A. Backend format/lint/compile/unit/integration/85 percent coverage, frontend type/lint/test/accessibility-relevant checks, OpenAPI checks, Pact/message-pact, Avro compatibility, and smoke path hooks (recommended)
B. Backend unit tests only
C. Contract checks only
X. Other (please specify)

[Answer]: A. Full Shared Platform gate set (Recommended)

## Q2. Runner model

Where should gates run?

A. GitHub Actions on self-hosted on-prem runners, using Java/Maven and Yarn/Turborepo conventions from the approved technical environment (recommended)
B. Public cloud CI runners
C. Manual local-only checks
X. Other (please specify)

[Answer]: A. Self-hosted on-prem GitHub Actions (Recommended)

## Q3. Merge behavior

How should gate failures affect merge?

A. Required gate failures block merge and produce evidence naming the failing service/app/contract/schema/check (recommended)
B. Failures are advisory only
C. Only production deploy is blocked
X. Other (please specify)

[Answer]: A. Required failures block merge (Recommended)

## Q4. Coverage target

What coverage target applies to backend services?

A. Both backend services target 85 percent line coverage, with unit and adapter integration tests counted according to project tooling (recommended)
B. No coverage threshold in MVP
C. One global repository coverage number only
X. Other (please specify)

[Answer]: A. 85 percent line coverage per backend service (Recommended)

## Q5. Contract/schema enforcement

How should API and event contract checks be treated?

A. OpenAPI, Pact/message-pact, and Avro compatibility are first-class required gates for API/event changes (recommended)
B. Run only after release candidates
C. Run only when downstream teams request review
X. Other (please specify)

[Answer]: A. Required contract/schema gates (Recommended)

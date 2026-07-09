# NFR Design Questions - contract-platform-catalog

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, and application-level `components.md` and `services.md`.

No additional human questions were required for this Construction unit. The approved NFR Requirements already define the CI and local timing budgets, fail-closed compatibility posture, freshness rules, evidence retention, technology stack, security metadata, and first-release capacity baseline needed to produce `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, and `logical-components.md`.

## Resolved Design Inputs

| Topic | Resolved input used for design |
|---|---|
| Resilience | Required seams fail closed for syntax, metadata, compatibility, registry, Pact, message-pact, and report generation failures. |
| Scalability | First release supports at least 75 contract assets, 25 Schema Registry subjects, 20 Pact/message-pact suites, and 10 service or integration seams. |
| Performance | Changed-contract validation completes within 2 minutes locally; full local and CI validation complete within 10 minutes, with CI hard timeout at 15 minutes. |
| Security | Protected contracts must declare auth context, authorization expectation, denied-path behavior, correlation, audit, observability, and idempotency metadata. |
| Logical boundaries | Contract Platform owns validation orchestration and generated evidence, not provider or consumer implementation. |

## Ambiguity Analysis

No blocking ambiguity was found. The approved requirements are specific enough for an architecture design pass; remaining details such as exact command names and package paths belong to Code Generation and CI Pipeline implementation.

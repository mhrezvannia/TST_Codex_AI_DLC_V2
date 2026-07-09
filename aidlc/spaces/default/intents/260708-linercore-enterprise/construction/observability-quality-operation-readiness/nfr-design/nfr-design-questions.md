# NFR Design Questions - observability-quality-operation-readiness

## Source Context

This artifact consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, `business-logic-model.md`, and application-level `components.md` and `services.md`.

No additional human questions were required for this Construction unit. The approved NFR Requirements already define evidence runtime targets, freshness keys, security classification, retention, evidence scale, fail-closed gates, partial evidence behavior, blocker taxonomy, no-manual-green posture, and generated-evidence stack.

## Resolved Design Inputs

| Topic | Resolved input used for design |
|---|---|
| Resilience | Fail-closed gates, partial evidence preservation, owner/remediation blockers, no manual green override, Operation carry-forward risk controls, and no-fake-completion. |
| Scalability | 5 E2E flow reports, 100 contract checks, 50 dashboard/alert/runbook assets, 10,000 signal samples, and 500 blocker/finding records. |
| Performance | CI bundle <= 15 minutes, local bundle <= 20 minutes, gate evaluation <= 2 minutes, contract health aggregation <= 60 seconds, dashboard p95 <= 2 seconds. |
| Security | Authenticated/capability-authorized evidence views, redaction, mandatory security evidence, internal/confidential classification, 180-day retention, and audited annotations. |
| Logical boundaries | This unit aggregates and gates evidence; owning services still produce business behavior and source evidence. |

## Ambiguity Analysis

No blocking ambiguity was found. Exact JSON schema field names, CI artifact paths, and dashboard route names are implementation details constrained by this design.

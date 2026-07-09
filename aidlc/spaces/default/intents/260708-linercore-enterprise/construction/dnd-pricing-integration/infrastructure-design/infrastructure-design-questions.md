# Infrastructure Design Questions - dnd-pricing-integration

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

No additional human questions were required. Prior stages resolve the Booking D&D boundary trigger, Charge D&D request/result API, idempotency, service JWT, timeout/retry/circuit behavior, manual fallback, snapshots, and Pact evidence.

## Resolved Infrastructure Inputs

| Topic | Resolved input used for design |
|---|---|
| Deployment | Booking and Charge services run in `app`/`full`; D&D seam is an internal HTTP/OpenAPI/Pact integration. |
| Storage | Booking stores trigger/request state, D&D snapshot/manual state, and evidence; Charge stores D&D rules, result, and commercial audit. |
| Monitoring | Trigger duplicates, seam latency, timeout/retry/circuit states, no-rule/conflict/manual-required states, Pact status, and snapshot persistence. |

## Ambiguity Analysis

No blocking ambiguity was found. Exact route names, trigger keys, timeout values, circuit thresholds, manual-state names, and Pact paths are implementation details constrained by this design.

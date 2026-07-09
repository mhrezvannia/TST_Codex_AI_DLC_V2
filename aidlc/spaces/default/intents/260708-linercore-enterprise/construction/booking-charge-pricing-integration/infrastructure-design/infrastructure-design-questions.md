# Infrastructure Design Questions - booking-charge-pricing-integration

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

No additional human questions were required. Prior stages resolve the Booking-to-Charge HTTP pricing seam, OpenAPI/Pact expectations, idempotency, timeout/retry/circuit behavior, pricing snapshot handoff, and evidence requirements.

## Resolved Infrastructure Inputs

| Topic | Resolved input used for design |
|---|---|
| Deployment | Booking and Charge services run in `app`/`full`; the seam is an internal HTTP/OpenAPI/Pact integration. |
| Compute | Booking owns client/orchestration state; Charge owns provider calculation. |
| Storage | Booking stores request state, pricing snapshot, exceptions, and consumer evidence; Charge stores pricing basis/audit. |
| Networking | Internal service route with service JWT, correlation id, idempotency key, request hash, timeout, retry, and circuit policy. |
| Monitoring | Seam latency, timeout, retry, circuit state, Pact status, snapshot persistence, and exception classifications. |

## Ambiguity Analysis

No blocking ambiguity was found. Exact route names, client package, timeout values, circuit thresholds, and Pact fixture paths are implementation details constrained by this design.

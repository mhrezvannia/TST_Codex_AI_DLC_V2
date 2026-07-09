# Shared Infrastructure - charge-agreement-pricing-domain

## Source Context

This artifact consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

This file is produced because Charge shares contracts and runtime infrastructure with Booking, Enterprise Web, Reference Data, Identity, local runtime, and CI.

## Shared Resource Inventory

| Shared resource | Shared by | Boundary |
|---|---|---|
| Pricing/D&D APIs | Booking and Enterprise Web. | Charge calculates; callers orchestrate their own lifecycle. |
| Agreement APIs | Enterprise Web and operations. | Charge owns agreement/tariff state. |
| Reference Data APIs | Charge validation and eligibility. | Reference Data remains source of truth. |
| Identity/capability services | Charge APIs and admin workflows. | Backend authorization remains mandatory. |
| Contract platform | Charge, Booking, Enterprise Web. | OpenAPI/Pact evidence gates integration readiness. |
| Observability evidence | Charge, operations, quality gates. | Read-only evidence; no manual green status. |

## Access Boundaries

| Boundary | Rule |
|---|---|
| Booking | Booking requests/stores pricing snapshots; Charge does not mutate booking lifecycle. |
| CMM | Charge may calculate D&D from approved inputs; it does not derive movement status. |
| Database | Charge owns `pricing`; no Booking/CMM SQL access. |
| Manual fallback | Requires approver, reason, timestamp, and commercial audit. |
| UI | Enterprise Web calls APIs and cannot bypass Charge rules. |

## Shared Flow

```text
[Agreement Admin / Pricing Caller]
        |
        v
[Charge Service]
        |
        v
[pricing DB: agreements, tariffs, rules, results, audit]
```

Text fallback: Charge receives agreement, pricing, and D&D requests, evaluates Charge-owned commercial rules, persists immutable result/audit evidence, and returns typed outcomes.

## Traceability

| Source | Design response |
|---|---|
| `performance-design.md` | Shares pricing and agreement APIs while preserving bounded lookup and calculation behavior. |
| `security-design.md` | Enforces auth, service identity, commercial audit, and database isolation. |
| `scalability-design.md` | Scales agreement, tariff, rule, request, and manual exception workloads. |
| `reliability-design.md` | Preserves idempotency, deterministic result evidence, stale-version checks, and manual-required states. |
| `logical-components.md` | Maps shared resources to Charge components and integration seams. |
| `components.md` | Keeps Charge, Booking, CMM, Reference Data, Identity, and Enterprise Web boundaries distinct. |
| `services.md` | Supports Charge service topology and API contracts. |
| `business-logic-model.md` | Implements agreement, pricing, D&D, manual fallback, and audit workflows. |

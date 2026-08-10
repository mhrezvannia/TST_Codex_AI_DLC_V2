# Logical Components - U03 Agreement Pricing

## Inventory

| Component | Responsibility | Failure domain |
|---|---|---|
| Booking pricing coordinator/client | DTO/hash, resilience, apply result | Booking HTTP instance |
| Charge auth/controller | Local role and exact contract | Charge HTTP boundary |
| Pricing claim service/repository | Lease/idempotency/fencing | Charge DB transaction |
| Agreement pricing engine | deterministic authority/lines | Calculation only |
| Terminal completion/manual repository | immutable result/diagnostic | Charge DB transaction |
| Booking snapshot/work repository | quote/manual state | Booking DB |
| Pact/load/metrics | contract/p99 evidence | Blocking quality gate |

## Source Coverage

Inventory bridges `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and U03 `business-logic-model.md`.

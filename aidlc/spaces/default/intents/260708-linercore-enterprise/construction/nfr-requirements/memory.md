# NFR Requirements Memory

## Interpretations

- 2026-07-09T08:13:00Z - Treated `contract-platform-catalog` NFRs as measurable validation-platform requirements, not service-domain requirements; the unit owns executable contract evidence and health reporting while provider and consumer behavior remains with the owning services.

## Deviations

## Tradeoffs

- 2026-07-09T08:13:00Z - Asked targeted quantitative questions for CI/local validation budgets, compatibility strictness, scale, retention, and failure handling because prior artifacts require formal SLOs and compatibility gates but do not set exact thresholds.
- 2026-07-09T08:18:00Z - Used inline architecture review for `contract-platform-catalog` NFR artifacts because the configured reviewer role is unavailable under the current Codex account/model configuration. The review still checked traceability, measurability, fail-closed compatibility, security metadata, and repository-stack alignment before continuing.
- 2026-07-09T08:25:00Z - Applied explicit stage-scoped approval to use recommended NFR answers for remaining units. For `local-runtime-foundation`, this produced measurable startup, readiness, security-default, capacity, and failure-handling requirements without reopening settled runtime scope decisions from Functional Design.
- 2026-07-09T08:31:00Z - For `shared-platform-identity-security`, kept NFRs focused on measurable authorization latency, fail-closed Keycloak/JWT/capability security, audit durability, and brownfield hardening. This avoids shifting domain authorization ownership into the UI or rewriting the existing identity foundation.
- 2026-07-09T08:37:00Z - For `shared-platform-reference-events`, framed NFRs around reference API latency, transactional outbox reliability, Schema Registry compatibility, and brownfield hardening of `reference-data-service`; downstream Charge/Booking/CMM behavior remains outside this unit.
- 2026-07-09T08:43:00Z - For `booking-lifecycle-domain`, set NFRs around booking command/query latency, durable idempotency, outbox, exception queues, lifecycle audit, and greenfield Spring/PostgreSQL/Kafka service ownership while keeping price, D&D, and movement-status calculations outside Booking.
- 2026-07-09T08:49:00Z - For `charge-agreement-pricing-domain`, framed NFRs around measurable pricing/D&D latency, commercial audit, deterministic calculation, idempotency, and brownfield evolution of `charge-agreement-service`; Booking lifecycle and CMM status remain outside Charge.
- 2026-07-09T08:55:00Z - For `container-movement-domain`, set NFRs around DCSA-aligned movement validation, deterministic ordering/deduplication, status derivation latency, and greenfield CMM service ownership while keeping Booking lifecycle and D&D relevance outside CMM.
- 2026-07-09T09:01:00Z - For `booking-charge-pricing-integration`, kept NFRs focused on the synchronous HTTP seam: timeout, bounded retry, circuit breaker, idempotency, Pact evidence, pricing snapshot persistence, and secure service-to-service calls. Booking orchestration and Charge calculation remain separate.
- 2026-07-09T09:07:00Z - For `booking-confirmed-journey-integration`, set NFRs around confirmation-to-journey latency, transactional outbox, Schema Registry compatibility, message-pact evidence, CMM deduplication, and revision reconciliation; synchronous/shared-database coupling remains out of scope.
- 2026-07-09T09:13:00Z - For `enterprise-seed-migrations-devex`, framed NFRs around deterministic migration/seed timing, separate logical database ownership, synthetic seed data, scoped reset, and repeatable command evidence. Seed fixtures must support validation without replacing business implementation.
- 2026-07-09T09:19:00Z - For `movement-status-booking-integration`, set NFRs around CMM-to-Booking status-event latency, service identity, Schema Registry/message-pact evidence, deduplication/staleness checks, idempotent Booking lifecycle update, and D&D trigger input evidence.
- 2026-07-09T09:25:00Z - For `dnd-pricing-integration`, set NFRs around Booking-triggered Charge D&D calculation, service auth, idempotency, timeout/retry/circuit breaker behavior, auditable D&D snapshots, manual fallback, and Pact evidence while preserving Booking/Charge/CMM boundaries.
- 2026-07-09T09:31:00Z - For `enterprise-web-shell-and-workflows`, set NFRs around integrated shell performance, route/action permission behavior, backend-enforced authorization, accessibility, API-backed state, degraded-service visibility, and explicit rejection of Claude prototype business logic as readiness.
- 2026-07-09T09:37:00Z - For `observability-quality-operation-readiness`, set NFRs around evidence freshness, fail-closed quality gates, evidence bundle/runtime targets, authenticated/redacted evidence access, 180-day release-candidate retention, and Operation handoff risk handling.

## Open questions

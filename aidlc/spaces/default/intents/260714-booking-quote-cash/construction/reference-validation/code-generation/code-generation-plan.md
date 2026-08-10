# Code Generation Plan - U02 Reference Validation

## Traceability

This plan implements US-W1-002, FR-W1-002, NFR-W1-006, NFR-W1-007, and the U02 functional/NFR/infrastructure designs. U02 adopts the live Reference Data service and the U01 Booking snapshot/migration chain; it adds no copied authority table or competing migration.

- [x] Step 1: Add typed Booking validation status, fingerprint, field-result, and snapshot domain models with deterministic ordering, complete-result checks, idempotent apply, and lifecycle behavior. (US-W1-002; BR-U02-001-BR-U02-008)
- [x] Step 2: Extend Booking snapshot serialization/upcast and API views for the latest validation snapshot while preserving U01 V1/V2 compatibility and adding no migration. (FR-W1-002; U02 persistence design)
- [x] Step 3: Replace the boolean `ReferenceValidationPort` with typed request/result/provider-failure contracts and implement capture/evaluate/apply orchestration without holding a Booking transaction across HTTP. (US-W1-002; NFR-W1-006)
- [x] Step 4: Implement the Reference Data HTTP adapter over the existing provider API with allow-listed sets, identity/correlation headers, bounded responses/timeouts/concurrency, deterministic all-field results, code-or-ID resolution, voyage-route coherence, and transport-safe failure categories. (FR-W1-002; NFR-W1-006-NFR-W1-007)
- [x] Step 5: Wire managed HTTP/executor/semaphore configuration, local-only service identity, non-local fail-closed guards, shutdown, metrics hooks, and Compose environment values. (NFR-W1-006-NFR-W1-007)
- [x] Step 6: Expand Booking validate/error HTTP contracts to distinguish completed blocked validation, stale Booking conflict, overload, and provider unavailable without leaking upstream bodies or topology. (US-W1-002; security design)
- [x] Step 7: Add bounded Reference option endpoints/BFF helpers for active customer, location, voyage, and equipment-type choices, preserving server-only provider access. (US-W1-002; UI rules)
- [x] Step 8: Add Booking BFF validation command and detail/create UI states for verified, field-addressable blocked, retryable unavailable, loading, and active provider options; keep Price/Confirm unavailable until validated. (US-W1-002; NFR-W1-008)
- [x] Step 9: Add domain and application tests for valid, blocked, retry, stale fingerprint/revision, idempotency, complete-field evaluation, unavailable audit-only behavior, and authorization. (Standard test strategy)
- [x] Step 10: Add HTTP adapter/controller/config tests for status mapping, malformed/oversized responses, identity/correlation, allow-listing, voyage coherence, timeout/429/5xx, redaction, and non-local guards. (Standard test strategy)
- [x] Step 11: Add frontend helper/component tests for option mapping, exact field links, unavailable versus blocked rendering, retry, and preserved correction state; run Vitest, typecheck, lint, and production build. (Standard test strategy)
- [x] Step 12: Run the Booking Maven reactor and Compose live proof on PostgreSQL host port 55432 for active, inactive/unknown, provider-unavailable, restart, and correlation behavior; record evidence and review resolution in the U02 summary. (U02 live DoD)

## Implementation Order

Domain and snapshot compatibility land first, followed by application contracts and the HTTP adapter. API/BFF/UI work then consumes those stable contracts. Automated and live checks close the unit before the architecture review.

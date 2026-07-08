# Code Generation Plan - U03 Reference Domain and Provider/Admin APIs

## Source Trace

This plan implements U03 from `business-logic-model.md`, `business-rules.md`, `domain-entities.md`, `unit-of-work.md`, `unit-of-work-story-map.md`, and `requirements.md`.

U03 expands the U01 `reference-data-service` skeleton. It owns canonical reference state and synchronous REST/OpenAPI behavior for the nine MVP reference sets. It must not implement Kafka publication, Schema Registry registration, frontend screens/BFFs, final seed data, or downstream Charge, Booking, or Container Movement runtime behavior.

## Implementation Steps

- [x] Step 1: Extend `reference-data-service/domain-core` with shared reference value objects.
  - Traceability: US-005, US-006, US-017; BR-U03-005 through BR-U03-013.
  - Add `ReferenceId`, `ReferenceCode`, `ReferenceStatus`, `ReferenceVersion`, `AuditActor`, `ChangeReason`, `Classification`, and common validation/error types.

- [x] Step 2: Implement reference aggregate models for all nine MVP sets.
  - Traceability: FR-001 through FR-014; BR-U03-014 through BR-U03-028.
  - Add Party/Customer, Location/Port, Region, Voyage, Currency, ChargeCode, EquipmentType, Commodity, and TradeLane models.
  - Preserve explicit aggregate rules rather than collapsing all sets into an ungoverned metadata blob.

- [x] Step 3: Implement common lifecycle behavior.
  - Traceability: BR-U03-005 through BR-U03-013, BR-U03-036 through BR-U03-039.
  - Support create, update, deactivate, reactivate, validate-only, stable identifiers, status, audit metadata, optimistic versioning, and domain change facts.

- [x] Step 4: Implement aggregate-specific validation.
  - Traceability: BR-U03-014 through BR-U03-028.
  - Enforce Party/Customer classification/roles, Location Country/Port hierarchy and no re-parenting, flat Region grouping, manually maintained Voyage shape, USD-ready Currency fields, simple code sets, flat Commodity, and active Region references for TradeLane.

- [x] Step 5: Define application-service ports.
  - Traceability: BR-U03-001 through BR-U03-004, BR-U03-029 through BR-U03-035.
  - Add repository, authorization client, change history, clock/id generation, and query ports.
  - Keep PostgreSQL and identity-service HTTP details outside domain-core.

- [x] Step 6: Implement application-service commands and queries.
  - Traceability: US-005 through US-010, US-017; BR-U03-029 through BR-U03-040.
  - Add admin create/update/deactivate/reactivate/validate flows.
  - Add provider list/detail/search flows with active-only default, deterministic sorting, pagination bounds, and includeInactive support.

- [x] Step 7: Add dataaccess adapter placeholders.
  - Traceability: BR-U03-001, BR-U03-002.
  - Add in-memory repositories sufficient for walking-skeleton tests and local behavior.
  - Leave durable JPA mappings/migrations as an extension point if Java tooling or later hardening requires it.

- [x] Step 8: Add identity authorization adapter boundary.
  - Traceability: BR-U03-029 through BR-U03-031.
  - Add an application/container placeholder client for U02 authorization decisions.
  - Ensure authorization denial prevents persistence and change fact creation.

- [x] Step 9: Add REST/API layer placeholders.
  - Traceability: BR-U03-032 through BR-U03-035.
  - Add internal controller skeletons for `GET /reference-sets`, provider record list/detail, admin create/update/deactivate/reactivate/validate, and history.
  - Use correlation id and platform error envelope conventions.

- [x] Step 10: Add OpenAPI contract placeholder for reference data APIs.
  - Traceability: FR-020, BR-U03-033.
  - Add `contracts/openapi/reference-data-service.yaml` with provider/admin paths, media-type versioning notes, and common response schemas.

- [x] Step 11: Add unit tests for domain validation and lifecycle.
  - Traceability: BR-U03-005 through BR-U03-028.
  - Cover duplicate key rejection, inactive default exclusion, stale version rejection, Location/Port orphan and re-parent rules, TradeLane active Region validation, validate-only no persistence, and change fact creation on mutation.

- [x] Step 12: Add application/API tests or stubs.
  - Traceability: BR-U03-029 through BR-U03-040.
  - Cover authorization denial prevents persistence, provider read returns canonical DTOs, deterministic pagination/sort, and history query shape.

- [x] Step 13: Update service configuration and local runtime placeholders.
  - Traceability: U03 infrastructure design.
  - Add local reference-data service config for PostgreSQL ownership, identity-service URL, pagination limits, and readiness.

- [x] Step 14: Run verification.
  - Traceability: Standard test strategy.
  - Run Java tests if Java/Maven are available; otherwise record the environment limitation.
  - Re-run skeleton validation, source-level domain-core dependency scan, and executable frontend/package checks if touched.

## Test Strategy

The active strategy is Standard. U03 must create domain/application unit tests and adapter/API test stubs for key boundaries. Build and Test may expand coverage later, but U03 must not defer core test files.

## Approval

This plan is ready for review before reference-data-service implementation.

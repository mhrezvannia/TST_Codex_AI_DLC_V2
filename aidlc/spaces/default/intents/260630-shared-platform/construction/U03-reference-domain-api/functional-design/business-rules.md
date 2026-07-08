# Business Rules - U03 Reference Domain and Provider/Admin APIs

## Source Trace

These U03 business rules trace to `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

## Ownership Rules

BR-U03-001: `reference-data-service` is the only owner of canonical state for Party/Customer, Location/Port, Region, Voyage, Currency, ChargeCode, EquipmentType, Commodity, and TradeLane.

BR-U03-002: No consumer, frontend app, future module, or other service may read or write the `reference-data-service` database directly.

BR-U03-003: Consumers integrate through provider/admin OpenAPI and, after U04, reference-change events only.

BR-U03-004: The service must use one deployable bounded context with explicit internal aggregate modules; it must not split each reference set into a deployable service or collapse all rules into an ungoverned metadata blob.

## Common Reference Rules

BR-U03-005: Every reference record must have a stable platform-owned identifier.

BR-U03-006: Every reference record must have an active/inactive status.

BR-U03-007: Inactive records must remain readable for historical references.

BR-U03-008: Default list and provider reads must exclude inactive records unless explicitly requested.

BR-U03-009: Every reference mutation must persist created/updated/status-change metadata as applicable.

BR-U03-010: Every mutation must carry a correlation id into audit/change history and the domain change fact for U04.

BR-U03-011: Duplicate active business keys within the same reference set are prohibited.

BR-U03-012: Updates must reject stale versions rather than silently overwriting concurrent changes.

BR-U03-013: Validation-only operations must not persist data and must not create outbox/domain change facts.

## Aggregate Rules

BR-U03-014: Party/Customer records must use a generic party plus roles model.

BR-U03-015: Party/Customer records containing PII or commercially sensitive values must be classified as Confidential or Restricted.

BR-U03-016: A Port must belong to exactly one active Country in the MVP Location structure.

BR-U03-017: Orphan Ports are prohibited.

BR-U03-018: Re-parenting an existing Port to a different Country is prohibited unless a later governed migration capability is approved.

BR-U03-019: Terminal/facility-level Location nodes are out of MVP scope.

BR-U03-020: Regions are flat MVP groupings assigned over locations and must not create a multi-level hierarchy.

BR-U03-021: TradeLane records must reference active origin and destination Regions.

BR-U03-022: TradeLane records must remain configurable; the model must not hard-code a single trade, geography, or site.

BR-U03-023: Voyage records are manually maintained at MVP and represent schedule/nominal-capacity reference information only.

BR-U03-024: Voyage allocation and capacity consumption are out of Shared Platform scope.

BR-U03-025: Currency must support USD as the active MVP currency and preserve fields needed for later multi-currency expansion.

BR-U03-026: Exchange-rate management is out of MVP scope.

BR-U03-027: ChargeCode, EquipmentType, and Commodity must support unique code, display name, optional description/classification, active/inactive lifecycle, and search.

BR-U03-028: Commodity is a flat code list at MVP; hierarchy or HS-aligned modeling is deferred.

## Authorization and API Rules

BR-U03-029: Admin create, update, deactivate, and reactivate operations require `identity-service` authorization.

BR-U03-030: Authorization denial must prevent persistence and must return a standard error envelope or read-only signal as appropriate to the caller.

BR-U03-031: Provider reads must be authorized when the reference set or caller context requires it.

BR-U03-032: API errors must distinguish validation, duplicate key, not found, conflict, authorization, and dependency unavailable cases.

BR-U03-033: All synchronous APIs must publish OpenAPI contracts with media-type versioning and camelCase JSON.

BR-U03-034: API pagination and sorting must be deterministic.

BR-U03-035: Search/filter inputs must be validated to prevent unbounded queries.

## Change and Audit Rules

BR-U03-036: Successful mutations must record reference change history with actor, timestamp, operation, before/after summary where practical, reason/change note where supplied, version, and correlation id.

BR-U03-037: Sensitive Party/Customer reads and administrative mutations must produce structured access/audit signals suitable for later observability.

BR-U03-038: Successful mutations must produce one domain change fact for U04 outbox enqueueing.

BR-U03-039: Failed validation, authorization, or conflict attempts must not produce reference-change domain facts.

BR-U03-040: U03 must expose recent change history for authorized administrators.

## Scope Rules

BR-U03-041: U03 must not implement Kafka producer retries, Schema Registry registration, or Avro compatibility checks; those belong to U04/U08.

BR-U03-042: U03 must not implement `apps/reference-data` screens or BFF handlers; those belong to U06.

BR-U03-043: U03 must not implement final deterministic seed data; that belongs to U09.

BR-U03-044: U03 must not implement Charge, Booking, or Container Movement runtime services, screens, databases, or stubs.

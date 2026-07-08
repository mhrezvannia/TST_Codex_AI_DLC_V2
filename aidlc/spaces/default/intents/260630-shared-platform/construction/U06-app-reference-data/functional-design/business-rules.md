# Business Rules - U06 Reference Data Frontend App and BFF

## Source Trace

These U06 business rules trace to `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

## Access and Authorization Rules

BR-U06-001: Browser clients must call only `apps/reference-data` BFF route handlers. Direct browser-to-service calls are prohibited.

BR-U06-002: BFF route handlers must call `identity-service` or use approved session claims to evaluate effective permissions before rendering or submitting protected workflows.

BR-U06-003: Protected mutations must fail closed when authorization data is unavailable.

BR-U06-004: Users with read permission but no write permission must receive a read-only experience instead of broken or hidden screens.

BR-U06-005: Access-denied states must show the requested area/action, a safe correlation id, and request-access affordance where available.

BR-U06-006: Mutating controls must be hidden or disabled when permission is absent, and the reason must remain visible to the user.

## Reference Workspace Rules

BR-U06-007: The workspace must expose navigation to Party/Customer, Location/Port, Region, Voyage, Currency, ChargeCode, EquipmentType, Commodity, and TradeLane.

BR-U06-008: Every reference-set list must support stable sorting, pagination, active/inactive filtering, loading state, empty state, populated state, and error state.

BR-U06-009: Search and filters must preserve the prior usable result set on validation or network error.

BR-U06-010: Detail views must show identifiers, business fields, active/inactive status, audit metadata, relationship fields, and event/publication status where available.

BR-U06-011: Inactive records must remain readable and must be excluded from default active lookups unless the user requests inactive records.

BR-U06-012: Party/Customer screens must show classification/access cues where PII or commercially sensitive fields are present.

## Form and Validation Rules

BR-U06-013: Create and edit workflows must use React Hook Form and Zod for client-side form state and shape validation.

BR-U06-014: Service validation errors must map into field-level errors and a validation summary.

BR-U06-015: Draft values must be preserved after client validation errors, service validation errors, conflicts, authorization denials, and network failures.

BR-U06-016: Duplicate business-key errors must be shown as conflicts, not generic failures.

BR-U06-017: Location/Port forms must make Country selection required before Port save and must surface orphan-port or re-parenting rejections from the service.

BR-U06-018: Region forms must represent flat Region grouping only; hierarchy controls are out of MVP scope.

BR-U06-019: TradeLane forms must use origin Region and destination Region selectors and must show inactive/missing Region validation errors.

BR-U06-020: Deactivate/reactivate actions must use confirmation dialogs naming the record and consequence.

BR-U06-021: Deactivation must capture a reason where required by the service response or workflow policy.

## Event Status Rules

BR-U06-022: Record detail/history must expose pending, published, failed, retrying, stale, or unknown publication status when returned by the backend.

BR-U06-023: Event id and correlation id must be copyable where safe and must have accessible labels.

BR-U06-024: Event status load failure must be non-blocking for record detail display.

BR-U06-025: Status must be represented by text and accessible names, not color alone.

## Accessibility and Responsive Rules

BR-U06-026: The app must meet WCAG 2.1 AA expectations for keyboard navigation, visible focus, semantic labels, form errors, contrast, live status updates, and responsive zoom behavior.

BR-U06-027: Reference tables must use semantic table structure with captions, column headers, and keyboard-reachable row actions.

BR-U06-028: Validation summaries must be focusable or reachable and must link or point to invalid fields.

BR-U06-029: Dynamic status, validation summaries, and event freshness warnings must use appropriate live-region behavior.

BR-U06-030: Mobile layout defaults to read-only lookup. Full mobile create/edit is out of MVP scope unless later approved.

## Scope Rules

BR-U06-031: U06 may display contract/developer views supplied by U07, but it must not create downstream Charge, Booking, or Container Movement runtime screens.

BR-U06-032: U06 must consume `reference-data-service` and `identity-service` contracts through BFF handlers and shared `@erp/*` packages; it must not own backend aggregate invariants.

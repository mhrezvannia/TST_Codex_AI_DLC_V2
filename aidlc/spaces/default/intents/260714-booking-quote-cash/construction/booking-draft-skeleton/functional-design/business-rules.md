# Business Rules - U01 Booking Draft Skeleton

## Draft Invariants

| ID | Rule | Failure |
|---|---|---|
| BR-U01-001 | `bookingId` is nonblank, immutable, opaque, and globally unique within Booking ownership. | Reject construction/persistence. |
| BR-U01-002 | `bookingNumber` is nonblank, immutable, unique, and display-safe; it is not the cross-service event key. | Reject or retry number allocation. |
| BR-U01-003 | A new draft starts at revision 1 and status `DRAFT` with exactly one `BOOKING_DRAFT_CREATED` lifecycle fact. | Roll back create. |
| BR-U01-004 | Customer reference is required and represented by stable code/ID only; no customer name/contact PII enters events or audit. | 400 field error. |
| BR-U01-005 | `routing` is ordered and nonempty. W1 requires exactly one `RoutingLeg` with `legSequence=1`, nonblank `loadUnLocode`, `dischargeUnLocode`, and `voyageId`. | 400 field error. |
| BR-U01-006 | Load/discharge codes are uppercase UN/LOCODE-shaped values and differ for the thin journey. Live active-reference authority is U02. | 400 shape error in U01; active-state error in U02. |
| BR-U01-007 | `equipment` is nonempty. W1 requires exactly one assignment with nonblank `equipmentTypeCode`, `quantity=1`, and required `equipmentId`. | 400 field error. |
| BR-U01-008 | `equipmentId` is normalized uppercase and passes ISO 6346 owner/category/serial/check-digit validation on the server; client format validation is advisory. | 400 `equipment[0].equipmentId`. |
| BR-U01-009 | Currency is visibly fixed to USD, cargo mode to FCL dry, and reefer/DG flags to false for W1; hidden defaults are forbidden. | 400 if supplied values contradict W1. |
| BR-U01-010 | Contract field names are exact: `routing`, `legSequence`, `loadUnLocode`, `dischargeUnLocode`, `voyageId`, `equipment`, `equipmentTypeCode`, `quantity`, `equipmentId`. Legacy aliases cannot appear in new API/domain/event output. | Contract/ERP fidelity failure. |

## Idempotency and Transaction Rules

- `Idempotency-Key` is required for create, bounded to 128 visible ASCII characters, and scoped to operation `CREATE`.
- Request equality is determined by SHA-256 of normalized business payload, not actor, correlation ID, timestamp, JSON property order, or whitespace.
- Same key + same operation + same hash returns the same Booking ID and revision after completion.
- Same key + different operation/hash is a 409 conflict and never mutates either request's Booking.
- Draft, command receipt, and audit commit atomically in one Booking database transaction.
- Database unique constraints arbitrate races. A code-level find-then-insert sequence alone is insufficient.
- A rolled-back attempt leaves no durable `IN_PROGRESS` receipt. A committed in-progress lease is not used for U01; long-running claim leases belong to Charge pricing.
- Correlation ID is required at the application boundary, propagated to audit/lifecycle response metadata, and excluded from request equivalence.

## Migration and Compatibility Rules

- V1 baseline plus additive V2 is the only accepted W1 Booking migration chain; later vertical units consume it and do not rewrite these files.
- Flyway is the only runtime schema initializer: `spring.sql.init.mode=never`; service-local migrations use `classpath:db/migration` with `baseline-on-migrate=false`.
- A non-empty schema without Flyway history may be explicitly baselined at version 1 only after an exact checked-in V1 catalog fingerprint matches tables, columns/types/nullability/defaults, keys, and indexes. Unknown/partial schemas block startup before baseline or migration; an empty schema executes V1 then V2.
- No row, booking ID, booking number, lifecycle event, exception, status, revision, or complete pricing snapshot may be dropped by migration/upcast.
- Missing legacy voyage/equipment identity is never guessed. Such drafts remain readable and correction-blocked until valid data is supplied.
- Backfill is restart-safe and idempotent. It updates only older snapshot versions and records failures with business key/reason without logging PII.
- Existing legacy JSON remains recoverable until V1-to-V2, two-restart, and restore/forward-repair evidence is green.
- Destructive database reset is not migration evidence.

## API and Query Rules

- Stable public routes are `/bookings`, `/bookings/new`, and `/bookings/{bookingId}`; W1 does not require the global W2-01 shell.
- Booking create/list/detail browser calls go through local BFF route handlers; browser-direct service calls are forbidden.
- Server BFF owns backend URL, local identity, correlation propagation, timeout, and safe error normalization.
- List query has deterministic ordering, bounded page size, enumerated status filter, and URL-persisted search/filter/page state.
- `not found`, `empty`, `unavailable`, and `validation error` are distinct states.
- No static/fallback Booking record may appear after an API failure.
- New responses use canonical routing/equipment DTOs. Temporary legacy response aliases, if required for migration tests, are server-internal and removed before U01 acceptance.

## Frontend and Accessibility Rules

- Required controls expose persistent labels, descriptions/errors with programmatic association, and code plus label for reference values.
- Create remains disabled only for incomplete local shape or active submission; server validation remains authoritative.
- On failure, all values remain, error summary receives focus, and each item links to the field.
- On success, navigate to the stable detail URL and announce `Booking created` through a polite live region.
- List rows use real links/buttons; click-only table rows are forbidden.
- Responsive behavior follows the approved mockups: full table at desktop, prioritized columns at tablet, semantic stacked rows at mobile; text and controls do not overlap.
- Cards are limited to genuine repeated/bounded items; sections are unframed and no nested cards/marketing decoration are introduced.

## Out-of-Scope Rules

U01 does not implement live reference acceptance (U02), Charge pricing (U03), confirmation/events/CMM (U04), status projection (U05), replay hardening (U06), or final release evidence (U07). It prepares extension points and schema structures but cannot claim those outcomes.

## Source Coverage

Rules implement U01 in `unit-of-work.md`, US-W1-001 in `unit-of-work-story-map.md`, FR/NFR constraints in `requirements.md`, C02-C05/C10-C11 ownership in `components.md`, method boundaries in `component-methods.md`, and service/database/BFF restrictions in `services.md`.

# Business Rules - dnd-author-price-walking-skeleton

## Source authority

Rules derive from approved `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, Application Design `components.md`, `component-methods.md`, and `services.md`. U01 establishes the complete generic foundation but demonstrates one representative rule; it does not absorb later lifecycle, historical or failure breadth.

## Terms and lifecycle rules

| ID | Rule | Enforcement |
| --- | --- | --- |
| U01-R01 | Rule type is exactly `IMPORT_DEMURRAGE`, `IMPORT_DETENTION` or `EXPORT_DETENTION`. | Closed enum at contract and domain construction |
| U01-R02 | Movement codes, qualifiers and applicability side are derived solely from rule type. | `DndMovementBounds`; fields are read-only in UI/API domain input |
| U01-R03 | Pricing basis is `AGREEMENT` or `TARIFF` with an exact immutable basis-version id. | Command/value-object validation |
| U01-R04 | Port is uppercase UN/LOCODE; trade lane, equipment, currency and charge code are canonical reference values. | Boundary syntax plus live Reference Data validation |
| U01-R05 | Free days are a non-negative integer; flat daily rate is non-negative scale two; MVP currency is USD. | Domain value objects and database checks |
| U01-R06 | `effectiveFrom <= effectiveTo`; both endpoints are inclusive. | Domain and database range validation |
| U01-R07 | Draft is mutable; Approved is immutable. | Aggregate transition and repository write guards |
| U01-R08 | Approval requires a valid active port timezone and no Approved overlap on the full applicability key. | Reference seam plus transaction-scoped approval lock |

## Provider and calculation rules

| ID | Rule | Failure |
| --- | --- | --- |
| U01-R09 | The request header key must exactly equal the canonical bilateral tuple. | `400 PRICING_BAD_REQUEST` |
| U01-R10 | Same key/same fingerprint replays; same key/different fingerprint conflicts; live owner is in progress. | `200`, `409 IDEMPOTENCY_CONFLICT`, `409 PRICING_IN_PROGRESS` |
| U01-R11 | Echoed pricing evidence must match an immutable W3-era Standard terminal receipt, including exact membership of `dndRuleType` and its derived bounds in stored `applicableDndRuleTypes`, and exact Approved D&D terms. | `404 NO_RATE` |
| U01-R12 | Current Agreement/Tariff selection, nearest rate selection and successor substitution are forbidden. | No dependency on `PricingAuthoritySnapshotPort` |
| U01-R13 | The port timezone comes from authenticated Reference Data and is validated as `ZoneId`. | Missing/malformed provider configuration -> `503` |
| U01-R14 | Start/end codes, qualifiers and order must equal the rule bounds. | `422 PRICING_VALIDATION` |
| U01-R15 | Calendar days include weekends and holidays; working-day logic is forbidden. | Pure calculator invariant |
| U01-R16 | Success returns exactly one line, including an explicit zero line within free time. | Result constructor invariant |
| U01-R17 | Completion is owner-fenced and atomic; no partial line/result is persisted. | Repository transaction/CAS |
| U01-R18 | U01 creates the minimum fresh Standard snapshot/trigger evidence required by its representative live path; U02 extends all-type/successor/failure/replay breadth without becoming U01's prerequisite. | Real `/pricing-requests` -> stored receipt -> direct D&D proof |

## Contract and ownership rules

- Every W2-03 required field, behavior and fixture remains green.
- Additions to `pricing.v1` are additive; Charge and Booking generated fixtures share one signed U01 manifest.
- Booking runtime triggering and Container Movement integration are absent from W3-01.
- Existing Charge, Reference Data, Identity, PostgreSQL and Charge web deployables are reused; no D&D service/database is created.
- U01 owns migration and contract files. U02-U04 cannot regenerate or reinterpret them.

## UI and accessibility rules

- Routes are `/charge-agreements/dnd/terms`, `/new`, stable detail and approved query/action variants from Application Design; obsolete split rules/rates routes are not implemented.
- Pages render inside the authenticated `PlatformShell` with Charge Agreements active and no journey ribbon.
- All controls use `@erp/ui` and existing tokens. No local palette, font, shell, navigation or copied Dialog is allowed.
- Fixed movement bounds and derived side are readable and non-editable; status always has text meaning.
- Validation/provider failure preserves entered data, focuses a linked error summary and exposes field errors.
- Duplicate submission is disabled while pending; success is persistent, with an announcement supplementary to the detail state.
- Integrated UI proof remains `BLOCKED` until the exact W2-02 package revision and tests are recorded.

## Rule precedence

Security filter outcomes precede controller transport validation; controller transport validation precedes application authorization; receipt disposition precedes exact evidence/rate and semantic calculation. U01 implements the trusted happy path and basic replay foundation while U04 completes the full precedence matrix without changing this order.

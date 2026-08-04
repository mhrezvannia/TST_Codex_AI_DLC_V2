# Requirements Analysis Questions — W3-04 Booking Request Completeness

## Analysis context

- `intent-statement.md` and `scope-document.md` approve the full FCL-dry request, live validation/pricing/confirmation path, optional-field semantics, and no initial physical identifier.
- `business-overview.md`, `architecture.md`, and `code-structure.md` show a brownfield multi-service feature with a versioned Booking snapshot, Reference Data OHS, Charge ACL, Kafka/Avro outbox, CMM consumer, and duplicate Booking UI surfaces.
- `team-practices.md` requires PB-01 first, tests alongside code, 80% changed executable-line evidence, additive migration, one LinerCore shell, mandatory live/a11y/contract/audit proof, and BLOCKED rather than false PASS.
- Depth remains Standard. Requirements must be testable and observable without inventing production SLOs, geography, staffing, or release capability.

## Field dictionary and data semantics

1. What normalization and length rules should apply to user-authored text?
   - A. Unicode NFC; trim outer whitespace; preserve case and meaningful internal whitespace; customer booking reference 1–64 characters; cargo description 1–500 characters; reject control characters (recommended)
   - B. Uppercase every value and limit both fields to 35 characters
   - C. Preserve input byte-for-byte with no length or control-character rules
   - X. Other (please specify)
   - `[Answer]: A — Unicode NFC, trim outer whitespace, preserve case/meaningful internal whitespace, reject controls; customer reference 1–64 and cargo description 1–500 characters.`

2. What numeric/unit envelope should the initial slice support?
   - A. Package count integer 1–999,999; equipment quantity integer 1–9,999; gross weight decimal >0 with precision 18,3 in KGM; optional volume decimal >0 with precision 18,3 in MTQ; no implicit conversion (recommended)
   - B. Any positive decimal and any free-text unit
   - C. Support KGM/LBR and MTQ/FTQ conversions in W3-04
   - X. Other (please specify)
   - `[Answer]: A — Bounded positive integers; decimal precision 18,3; KGM weight and optional MTQ volume; no implicit conversion.`

3. What is the package-type authority?
   - A. Canonical controlled SMDG/UN-CEFACT-aligned package-type code from Reference Data; persist ID/code/version and display label, with no free-text substitute (recommended)
   - B. Booking-owned fixed enum copied into the service and UI
   - C. Free-text package type
   - X. Other (please specify)
   - `[Answer]: A — Canonical SMDG/UN-CEFACT-aligned package-type reference with ID, code, version, and label.`

## Schedule authority and completeness

4. How should requested departure relate to the selected voyage ETD?
   - A. Requested departure remains the customer’s POL-local preference; route-compatible active voyages may differ, the UI shows the variance, and both values are preserved without a guessed tolerance rule (recommended)
   - B. Selected voyage ETD must equal the requested POL-local date exactly
   - C. Requested departure is overwritten by voyage ETD
   - X. Other (please specify)
   - `[Answer]: A — Requested departure remains the POL-local customer preference; show voyage-ETD variance and preserve both without an invented tolerance.`

5. When is a selected voyage complete enough for confirmation?
   - A. Carrier voyage number, ETD, ETA, cargo cutoff, and documentation deadline must be present, version-current, timezone-aware, route-compatible, and ordered consistently; draft save remains recoverable, but confirmation blocks on absent/partial/stale facts (recommended)
   - B. ETD alone is sufficient; other derived facts are display-only
   - C. Booking may guess missing deadlines from ETD
   - X. Other (please specify)
   - `[Answer]: A — Require a current route-compatible carrier voyage number, ETD, ETA, cargo cutoff, and documentation deadline with consistent time ordering.`

## Brownfield migration and integration contracts

6. What compatibility policy should govern the new Booking snapshot and legacy records?
   - A. Add a new snapshot version and additive projections; readers accept old/new during rollout; deterministic upcast only authoritative values; explicit incomplete reasons; restartable/idempotent backfill ledger; correction on the same record (recommended)
   - B. Destructively rewrite all old snapshots and require a one-time outage
   - C. Fill missing legacy facts with W3 defaults
   - X. Other (please specify)
   - `[Answer]: A — Additive versioned snapshots/projections, old/new readers during rollout, authoritative-only upcast, explicit incompleteness, restartable/idempotent backfill, same-record correction.`

7. How must CMM handle an initial confirmed equipment request with quantity greater than one and no `equipmentId`?
   - A. Accept the contract-valid event, retain requested count/type in a pending-assignment state, create no synthetic container journey/ID, and reconcile physical journeys only after later assignment events (recommended)
   - B. Reject confirmation until every physical container ID exists
   - C. Generate placeholder container IDs from booking number and sequence
   - X. Other (please specify)
   - `[Answer]: A — CMM accepts requested count/type in a pending-assignment state, creates no synthetic physical journey/ID, and reconciles after later assignment.`

8. Which Kafka channel is authoritative for the confirmation event?
   - A. `booking.confirmed` is canonical per enterprise contract and AsyncAPI; migrate producer, consumer, Compose, and verification additively after inventorying consumers; no silent dual publication (recommended)
   - B. Keep runtime `booking.events` and revise enterprise/AsyncAPI authority to match
   - C. Dual-publish indefinitely to both topics
   - X. Other (please specify)
   - `[Answer]: A — `booking.confirmed` is canonical; inventoried additive producer/consumer/Compose/verification migration; no silent dual publication.`

9. Which Booking UI route/composition is canonical for W3-04?
   - A. Shared-shell `/booking` is canonical per LinerCore; `/bookings` becomes a compatibility redirect or thin delegate; one form/detail composition owns behavior (recommended)
   - B. Booking-local `/bookings` is canonical and the shared-shell `/booking` implementation is removed
   - C. Maintain both implementations independently
   - X. Other (please specify)
   - `[Answer]: A — Shared-shell `/booking` is canonical; `/bookings` becomes a compatibility redirect or thin delegate; one form/detail composition owns behavior.`

10. What executable contract level is required?
   - A. Add/extend versioned Booking OpenAPI for create/read/correct/validate/price/confirm; real provider/consumer verification for Booking→Charge; Avro/Schema Registry compatibility plus real CMM consumer cases; catalog and examples stay synchronized (recommended)
   - B. Implementation DTOs and static JSON fixtures are sufficient
   - C. Document only the UI request shape
   - X. Other (please specify)
   - `[Answer]: A — Versioned Booking OpenAPI; real Booking→Charge provider/consumer verification; Avro/Schema Registry compatibility and real CMM consumer cases; synchronized catalog/examples.`

## Security, privacy, reliability, and proof

11. What party/customer snapshot and access policy should apply?
   - A. Persist canonical stable IDs plus the minimum confirmation-time code/display/version snapshot needed for audit; authorize create/read/correct/validate/price/confirm separately; mask by role; never log raw party/customer/cargo payloads; retention inherits approved program policy rather than inventing a duration (recommended)
   - B. Copy full Reference Data party records into Booking and events
   - C. Persist only free-text names with no canonical IDs
   - X. Other (please specify)
   - `[Answer]: A — Canonical IDs plus minimum confirmation-time code/display/version snapshot; separate action authorization, role masking, no raw payload logs, retention inherited from approved program policy.`

12. What measurable NFR posture should Requirements Analysis set without a production environment?
   - A. No invented production SLO; preserve the current 2.5-second BFF command timeout and bounded retry/idempotency behavior; record local response/flow durations, zero duplicate effects, zero fabricated/lost facts, required correlation, 80% changed-line evidence, and full live/a11y/contract/audit gate results for later Performance Validation (recommended)
   - B. Declare 99.99% availability and global p99 latency now
   - C. Set no reliability, observability, accessibility, or performance evidence requirements
   - X. Other (please specify)
   - `[Answer]: A — No invented production SLO; preserve 2.5-second BFF timeout and bounded idempotent retries; record local flow durations, duplicate/fact/correlation/coverage/a11y/contract/audit evidence.`

## Ambiguity and contradiction analysis

- All 12 answers select explicit option A and contain no unresolved “maybe”, “depends”, “not sure”, or mixed-choice language.
- The answers are consistent with the approved `intent-statement.md`, `scope-document.md`, and `team-practices.md`.
- Reverse-engineering contradictions are explicitly resolved: CMM accepts pre-assignment count/type, `booking.confirmed` is canonical, and the shared-shell `/booking` composition is canonical.
- Detailed authorization role-to-permission mapping, exact error copy, changed-line coverage tooling, consumer inventory, and rollout sequencing remain design/planning elaboration within the frozen requirement boundaries, not open product decisions.

## Fixed approved constraints

- Required at confirmation: booking customer, customer booking reference, shipper, cargo description, canonical commodity, package count/type, gross weight/unit, POL/POD, requested departure, complete selected voyage, equipment type, and positive quantity.
- Optional and non-blocking when blank: consignee, notify party, and volume/unit.
- All canonical party, commodity, package type, location, voyage, and equipment-type references use live Reference Data authority; invalid/stale required facts preserve the draft but block confirmation.
- One FCL-dry route, one equipment-request line, USD, no reefer/DG, no physical assignment, and all scope exclusions approved in `scope-document.md` remain unchanged.

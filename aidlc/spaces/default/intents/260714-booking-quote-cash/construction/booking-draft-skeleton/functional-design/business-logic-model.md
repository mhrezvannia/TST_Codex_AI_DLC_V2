# Business Logic Model - U01 Booking Draft Skeleton

## Scope and Inputs

U01 implements US-W1-001 and the walking-skeleton foundation from `unit-of-work.md` and `unit-of-work-story-map.md`: migrate the brownfield flat Booking snapshot into a contract-shaped draft, create it idempotently, list it, reopen it at a stable detail route, and preserve it through restart. It implements FR-W1-001 and the U01 portions of NFR-W1-004, NFR-W1-008, and NFR-W1-009 from `requirements.md` while respecting ownership in `components.md`, methods in `component-methods.md`, and service boundaries in `services.md`.

## Canonical Draft Workflow

### 1. Browser and BFF submission

1. `/bookings/new` loads active reference options through server-owned BFF calls; U01 may render the controls before U02 enforces live validation, but it never supplies demo records.
2. `BookingCreateForm` performs local shape checks, keeps all entered values on failure, and generates one stable client request token for the submission attempt. Retries reuse that token until the form payload changes.
3. The local BFF creates/propagates `X-Correlation-Id`, forwards `Idempotency-Key`, adds local-profile service identity on the server, maps the form to the Booking API contract, and normalizes backend field/global errors.
4. The browser never receives backend base URLs and never calls Reference Data, Charge, CMM, Kafka, or Schema Registry directly.

### 2. Command normalization and hashing

1. The controller requires `Idempotency-Key` and correlation headers and maps exact fields into `CreateBookingCommand`.
2. The application service normalizes only representation-safe details: trim identifiers/codes, uppercase UN/LOCODE/equipment codes/equipment ID, and preserve ordered array position.
3. It serializes the normalized command's business fields to a canonical JSON form with fixed property order and computes SHA-256 `requestHash`. Actor/correlation/request timing are excluded from the hash; customer, routing, equipment, commodity/default flags, dates, and quantity are included.
4. Missing, blank, malformed, or W1-cardinality-invalid values fail before persistence with field-addressable errors.

### 3. Atomic create-or-replay transaction

`BookingApplicationService.createDraft` becomes one `@Transactional` boundary:

1. Attempt to claim `Idempotency-Key` by inserting a `booking_command_receipts` row containing key, operation `CREATE`, request hash, generated Booking ID, state `IN_PROGRESS`, and creation time.
2. If the key already exists, lock/read the receipt:
   - same operation and request hash with `COMPLETED` returns the referenced Booking;
   - same hash with `IN_PROGRESS` returns a retryable conflict/in-progress result rather than generating another Booking;
   - different operation or hash returns `IDEMPOTENCY_CONFLICT` and never exposes the original payload.
3. For a new claim, generate one opaque `BookingId` and one stable human-readable `BookingNumber`; construct the canonical `Booking.draft` aggregate at revision 1 and status `DRAFT`.
4. Persist `booking_records` canonical columns plus canonical JSON snapshot.
5. Append `BOOKING_DRAFT_CREATED` audit with actor/correlation and no customer PII.
6. Mark the command receipt `COMPLETED` with the Booking ID and response revision.
7. Commit all writes together. Any failure rolls back receipt, Booking, and audit, allowing a clean retry.

Database uniqueness on idempotency key and booking number arbitrates concurrency; application pre-checks are convenience only. A losing concurrent claimant re-reads the committed receipt and follows replay/conflict rules.

## Legacy Migration and Upcast Workflow

### Flyway baseline and additive migration

1. Add Flyway to each owning service container module and use service-local `classpath:db/migration`. Booking files are `V1__booking_baseline.sql` (byte-faithful current `booking-schema.sql`) and `V2__booking_w1.sql`; Charge and CMM use the same V1/V2 naming pattern in their own separate databases.
2. Disable the old initializer with `spring.sql.init.mode=never` and remove runtime `schema-locations`; Flyway becomes the only schema writer. Local/Compose sets `spring.flyway.enabled=true`, `locations=classpath:db/migration`, `baseline-on-migrate=false`, and `baseline-version=1`.
3. A Booking-owned `FlywayMigrationStrategy` executes before normal migration. Existing Flyway history is validated and migrated; an empty schema executes V1 then V2. A non-empty schema without history is compared with a checked-in exact V1 catalog fingerprint covering tables, columns/types/nullability/defaults, keys, and indexes. Only an exact match is explicitly baselined at version 1 and migrated to V2. Unknown or partial schemas abort startup before baseline or migration.
4. V2 adds typed query columns/structures, request hash/operation/state fields to the idempotency/receipt model, all later W1 receipt/projection/outbox constraints assigned to U01, migration marker/version fields, indexes, and backfill support. It does not drop legacy columns or rows.
5. Before application cutover, migration evidence captures Flyway history/checksums, row counts, booking IDs/numbers, status/revision, and snapshot hashes. Two restarts must report no pending migration.

### Deterministic snapshot upcaster

`BookingSnapshotCodec` reads a version discriminator. Missing version means legacy v1:

1. Preserve `id`, `bookingNumber`, `revision`, `status`, `customerId`, pricing snapshot, exceptions, D&D candidates, lifecycle events, and safe unknown attributes.
2. Map one legacy route to `routing[0]` with `legSequence=1`, `loadUnLocode=originLocationId`, `dischargeUnLocode=destinationLocationId`, and `voyageId` from the legacy attribute only when present.
3. Map one legacy equipment line to `equipment[0]` with `equipmentTypeCode=equipmentType`, `quantity=1`, and `equipmentId` from legacy `attributes.containerId` only when present and valid.
4. A row missing voyage/equipment identity needed by the W1 create contract remains readable as a marked `LEGACY_INCOMPLETE` draft and cannot validate/price/confirm until corrected; the upcaster never fabricates codes.
5. Known migrated keys are removed from authoritative attributes. Unrecognized keys survive in `legacyAttributes` for audit/backward read only and are never used as routing/equipment authority.
6. Serialize canonical snapshot version 2 deterministically. An idempotent backfill updates only rows whose snapshot version is below 2 and records migration outcome/reason.

Backfill and restart tests prove that running V2 twice produces no further changes. Forward-repair restores from the captured backup or ships an additive repair migration; destructive reset is forbidden.

## Query and Route Workflows

### Booking list

1. `/bookings` parses URL search/status/page parameters and calls the local BFF from a server page.
2. Booking API executes a bounded, deterministic query ordered by `updatedAt DESC, bookingId DESC`; search matches booking number/customer reference, status is enumerated, and page size is capped.
3. The page renders semantic table/stacked rows from real records only. Empty, unavailable, and validation states are distinct; unavailable never becomes empty.
4. Booking reference links to `/bookings/{bookingId}` while preserving filter parameters in the back link.

### Booking detail

1. `/bookings/{bookingId}` loads the canonical Booking detail through the BFF on the server.
2. HTTP 404 renders `Booking not found`; timeout/5xx renders an explicit retryable unavailable state with no fake record; success renders route/equipment/status/revision and later-slice extension regions.
3. Refresh re-queries persisted state. U01 does not keep the browser copy as authority.

## Error and Recovery Model

| Failure | API result | UI behavior | Persistence effect |
|---|---|---|---|
| Field/cardinality/ISO shape invalid | 400 `BOOKING_VALIDATION` with field paths | Preserve values, focus summary, link fields | None |
| Same idempotency key, changed payload | 409 `IDEMPOTENCY_CONFLICT` | Explain safe retry conflict; do not resubmit automatically | Existing draft unchanged |
| Same key/hash completed | 200/201 replay metadata with existing draft | Navigate to existing detail and announce created/recovered | No duplicate |
| Same key/hash still in progress | 409 `COMMAND_IN_PROGRESS` | Keep values and allow bounded retry | No duplicate |
| Unknown booking | 404 `BOOKING_NOT_FOUND` | Stable not-found state and back action | None |
| Booking service unavailable | normalized 503 | Explicit retry, no fallback data | Existing DB unchanged |
| Legacy snapshot cannot be safely upcast | quarantined read error/evidence row, startup/readiness failure when release-blocking | No fake detail; operator evidence only | Original snapshot retained |

## Source Coverage

This algorithm refines the U01 definition in `unit-of-work.md`, story assignment in `unit-of-work-story-map.md`, acceptance in `requirements.md`, component ownership in `components.md`, application/port signatures in `component-methods.md`, and HTTP/database/BFF boundaries in `services.md`.

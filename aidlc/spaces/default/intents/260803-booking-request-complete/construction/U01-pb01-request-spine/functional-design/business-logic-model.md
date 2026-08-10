# Business Logic Model - U01 PB-01 Request Spine

## Purpose and Scope

U01 proves the thinnest truthful W3-04 vertical slice: an authorized Booking Desk Agent creates one draft through canonical `/booking/new`, persists a stable booking identity and revision, reopens the exact request spine, and recovers an uncertain create through the same operation identity. The acceptance spine contains route, POL-local requested departure, the available authoritative selected-voyage snapshot, equipment type, quantity `3`, and `equipmentId = null`.

This model consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. It specializes US-01, FR-005, FR-008 through FR-010, FR-024 through FR-030, AC-001, NFR-001 through NFR-010, and the B01 walking-skeleton Definition of Done. U02 owns the complete commercial field dictionary, U03 owns the full schedule classification and recovery matrix, U04 owns pre-W3 upcast/backfill, and U08 owns legacy route convergence.

## Authoritative Boundaries

| Concern | Authority | U01 behavior |
| --- | --- | --- |
| Request identity, revision, draft state, operation journal | Booking | Creates and persists one authoritative result |
| Voyage identity and schedule facts | Reference Data voyage seam | Supplies route-compatible candidates and available confirmation-grade facts; Booking captures a governed snapshot |
| Browser session and create permission | Existing BFF and Booking service policy | Denial precedes provider lookup, mutation, or protected disclosure |
| Shell, tokens, primitives, focus conventions | LinerCore and executable `@erp/ui` | Reused unchanged; Booking owns only page composition |
| Persistence | Booking PostgreSQL | Additive current-record writer and projection only |

The shell forwarder remains transport-only, the Booking BFF remains the same-origin security/error boundary, and the Booking service remains the sole business authority. No layer queries another service's database or treats browser state as committed truth.

## Create Draft Processing Sequence

1. The browser creates one opaque UUID `operationId` before the first submit. The same value is sent as the `Idempotency-Key` and retained until the payload changes or the operation reaches a deterministic terminal result.
2. `BookingRequestForm` performs advisory shape checks. A failure focuses `#booking-errors`, links each error to its persistent field label, preserves every other value, and sends no command.
3. The shell posts only to `POST /api/booking/bookings/drafts`; the transport-only forwarder targets the Booking BFF `POST /api/bookings/drafts`. Existing `POST /api/bookings` is unchanged compatibility surface until U08.
4. The BFF authenticates the session, validates origin/body bounds, checks create policy, propagates actor, tenant, correlation and idempotency context, uses `cache: no-store`, and applies the existing 2.5-second command boundary.
5. The Booking API parses transport shapes into typed command/value objects. It does not infer schedule authority or completeness.
6. The Booking application service authorizes `create` before protected provider work and resolves the operation journal by `(actorScope, operationId)`.
7. If the same identity already has a terminal result for the same normalized payload hash, return that result. If its payload hash differs, return `IDEMPOTENCY_CONFLICT` without mutation. If it is in progress or outcome-unknown, return the recorded operation status without invoking create again.
8. For a new identity, transaction C1 inserts an `IN_PROGRESS` create-operation claim with safe actor/tenant scope, correlation, payload fingerprint, opaque owner token, monotonically increasing claim version and bounded lease. No raw party, cargo, or schedule payload is written to diagnostics.
9. While the claim lease is owned, resolve the mandatory selected voyage through the bounded voyage seam using POL, POD, requested departure and selected voyage identity/version. Capture every authoritative fact currently returned. Missing provider-derived schedule facts may produce a truthfully incomplete draft; voyage identity itself is not optional and no milestone is guessed.
10. Build the Booking draft with immutable `bookingId`, generated booking reference, revision `1`, state `DRAFT`, the typed request spine, `quantity = 3`, and `equipmentId = null`.
11. In transaction C2, lock the operation claim and fence on operation ID, owner token, claim version, state and unexpired lease. Persist the current snapshot, additive query projection, safe `BOOKING_DRAFT_CREATED` activity/audit fact, and `SUCCEEDED` operation result atomically. The result contains the committed booking ID/revision and canonical detail reference. If fencing fails, no Booking effect commits.
12. Return the privacy-shaped projection. The shell navigates to `/booking/{bookingId}?tab=overview`, renders a one-time created/saved announcement, and focuses `h1#booking-record-title` after navigation.

Text fallback for the sequence: one stable browser identity crosses shell, BFF and Booking; Booking resolves replay before work, captures provider-owned voyage evidence, and commits the draft and operation result together before the browser navigates.

## Voyage Snapshot Algorithm

Inputs are `portOfLoadingUnLocode`, `portOfDischargeUnLocode`, `requestedDepartureDate`, `voyageId`, and `voyageVersion` when the provider exposes a version.

1. Require distinct syntactically valid POL/POD values and a valid POL-local calendar date before requesting candidates.
2. Query only the live voyage seam; do not reuse a copied option list as authority.
3. Select a candidate only when its identity matches the committed option and its route matches POL/POD.
4. Preserve `requestedDepartureDate` as the operator's preference. Never replace it with carrier ETD.
5. Capture `voyageId`, `voyageVersion`, source, carrier voyage number, ETD, ETA, cargo cutoff and documentation deadline when available.
6. Mark the snapshot facts as provider-derived and read-only in Booking.
7. If any confirmation-grade fact is absent, retain the selected voyage reference and available facts, classify the draft truthfully incomplete, and allow draft save. U03 later adds complete partial/stale/incompatible/temporal classification and recovery rules.

## Idempotency and Unknown-Outcome Recovery

| Recorded state | Create handler behavior | UI recovery |
| --- | --- | --- |
| No record | Claim identity and execute once | Show saving state; duplicate submit disabled |
| `IN_PROGRESS` | Do not start another create | `#save-status`; explicit Refresh status |
| `SUCCEEDED` | Return recorded booking result | Navigate to canonical detail |
| `REJECTED` | Return recorded stable error/recovery | Focus linked error/status; correct input if allowed |
| `OUTCOME_UNKNOWN` | Do not resubmit or create a new identity | Preserve form and UUID; explicit non-mutating Refresh |
| `NOT_ACCEPTED` | No draft exists; retry eligibility is explicit | Dedicated same-identity Retry with expected claim version and signed retry grant |
| `EXPIRED` | Return safe terminal/manual-resolution result | Inspect or return safely; never blind retry |

`GET /api/booking/operations/{operationId}` authorizes against the stored actor/tenant scope and original create policy before returning status. Missing and inaccessible operation identities use the same existence-safe response. Refresh invokes no command handler and no provider mutation.

The BFF/client 2.5-second boundary does not write Booking journal state. It sets only the local presentation state `outcomeUnknown`; the subsequent status GET discovers the Booking-owned `IN_PROGRESS`, terminal, or safely reclaimable result. Persisted `OUTCOME_UNKNOWN` remains reserved for a Booking-owned downstream acceptance uncertainty and is not synthesized from a browser timeout in U01.

## Operation Claim and Fencing Protocol

The operation journal has global primary key `operationId`. The row also binds `operationType=CREATE_DRAFT`, actor/tenant scope and request fingerprint; those bindings are immutable. Claim ownership uses a random opaque `ownerToken`, monotonically increasing `claimVersion`, `leaseUntil`, and `attempt`.

1. **C1 - claim transaction.** Insert `IN_PROGRESS`, claim version `1`, attempt `1` and a configured lease. If the row exists, authorize stored actor/tenant scope before returning any state. Inaccessible scope returns protected absence. For the same authorized scope, a type/fingerprint mismatch returns `IDEMPOTENCY_CONFLICT` and performs no work.
2. **Active duplicate.** Same binding with an unexpired `IN_PROGRESS` lease returns status only. It never starts a parallel worker.
3. **Provider read.** The claim owner performs only the bounded, non-mutating voyage read. The configured lease must exceed the bounded create-work window; an owner renews by compare-and-set before C2 if necessary.
4. **C2 - fenced result transaction.** Lock the claim and require matching owner token/version, `IN_PROGRESS`, and an unexpired lease. In that same transaction create the Booking, projection and activity, then update the journal to `SUCCEEDED`. A deterministic rejection updates the same owned claim to `REJECTED` without a Booking.
5. **Crash before C2.** No Booking exists and the row remains stored `IN_PROGRESS`. Status Refresh is read-only. Once the lease expires, the query may return effective `state=NOT_ACCEPTED` and `retryEligible=true` only after confirming there is no terminal result/booking reference; it does not change the stored state. The stale owner is fenced from C2.
6. **Retry grant.** For an effective or stored `NOT_ACCEPTED` result, status returns `expectedClaimVersion` and a short-lived opaque `retryGrant` signed over operation ID, authorized actor/tenant scope, operation type, request fingerprint, current claim version and grant expiry. Signing is stateless/read-only and stores no new state. The grant contains no request payload.
7. **Explicit same-identity retry.** The user invokes `POST /api/booking/operations/{operationId}/retry` with the original canonical request plus `expectedClaimVersion` and `retryGrant`. The service re-authorizes create, verifies the signature/scope/fingerprint/expiry, then compare-and-sets the matching expired or stored-`NOT_ACCEPTED` claim to a new owner token/version and increments the single bounded attempt. Reusing the grant fails because claim version changed. An ordinary delayed duplicate to `/bookings/drafts` has no grant and returns status without reclaiming the lease.
8. **Crash during C2.** Local transaction rollback leaves no Booking and no terminal result; recovery follows step 5. Commit writes both Booking and terminal result, so a committed Booking cannot coexist with a nonterminal journal row.
9. **Retention expiry.** After the configured operation-retention boundary, the service records/returns `EXPIRED`; it is never retry-eligible. No duration is invented by U01.

The operation repository, not the BFF, owns persisted state. Stored states change only in command/reconciliation transactions; status GET may calculate an effective state and signed grant but performs no journal mutation. All claim, renewal and terminal updates are compare-and-set or row-locked. No worker may commit after losing its lease/version.

## Canonical Create Contract and Fingerprint

The new W3-04 endpoint accepts the following semantic JSON shape; property order on the wire is irrelevant:

```json
{
  "bookingCustomerPartyId": "party-id",
  "routing": [
    {
      "legSequence": 1,
      "portOfLoadingUnLocode": "USNYC",
      "portOfDischargeUnLocode": "NLRTM"
    }
  ],
  "requestedDepartureDate": "2026-08-20",
  "selectedVoyage": {
    "voyageId": "voyage-id",
    "voyageVersion": "provider-version-or-null"
  },
  "equipment": [
    {
      "equipmentTypeCode": "45G1",
      "quantity": 3,
      "equipmentId": null
    }
  ],
  "currency": "USD",
  "cargoMode": "FCL_DRY",
  "reefer": false,
  "dangerousGoods": false
}
```

The array order is authoritative: U01 requires one routing leg with `legSequence=1` and one equipment line. `selectedVoyage.voyageId` is required; provider version may be null only when the option authority did not supply it. The client does not submit carrier number or schedule instants as authority. Booking re-resolves the selected voyage through its port and produces `selectedVoyageSnapshot` in the response/persistence with mandatory identity/source and explicit nullable version/derived facts.

The shell route, Booking BFF route and Booking service route use the same canonical body without field renaming. The exact success shape is:

```json
{
  "bookingId": "booking-id",
  "bookingReference": "BKG-reference",
  "revision": 1,
  "status": "DRAFT",
  "request": {
    "bookingCustomerPartyId": "party-id",
    "routing": [{"legSequence": 1, "portOfLoadingUnLocode": "USNYC", "portOfDischargeUnLocode": "NLRTM"}],
    "requestedDepartureDate": "2026-08-20",
    "selectedVoyageSnapshot": {
      "voyageId": "voyage-id",
      "voyageVersion": null,
      "voyageSource": "reference-data",
      "carrierVoyageNumber": null,
      "estimatedDepartureAt": null,
      "estimatedArrivalAt": null,
      "cargoCutoffAt": null,
      "documentationDeadlineAt": null
    },
    "equipment": [{"equipmentTypeCode": "45G1", "quantity": 3, "equipmentId": null}],
    "currency": "USD",
    "cargoMode": "FCL_DRY",
    "reefer": false,
    "dangerousGoods": false
  },
  "operation": {
    "operationId": "operation-uuid",
    "state": "SUCCEEDED",
    "recovery": "INSPECT",
    "correlationId": "safe-correlation-id"
  }
}
```

Nullable provider values remain explicit nulls. The new endpoint uses no legacy aliases. The unchanged legacy adapter alone maps `customerId` to `bookingCustomerPartyId`, `routing[].loadUnLocode`/`dischargeUnLocode` to the approved port names, and legacy `id`/`bookingNumber` response aliases.

When status declares retry eligibility, the dedicated retry body is `{ "expectedClaimVersion": <integer>, "retryGrant": "<opaque-signed-token>", "request": <the exact canonical create body> }`. The operation ID remains in the retry path, and the service recomputes the request fingerprint before validating the grant/CAS. The retry response uses the same success/status shape as create. No ordinary draft POST may reclaim an existing expired operation without this grant.

The request fingerprint is SHA-256 (or the repository-standard collision-resistant equivalent) over a deterministic UTF-8 canonical serialization of: contract schema version; `bookingCustomerPartyId`; the ordered routing array including sequence and canonical UN/LOCODE case; requested date; selected voyage identity/version including explicit null version; ordered equipment array including explicit null `equipmentId`; and the fixed currency/mode/indicator values. Object keys are sorted, numbers use their canonical decimal form, and arrays preserve order. Provider-derived source/carrier/schedule results are excluded because they are service-resolved output, not client command intent. `operationId`, actor/tenant scope, correlation, display labels and transport headers are also excluded; operation type and actor/tenant scope are immutable journal bindings checked separately.

## Reopen Processing Sequence

1. The server route `/booking/{bookingId}?tab=overview` authenticates and authorizes `read` before protected lookup.
2. `BookingQueryService` loads the current Booking snapshot and query projection from Booking-owned persistence.
3. The adapter maps typed request values without reconstructing authority from an attributes map.
4. The projection returns the stable `bookingId`, booking reference, revision, draft status, route, requested date, selected-voyage evidence, equipment type, quantity and nullable equipment ID.
5. The page renders the Overview route using LinerCore primitives, with requested date distinct from provider-derived schedule evidence.
6. A missing or inaccessible record returns the same protected-absence shape; no customer, route, or existence hint is rendered.

The round-trip comparison is exact for IDs/codes/versions, integer quantity, nullable equipment identifier, date, instants and revision. Display formatting never becomes the persistence source.

## Data Transformations

| Boundary | Input | Transformation | Output |
| --- | --- | --- | --- |
| Form to shell command | String control values and committed option objects | Trim transport whitespace where applicable; preserve committed canonical IDs/codes/versions; parse quantity as integer | Typed create DTO plus operation UUID |
| Shell to Booking BFF | Same-origin JSON | Transport-only forwarding; safe headers; no domain rewrite | Booking service request |
| API to domain | DTO | Parse `LocalDate`, `Instant`, UN/LOCODE, equipment type, positive quantity and nullable ID into value objects | `CreateBookingRequestCommand` |
| Voyage seam to Booking | Provider candidate | Select only matching route/identity; retain available source/version and milestones | `SelectedVoyageSnapshot` |
| Domain to persistence | Booking aggregate | Serialize explicit typed current request; update additive searchable projection | Current snapshot plus projection |
| Domain to UI | Aggregate/projection | Privacy shape, stable error/status vocabulary, machine-readable times | Canonical detail projection |

No authoritative U01 field is written only to `Map<String,String> attributes`. Existing legacy attributes remain readable but are neither the new write model nor a source for guessed current facts.

## Decision and Failure Model

| Condition | Result code/state | Mutation | Operator outcome |
| --- | --- | --- | --- |
| Create not permitted | `ACCESS_DENIED` | None, including no voyage call | Safe denied page/status |
| Invalid route/date/equipment/quantity shape | Stable field errors | None | Linked summary, preserved input |
| Voyage unavailable or incomplete | Safe schedule reason/correlation | Draft may persist with available truthful facts | Preserve input; draft inspectable; confirmation outside U01 remains blocked |
| Same identity, same payload | Replay prior result | No duplicate draft/activity | Inspect existing result |
| Same identity, different payload | `IDEMPOTENCY_CONFLICT` | None | Focus conflict/status; generate a new identity only after explicit payload edit |
| 2.5-second boundary before known result | `OUTCOME_UNKNOWN` client state | Unknown; no resubmit | Refresh same operation identity |
| Persistence failure before commit | Safe failure or `NOT_ACCEPTED` when proven | Transaction rolls back | Preserve input; bounded same-identity recovery only |
| Persistence succeeds | `SUCCEEDED` | One draft, revision, activity and operation result | Canonical detail navigation |
| Read denied/not found | Existence-safe protected absence | None | Return safely to Booking |

Raw exceptions and provider payloads do not cross the trusted boundary. Safe errors carry stable code, field path where applicable, recovery class and correlation reference.

## Transaction and Concurrency Model

- Claiming the operation identity and committing its result must prevent concurrent same-identity creates from producing more than one booking.
- The normalized payload fingerprint binds the operation to its intended request. A changed payload cannot reuse the completed identity.
- Draft snapshot, revision, searchable projection, activity/audit fact and successful operation disposition commit atomically or roll back together.
- The U01 transaction emits no confirmation outbox event and creates no physical equipment assignment.
- Browser duplicate click, Enter, touch and transport retry are equivalent replays, not new commands.
- New current U01 records use the additive current writer. Reading/upcasting/backfilling pre-W3 records is explicitly deferred to U04.

## Success Navigation Flash

On a successful create or replay, the browser stores a non-sensitive, same-tab `sessionStorage` flash keyed by booking ID with operation ID, notice kind and issue time, then navigates to `/booking/{bookingId}?tab=overview`. `BookingNavigationNotice` validates the expected result/freshness, removes the key before rendering the created/saved status, and focuses `h1#booking-record-title`. Refresh and direct reopen find no key; bfcache restoration suppresses an already-consumed notice. Invalid, expired or session-boundary flashes are removed without rendering. No customer, route, cargo or provider data enters the flash.

## Business Scenarios

### Happy path

An authorized agent selects a live route-compatible voyage, enters the requested date, selects equipment type, enters quantity `3`, and saves. One draft at revision `1` is committed with `equipmentId = null`. The browser navigates to the canonical Overview and reopening returns exact values.

### Truthfully incomplete voyage

The provider returns the selected voyage identity/version and only some schedule facts. Booking stores the available governed snapshot, marks the draft incomplete without guessing missing milestones, and allows reopen. Full U03 schedule recovery is not pulled into U01.

### Duplicate submit

Two submits carry the same identity and normalized payload. One execution wins; the second returns the same recorded booking ID/revision. Database, activity and operation counts remain one.

### Unknown response

The 2.5-second BFF boundary elapses after the command may have reached Booking. The form, values and UUID remain. The agent activates Refresh status; a read-only lookup returns `SUCCEEDED` and the canonical detail reference, or a non-terminal safe state. The browser never creates a second identity automatically.

### Authorization failure

Create permission fails before voyage/provider access. No provider call, booking row, activity detail or operation result revealing protected facts is produced.

## Verification Hooks

U01 construction must capture fresh, tagged live Compose evidence for: canonical route and BFF target; one create under duplicate inputs; status refresh without mutation; exact reopen values; quantity `3`; null `equipmentId`; stable revision; schedule source/version/facts available from the live seam; authorization-before-provider behavior; safe correlation; 2.5-second local boundary; focus at `#booking-errors`, `#save-status`, and `#booking-record-title`; required responsive/theme/keyboard checks; and zero fabricated or duplicate facts. Static design or mock-backed evidence is not PASS.

## Upstream Traceability

- `unit-of-work.md`: U01 vertical boundary and live Definition of Done.
- `unit-of-work-story-map.md`: US-01 primary and US-02/US-03/US-07/US-09/US-10/US-11 contributing obligations.
- `requirements.md`: FR-005, FR-008 through FR-010, FR-024 through FR-030; AC-001; NFR-001 through NFR-010.
- `components.md`: Booking request page/form, command/query services, operation journal, voyage port and current persistence.
- `component-methods.md`: canonical routes, `createDraft`, `getOperationStatus`, `getBookingDetail`, and `getVoyageOptions` contracts.
- `services.md`: existing shell/BFF/Booking/Reference Data/PostgreSQL topology and local transaction ownership.

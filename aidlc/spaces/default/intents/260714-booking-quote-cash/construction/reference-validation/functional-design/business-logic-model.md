# Business Logic Model - U02 Reference Validation

## Scope and Inputs

U02 extends the persisted U01 draft through the live Reference Data HTTP seam. It implements US-W1-002 from `unit-of-work-story-map.md` and FR-W1-002 plus NFR-W1-006/NFR-W1-007 from `requirements.md`. It follows U02's vertical boundary in `unit-of-work.md`, C03/C10/C11 ownership in `components.md`, the validation methods/ports in `component-methods.md`, and the no-distributed-transaction service flow in `services.md`.

## Validation Workflow

### 1. Capture stable validation input

1. The BFF sends `POST /api/bookings/{bookingId}/validate` with actor and correlation identity; the browser calls only its local BFF.
2. Booking loads the canonical aggregate and accepts validation from `DRAFT` or `VALIDATION_BLOCKED`. A `VALIDATED` booking with the same `validationFingerprint` returns idempotently.
3. The application service builds `BookingReferenceValidationRequest` containing booking ID, expected revision, a SHA-256 fingerprint of customer/routing/equipment reference fields, and field-addressable reference checks.
4. The database transaction/read ends before any outbound HTTP call. No Booking row lock is held while Reference Data responds.

### 2. Evaluate all canonical references

The `ReferenceValidationPort.validate(request, correlationId)` returns one typed aggregate result or throws `ReferenceProviderUnavailable`:

1. Fetch the customer from `party-customer`.
2. Fetch each routing leg's `loadUnLocode` and `dischargeUnLocode` from `location`.
3. Fetch each `voyageId` from `vessel-voyage`, including status, ID/code, version, and canonical `originLocationId`/`destinationLocationId` attributes.
4. Fetch each `equipmentTypeCode` from `equipment-type`.
5. Map per-field HTTP outcomes:
   - 200 ACTIVE -> `ACTIVE`;
   - 200 INACTIVE -> `INACTIVE`;
   - 404 -> `NOT_FOUND`;
   - malformed/mismatched set/record -> `MISMATCH`;
   - timeout, connection error, 429, or 5xx -> provider-unavailable; never convert to invalid business data.
6. Evaluate voyage-route coherence: the active voyage's canonical origin/destination IDs must match the selected leg's load/discharge reference IDs. A mismatch adds field outcomes for voyage and affected route endpoints.
7. Return all invalid/inactive/not-found/mismatch outcomes together, with checked time and reference versions. The response contains stable IDs/codes and safe labels only, no customer PII.

Independent reference calls may use bounded concurrency, but result ordering follows deterministic field path order. U02 performs no automatic retry inside the command; the operator's Retry action is explicit and avoids multiplying provider load. Transport configuration uses a bounded timeout inherited from the local service client standard.

### 3. Apply result atomically

`BookingApplicationService.applyReferenceValidation` is transactional:

1. Lock or compare-and-set the Booking by ID and expected revision/snapshot version.
2. Recompute the current reference fingerprint. If revision/fingerprint differs, return 409 `BOOKING_CHANGED`; discard the stale result and require a new validation call.
3. For a valid result, replace the prior validation snapshot, transition to `VALIDATED`, append one `BOOKING_VALIDATED` lifecycle fact, and append success audit.
4. For a completed invalid result, replace the prior validation snapshot, transition to `VALIDATION_BLOCKED`, append one `BOOKING_VALIDATION_BLOCKED` lifecycle fact, and append deny audit with aggregate reason code.
5. Save Booking and audit in the same transaction. Repeating the same result/fingerprint/status is idempotent and does not append another lifecycle fact.

### 4. Provider-unavailable handling

If the port throws provider-unavailable:

1. Do not change Booking status, validation snapshot, revision, or lifecycle.
2. Append a transport-safe `BOOKING_VALIDATION_UNAVAILABLE` attempt audit with correlation ID in a short transaction.
3. Return 503 `REFERENCE_DATA_UNAVAILABLE` with Retry semantics and correlation ID.
4. UI retains the current persisted Booking and displays unavailable separately from validation blocked.

## Reference Option Workflow

The create form's combobox options are live provider reads, not validation authority:

1. Server/BFF requests bounded pages for `party-customer`, `location`, `vessel-voyage`, and `equipment-type`, filtered to ACTIVE.
2. It maps records to `ReferenceOption(id, code, displayName, version, attributesNeededForPresentation)` and strips unrelated attributes.
3. Search is server-side/debounced and aborts superseded requests. Empty, unavailable, and no-match states remain distinct.
4. Selecting a voyage may suggest its route locations but cannot silently overwrite a user's completed fields; the validate command remains authoritative.

## Decision Table

| Provider/result state | Booking transition | Persisted validation | API/UI outcome |
|---|---|---|---|
| All fields ACTIVE and voyage coherent | DRAFT/BLOCKED -> VALIDATED | Complete valid snapshot | 200; detail marks references verified and enables Price |
| One or more INACTIVE/NOT_FOUND/MISMATCH | DRAFT/BLOCKED -> VALIDATION_BLOCKED | Complete field result | 200 business outcome; field links and correction action; Price/Confirm disabled |
| Timeout/429/5xx/connection failure | No business-state transition | Existing snapshot unchanged | 503 unavailable; explicit Retry |
| Booking changed while provider calls ran | No result applied | Existing snapshot unchanged | 409 `BOOKING_CHANGED`; re-read and retry |
| Same valid/blocked fingerprint repeated | No duplicate lifecycle effect | Existing equivalent snapshot retained/refreshed deterministically | 200 idempotent result |

## Data Transformation

Reference Data's wrapper IDs/codes and string attributes are mapped at the container adapter into typed application values. Domain code never parses provider JSON. Validation snapshots store only field path, set, requested ID/code, outcome, matched record ID/code/version, safe reason code, and checked time. They do not copy whole reference records into Booking or become a local reference replica.

## Source Coverage

The workflow refines `unit-of-work.md`, maps US-W1-002 from `unit-of-work-story-map.md`, satisfies `requirements.md`, preserves ownership from `components.md`, replaces boolean validation in `component-methods.md`, and follows the Booking-to-Reference HTTP boundary in `services.md`.

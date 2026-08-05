# Domain Entities — U05 Booking Consumption and Repricing

## Upstream alignment

The model realizes U05 in `unit-of-work.md`, its story ownership in
`unit-of-work-story-map.md`, FR-401–FR-507 from `requirements.md`, Booking
components C09–C11/C14 in `components.md`, the method contracts in
`component-methods.md`, and the persistence/resilience boundary in `services.md`.
Charge-owned Agreement, Rate, and pricing-receipt entities are referenced only
by immutable IDs; Booking does not copy their authority.

## Booking aggregate extension

| Attribute | Type/invariant | Purpose |
| --- | --- | --- |
| `bookingId` | existing non-empty ID | local aggregate and FK identity |
| `bookingNumber` | existing immutable non-empty string | serialized as provider `bookingRef` and idempotency-key prefix |
| `revision` | integer ≥ 0 | advances for every accepted Booking amendment |
| `pricingAmendmentSeq` | integer ≥ 0, default 0 on legacy decode | advances only on pricing-input fingerprint change |
| `requestedDepartureDate` | optional `LocalDate` for legacy readability; required to price | persisted business date; no clock default |
| `pricingInputFingerprint` | SHA-256 hex of canonical input | detects pricing-affecting amendments and completion races |
| `pricingStatus` | additive typed enum | `UNPRICED`, `PRICED`, `LEGACY_PRICED`, `REPRICE_REQUIRED`, `MANUAL_PRICING_REQUIRED`, plus distinct diagnostic states; existing `BookingStatus` remains the general lifecycle/compatibility status |
| `currentPricingRequestId` | optional immutable external ID | pointer to current typed snapshot; no embedded W2 price authority |
| `currentPriceAmendmentSeq` / `currentPriceInputFingerprint` | optional pair set on W2 or legacy success | confirmation/currentness guard, including legacy payloads that contain neither field |
| `pricingFailureEvidence` | optional typed value | current manual/outage/diagnostic evidence without amount |
| `legacyPricingSnapshot` | optional preserved v1 value | exact flattened evidence decoded from old Booking snapshots |

The aggregate keeps pricing history outside its mutable state payload. Repository
queries compose Booking state with immutable snapshot rows for API responses.
On a legacy row rewrite, the codec preserves the original legacy evidence under
its explicit legacy field; it never serializes it as a W2 snapshot.

## Value objects and result algebra

### `PricingInput`

An immutable value containing every Charge request input: booking reference,
lane, POL/POD, equipment type, customer/party, commodity, reefer/DG facts,
requested departure, equal compatibility effective date, equipment quantity,
TEU, and amendment sequence. It owns the stable canonical serializer and
fingerprint. Amendment detection first compares old/proposed bodies using the
current sequence; a detected change advances the sequence once and rebuilds the
final value/fingerprint.

### `PricingLineSnapshot`

| Field | Invariant |
| --- | --- |
| `chargeCode` | provider value; non-empty |
| `category` | existing `FREIGHT`, `SURCHARGE`, or `LOCAL` |
| `rateCategory` | `BASE`, `SURCHARGE`, or `LOCAL`; agrees with ordered position |
| `basis` | provider basis; W2 line uses `PER_CONTAINER` |
| `quantity` | positive integer equal to request equipment quantity |
| `unitRate` | provider decimal, USD, scale ≤ 2 |
| `amount` | provider decimal, USD, scale ≤ 2 |
| `currency` | `USD` and agrees with total |
| `sourceRateVersionId` | exact non-empty Charge version identity |

Numbers are stored losslessly in the JSON snapshot as contract-compatible
decimals. UI formatting never changes the persisted representation.

### `BookingPricingSnapshot`

| Field | Invariant |
| --- | --- |
| `schemaVersion` | 2 for W2 typed snapshots |
| `pricingRequestId` | exact provider terminal request ID |
| `bookingRef` | equals aggregate `bookingNumber` |
| `amendmentSeq` | equals frozen `pricingAmendmentSeq` |
| `bookingRevision` | equals frozen general revision |
| `requestedDepartureDate` | equals frozen persisted Booking date |
| `pricingBasis` | `AGREEMENT` or `TARIFF` |
| `pricingRef` | exact agreement-version ID or deterministic tariff ref |
| `agreementVersionId` | required for AGREEMENT; absent for TARIFF |
| `lines` | exactly three ordered `PricingLineSnapshot` values |
| `applicableDndRuleTypes` | exact provider array retained unchanged, including empty |
| `total` / `currency` | exact provider total and USD; total equals received line sum |
| `pricedAt` | exact provider terminal timestamp |
| `correlationId` | exact provider/operation correlation |
| `createdAt` | Booking persistence timestamp; not commercial authority |

### `PricingPortResult`

A sealed/discriminated result replaces the flattened map as the primary port
contract:

- `Priced(BookingPricingSnapshotCandidate)`;
- `LegacyPriced(existingPricingSnapshot)` only when all W2 additions are absent
  and the complete legacy response is valid;
- `ManualRequired(reasonCode, pricingRequestId, manualCaseId?, correlationId,
  providerEvidence)` for no-rate/approved ambiguity;
- `Outage(reasonCode, attempts, circuitState, nextProbeAt?, correlationId)`;
- `Denied`, `Validation`, `Malformed`, `Conflict`, and
  `InProgress(retryAfter)` as separate remote values.

The adapter never signals a generic boolean manual flag.
`BOOKING_CHANGED`, snapshot conflict, local replay, and local in-progress are
`BookingPricingCompletionResult` values produced after/by Booking persistence;
they are not remote `PricingPortResult` variants.

### `PricingFailureEvidence`

Contains reason code, safe reason text, provider request ID when present,
Charge manual case ID only for commercial-authority cases, attempt count,
circuit state/next probe only for local outages, correlation ID, occurrence
time, and frozen amendment sequence. It has no monetary field.

### `PricingOperationReceipt`

The existing `booking_idempotency` row is extended for `operation=PRICE` and is
addressed locally as `P|<bookingRef:pricingAmendmentSeq>`. It stores Booking ID,
exact provider key, canonical body hash,
`IN_PROGRESS`/`COMPLETED`/`RETRYABLE` state,
15-second lease owner/expiry, monotonic fence token, attempt count, terminal
Booking HTTP status/code/body, optional normalized retry seconds, correlation,
next-attempt time, and update time. `RETRYABLE` is also valid: it replays the
recorded outcome before `nextAttemptAt` and can then be reclaimed with a higher
fence. The browser command token is validated but is not this receipt
identity and is never sent to Charge.

The stored response is not an opaque ad-hoc map or a container DTO. It is the
application-owned `PricingCommandReceiptPayload(schemaVersion=1, outcome,
pricingRequestId, currentPriceSequence, currentPriceFingerprint, evidence,
correlationId)`, serialized by the data-access
`BookingPricingReceiptCodec` with fixed property order, UTF-8, ISO UTC
timestamps, and plain contract decimal numbers. On 200 replay an application
assembler combines this immutable pricing outcome with the current Booking view
only when current price markers still match; the container keeps its normal DTO
serialization. Error replay uses stored status/code/evidence.

## Persistence model

Booking's next ordered migration is
`V3__booking_pricing_snapshots.sql` because V1 baseline and
`V2__booking_w1.sql` already exist.

```sql
CREATE TABLE IF NOT EXISTS booking_pricing_snapshots (
    booking_id VARCHAR(64) NOT NULL
        REFERENCES booking_records(booking_id)
        ON DELETE RESTRICT,
    pricing_request_id VARCHAR(128) NOT NULL,
    amendment_seq INTEGER NOT NULL CHECK (amendment_seq >= 0),
    booking_revision INTEGER NOT NULL CHECK (booking_revision >= 0),
    schema_version INTEGER NOT NULL CHECK (schema_version >= 2),
    snapshot TEXT NOT NULL,
    correlation_id VARCHAR(128) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (booking_id, pricing_request_id)
);

CREATE INDEX IF NOT EXISTS idx_booking_pricing_snapshots_amendment
    ON booking_pricing_snapshots(booking_id, amendment_seq);

ALTER TABLE booking_idempotency
    ALTER COLUMN idempotency_key TYPE VARCHAR(192);
ALTER TABLE booking_idempotency
    ADD COLUMN IF NOT EXISTS provider_key VARCHAR(160);
ALTER TABLE booking_idempotency
    ADD COLUMN IF NOT EXISTS response_http_status INTEGER;
ALTER TABLE booking_idempotency
    ADD COLUMN IF NOT EXISTS response_code VARCHAR(64);
ALTER TABLE booking_idempotency
    ADD COLUMN IF NOT EXISTS response_snapshot TEXT;
ALTER TABLE booking_idempotency
    ADD COLUMN IF NOT EXISTS retry_after_seconds INTEGER;
ALTER TABLE booking_idempotency
    ADD COLUMN IF NOT EXISTS correlation_id VARCHAR(128);
ALTER TABLE booking_idempotency
    ADD COLUMN IF NOT EXISTS lease_owner VARCHAR(128);
ALTER TABLE booking_idempotency
    ADD COLUMN IF NOT EXISTS lease_expires_at TIMESTAMP;
ALTER TABLE booking_idempotency
    ADD COLUMN IF NOT EXISTS fence_token BIGINT NOT NULL DEFAULT 0;
ALTER TABLE booking_idempotency
    ADD COLUMN IF NOT EXISTS attempt_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE booking_idempotency
    ADD COLUMN IF NOT EXISTS next_attempt_at TIMESTAMP;

ALTER TABLE booking_idempotency
    ADD CONSTRAINT chk_booking_idempotency_retry_after
    CHECK (retry_after_seconds IS NULL OR retry_after_seconds BETWEEN 1 AND 30);
```

There is no backfill from `booking_records.snapshot`. The legacy flattened
payload remains in that row and is decoded in place. The typed repository offers
only `append`, `findByIdentity`, and ordered `findByBooking`; it exposes no
update/delete method. Append uses insert-on-conflict detection followed by an
exact persisted-value comparison over every immutable column and canonical
snapshot bytes: identical is replay, different is conflict. Database-generated
`created_at` is not compared.

The mutable Booking payload stores only typed input/status/current-pointer and
failure evidence. Snapshot insert or failure evidence, Booking update, audit,
and the fenced terminal PRICE receipt share the same Booking datasource
transaction. U05 adds no pricing outbox event; existing lifecycle outbox
behavior is unchanged.

## Codec contract

`BookingSnapshotCodec.decode(snapshotVersion, payload)` uses the existing
`booking_records.snapshot_version` column, then shape where version 1 contains
both canonical brownfield and older flat rows:

1. `snapshot_version=2`: decode typed requested departure, sequence,
   status, pointer, failure, and preserved legacy entry;
2. `snapshot_version=1` with canonical `routing`/`equipment`: retain the current
   canonical decoder and default missing W2 fields without invention;
3. `snapshot_version=1` flat legacy: preserve `PricingSnapshot` /
   `quotedAmounts` byte-for-byte as `LegacyPricingSnapshot`, with sequence zero
   and absent date;
4. malformed mixed payload: fail loudly; do not partially coerce it.

`encodeV2` writes typed aggregate state and, if present, an explicit preserved
legacy evidence object. It does not embed new W2 line snapshots, because the V3
table is their authority. The repository writes `snapshot_version=2` in the
same save; untouched rows remain version 1. API assemblers combine state and
rows into the view.
A newly received complete legacy provider result uses the unchanged existing
embedded `PricingSnapshot` write path, sets `pricingStatus=LEGACY_PRICED`, and
inserts no typed row. Partial W2 enrichment never enters that path.

## Repository and service ports

| Port/method | Contract |
| --- | --- |
| existing `PricingPort.requestPricing` | consumes frozen typed input/key/correlation; returns `PricingPortResult` |
| `BookingPricingOperationCoordinator.captureAndClaim` | separate public transactional Spring bean; validates, freezes, claims/replays/fences PRICE receipt |
| `BookingPricingCompletionService.complete` | separate public transactional Spring bean; locks/reloads, freshness/fence checks, commits outcome/audit/receipt |
| `BookingPricingResponseAssembler` / `BookingPricingReceiptCodec` | combine immutable application command outcome with current matching Booking; codec never imports container DTO |
| `BookingPricingSnapshotRepository.append` | append-only replay/conflict semantics |
| `findByBooking(cursor, size)` | deterministic current/prior history, default 20 and maximum 100 |
| `BookingRepository.lockById` | pessimistic completion freshness check |
| `Booking.pricingInputFingerprint` | canonical hash over every provider input |
| `Booking.applyAmendment` | exact status matrix; general revision plus conditional pricing-sequence transition |
| `Booking.appendPricingSnapshot` | validates candidate identity then updates only current pointer/status |
| `Booking.manualPricing` | writes typed manual/outage evidence and no total |
| `Booking.requireCurrentPricingForConfirmation` | requires matching current W2/legacy price; blocks stale/manual/error states without calling Charge |
| `Booking.requirePricingEligible` | permits only exact pre-confirm, post-confirm-amended, or manual/outage-retry pairs; rejects redundant current pricing |

## State and relationship invariants

- `currentPricingRequestId`, when present, resolves to exactly one typed row for
  the same Booking.
- Typed history is ordered but immutable; currentness is an aggregate pointer,
  not a mutable bit on history rows.
- A typed snapshot's Booking ref/date/sequence/revision/fingerprint context must
  equal the frozen operation and provider echo where supplied.
- An agreement result carries the exact agreement-version ID and all exact
  source rate-version IDs; a tariff result carries no agreement-version ID.
- Manual/outage/diagnostic evidence and a newly current priced snapshot are
  mutually exclusive outcomes of one completion transaction.
- Existing historical price may coexist with current
  `MANUAL_PRICING_REQUIRED`, but it cannot authorize confirmation as the current
  commercial result.
- Non-pricing amendments preserve the matching current sequence/fingerprint and
  may Reconfirm; pricing amendments make the prior snapshot non-current and must
  Reprice first.
- Completion preserves general `AMENDED` for every post-confirm Reprice outcome;
  only the independent pricing status changes. Pre-confirm success uses general
  `PRICED`, and pre-confirm manual uses compatibility `MANUAL_PRICING`.
- Receipt owner/fence must match at completion; an expired worker cannot mutate
  Booking or overwrite a terminal receipt.
- Claim/takeover increments the fence only from absent, due RETRYABLE, or
  expired IN_PROGRESS under row lock. Release/complete compares IN_PROGRESS
  owner+fence and clears the lease; provider in-progress releases RETRYABLE
  until normalized Retry-After.
- JDBC maps `created_at`, `pricedAt`, lease, and evidence timestamps in UTC even
  though the existing physical columns use `TIMESTAMP`.

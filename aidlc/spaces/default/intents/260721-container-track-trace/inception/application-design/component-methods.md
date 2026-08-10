# Component Methods - W2-04 Container Journey & Track-Trace

## Contract and Source Alignment

These public signatures refine `requirements.md` and `stories.md` at the
component boundary; detailed algorithms remain for Functional Design. They fit
the existing ports/adapters in `architecture.md` and `component-inventory.md`
and retain `team-practices.md` constraints: framework-free domain code,
explicit stable rejection, service-owned persistence, and Kafka-only normal
cross-module delivery.

Names are design-level Java/TypeScript signatures. Existing class names may be
retained where they already provide the stated interface.

## Domain Interfaces

```java
public final class ContainerJourney {
    public static ContainerJourney open(
        JourneyId id,
        BookingReference bookingReference,
        int bookingRevision,
        EquipmentReference equipmentReference,
        OneLegRoute route,
        Instant openedAt);

    public ContainerJourney reconcile(
        int bookingRevision,
        EquipmentReference equipmentReference,
        OneLegRoute route,
        Instant reconciledAt);

    public MovementDecision evaluateCapture(
        ValidatedMovement candidate,
        Optional<AcceptedMovement> requestDuplicate);

    public ContainerJourney apply(MovementAccepted accepted);

    public JourneyLifecycle lifecycle();
    public MovementSequence lastSequence();
    public EquipmentEventCode nextRequiredCode();
    public List<ExpectedMovement> expectedMovements();
    public List<AcceptedMovement> acceptedMovements();
}
```

Errors: `open`/`reconcile` reject invalid route/equipment invariants before
persistence. `evaluateCapture` returns a decision rather than throwing for the
two expected conflict outcomes. `apply` rejects a decision not issued for the
current journey revision/sequence.

```java
public interface MovementTransitionPolicy {
    MovementDecision evaluate(
        JourneyLifecycle currentLifecycle,
        List<AcceptedMovement> acceptedHistory,
        ValidatedMovement candidate,
        Optional<AcceptedMovement> requestDuplicate);
}

public sealed interface MovementDecision
    permits MovementAccepted, MovementRejected {}

public record MovementAccepted(
    AcceptedMovement movement,
    JourneyLifecycle nextLifecycle,
    EquipmentEventCode nextRequiredCode) implements MovementDecision {}

public record MovementRejected(
    MovementRejectionCode code,
    String reason,
    JourneyLifecycle currentLifecycle,
    Optional<EquipmentEventCode> requiredNextCode,
    Optional<MovementEvidence> originalMovement) implements MovementDecision {}
```

`MovementRejectionCode` is limited here to `DUPLICATE_MOVEMENT` and
`OUT_OF_SEQUENCE_MOVEMENT`. Field/reference validation remains a distinct 400
outcome and authorization denial a distinct 403 outcome.

```java
public record ValidatedMovement(
    MovementId movementId,
    EquipmentEventCode code,
    EventClassifierCode classifier,
    EquipmentReference equipmentReference,
    UnLocationCode location,
    Instant occurredAt,
    Instant receivedAt,
    EmptyIndicatorCode emptyIndicator,
    MovementSequence sequence,
    SourceIdentity source,
    CorrelationId correlationId,
    IdempotencyKey idempotencyKey,
    RequestFingerprint requestFingerprint) {}
```

Construction validates ACT-only input, sequence positivity, ISO 6346,
UN/LOCODE, UTC instants, and the LADEN/EMPTY rule before aggregate mutation.

## Application Use Cases

```java
public interface JourneyIntakeUseCase {
    JourneyIntakeResult consumeBookingConfirmed(BookingConfirmedEvent event);
}

public sealed interface JourneyIntakeResult
    permits JourneyOpened, JourneyReconciled, IntakeDuplicate, IntakeStale {}
```

Input: mapped, Schema-Registry-valid confirmation envelope. Output identifies
the canonical journey and disposition. Invalid/inactive references are explicit
permanent failures; transient Reference Data/Identity unavailability remains a
retryable consumer failure. The committed opened/reconciled result includes a
sequence-0 PLN LOAD status fact.

```java
public interface MovementCaptureUseCase {
    CaptureMovementResult capture(
        CaptureMovementCommand command,
        CaptureRequestContext context);
}

public record CaptureRequestContext(
    AuthenticatedSubject subject,
    CorrelationId correlationId,
    IdempotencyKey idempotencyKey,
    RequestFingerprint requestFingerprint,
    CaptureAttemptId attemptId) {}

public sealed interface CaptureMovementResult
    permits CaptureAccepted, CaptureRejected {}

public record CaptureAccepted(
    JourneyView journey,
    MovementView movement,
    PublicationState publicationState) implements CaptureMovementResult {}

public record CaptureRejected(
    MovementRejectionCode code,
    String reason,
    CorrelationId correlationId,
    JourneyLifecycle currentLifecycle,
    Optional<EquipmentEventCode> requiredNextCode,
    Optional<MovementEvidence> originalMovement) implements CaptureMovementResult {}
```

`capture` uses the explicit authenticated subject in `CaptureRequestContext`,
constructed by the REST adapter from verified session/request data, not a
body/query actor or thread-local. The application use case, not REST, invokes
`AuthorizationPort` and is the authoritative enforcement boundary. An accepted
result commits snapshot, movement ledger, request record, capture attempt,
audit, and outbox atomically. A rejected new request commits request disposition,
capture attempt, rejection, and audit; same/conflicting-key duplicates commit
attempt/rejection/audit only. Missing journey is 404; invalid fields 400; denial 403; expected duplicate/
sequence conflicts map to 409.

```java
public interface JourneyQueryUseCase {
    JourneyPage list(JourneyListQuery query, AuthenticatedSubject subject);
    Optional<JourneyDetailView> find(JourneyId id, AuthenticatedSubject subject);
    Optional<JourneyDetailView> findByBooking(
        BookingReference bookingReference,
        AuthenticatedSubject subject);
}
```

Reads require `container-movement:read`. DTOs include freshness/publication
metadata but exclude raw payloads from the primary surface.

## Persistence Ports

```java
public interface JourneyRepository {
    Optional<ContainerJourney> findById(JourneyId id);
    Optional<ContainerJourney> findByBookingReference(BookingReference booking);
    JourneyPage findPage(JourneyListCriteria criteria);
    void save(ContainerJourney journey, SnapshotVersion expectedVersion);
}

public interface MovementLedgerRepository {
    Optional<AcceptedMovement> findByOccurrence(
        JourneyId journeyId,
        EquipmentEventCode code,
        Instant occurredAt,
        UnLocationCode location);
    List<AcceptedMovement> findByJourney(JourneyId journeyId);
    void append(AcceptedMovement movement);
}

public interface CaptureRequestRepository {
    CaptureRequestClaim claim(
        IdempotencyKey key,
        RequestFingerprint fingerprint,
        CaptureAttemptId attemptId);
    void complete(
        CaptureRequestClaim.New claim,
        StoredCaptureDisposition disposition);
}

public sealed interface CaptureRequestClaim
    permits CaptureRequestClaim.New,
            CaptureRequestClaim.SameRequest,
            CaptureRequestClaim.ConflictingRequest {}

public interface CaptureAttemptRepository {
    void append(CaptureAttemptEvidence attempt);
}

public interface RejectionEvidenceRepository {
    void append(MovementRejectionEvidence evidence);
    List<MovementRejectionEvidence> recentFor(JourneyId journeyId, int limit);
}
```

`claim` is backed by a unique idempotency key plus row/insert-conflict
serialization. `New` evaluates the command once and stores its immutable
accepted/rejected disposition. `SameRequest` never re-evaluates and always
returns `DUPLICATE_MOVEMENT`; its evidence identifies whether the original was
accepted or rejected and retains the original code/evidence. `ConflictingRequest`
returns `DUPLICATE_MOVEMENT` with reason
`IDEMPOTENCY_KEY_REUSED`. Every branch appends attempt/audit evidence, but replay
never appends accepted history or outbox. A transaction rollback before
completion leaves no committed claim; a concurrent waiter observes the winner.

`save` uses optimistic version checking/row locking consistent with the selected
adapter; a concurrent stale write is retried or returned as a stable conflict,
never silently overwriting a stronger sequence. Append methods are insert-only
with database uniqueness backing domain idempotency.

```java
public interface OutboxRepository {
    void enqueue(MovementStatusEvent event);
    List<ClaimedMovementStatusEvent> claimBatch(
        int limit,
        String workerId,
        Instant now,
        Duration lease);
    void markPublished(OutboxClaim claim, Instant publishedAt);
    void markRetryable(OutboxClaim claim, String code, String message, Instant nextAttemptAt);
    void markFailedPermanently(OutboxClaim claim, String code, String message);
    Optional<EventPublicationStatusView> status(String eventId);
}

public record OutboxClaim(
    String eventId,
    String workerId,
    UUID claimToken,
    long claimVersion) {}
```

Canonical stored states are `PENDING`, `IN_PROGRESS`, `PUBLISHED`, `RETRYABLE`,
and `FAILED_PERMANENT`. Claim is atomic, lease-aware, and increments a fencing
version with a fresh token. Completion updates condition on event ID,
`IN_PROGRESS`, worker, token, and version; zero rows means a stale claim and
cannot overwrite a newer worker. Only committed rows are visible to the relay.

## Messaging Contracts

```java
public interface MovementStatusEventFactory {
    MovementStatusEvent plannedLoad(
        String eventId,
        ContainerJourney journey,
        ExpectedMovement load,
        CorrelationId correlationId,
        Instant emittedAt);

    MovementStatusEvent actualMovement(
        String eventId,
        ContainerJourney journey,
        AcceptedMovement movement,
        CorrelationId correlationId,
        Instant emittedAt);
}
```

`plannedLoad` writes PLN, sequence 0, LOAD@POL, Allocated. `actualMovement`
writes ACT and the accepted sequence 1-4, exact code, occurrence/received time,
derived lifecycle, empty indicator, and location. Both use type
`containermovement.status`, source `container-service`, schema version 1, and
the booking+container partition key.

```java
public interface MovementStatusPublisher {
    PublicationReceipt publish(MovementStatusEvent event);
}
```

Serialization/schema incompatibility is permanent; broker/timeouts are
retryable. The publisher never synthesizes a new business event identity.

```java
public interface MovementStatusProjectionRepository {
    boolean insertReceipt(MovementStatusReceivedEvent event, Instant consumedAt);
    ProjectionUpsertResult upsert(MovementStatusProjection projection);
    void markReceiptDisposition(String eventId, ConsumedEventDisposition disposition);
    Optional<MovementStatusProjection> findLatest(
        String bookingReference,
        String containerReference);
}
```

For positive sequence, higher sequence wins; equal sequence uses stable event
identity/dedupe and cannot regress. When both candidate/current are sequence 0,
the legacy occurrence, classifier rank, received time, and event ID comparator
remains active.

## Authorization Interfaces

```java
public interface AuthorizationPort {
    AuthorizationDecision evaluate(
        AuthenticatedSubject subject,
        String resource,
        String action,
        CorrelationId correlationId);
}
```

UI/API reads request resource/action `container-movement:read`; capture requests
`container-movement:capture-movement`. Unknown/blank subject and unavailable
non-local Identity evaluation return denied/unavailable and do not permit a
write. Consumer service actions use separately configured service subjects.

## REST Surface

```text
GET  /api/container-movement/journeys
GET  /api/container-movement/journeys/{journeyId}
GET  /api/container-movement/bookings/{bookingReference}/journey
POST /api/container-movement/journeys/{journeyId}/movements
```

Capture input carries code, ACT classifier, equipment reference, location,
occurred time, empty indicator, and idempotency/correlation headers. Capture
response returns 200/201 accepted, 400 validation, 403 denied, 404 missing, or
409 with stable duplicate/sequence payload. Existing manual `POST /journeys`
is not the normal event-created workflow and is not expanded.

## Frontend Interfaces

```typescript
export interface ContainerMovementApi {
  listJourneys(query: JourneyListQuery): Promise<JourneyPage>;
  getJourney(journeyId: string): Promise<JourneyDetail>;
  captureMovement(
    journeyId: string,
    input: CaptureMovementInput
  ): Promise<CaptureMovementResponse>;
}

export type CaptureMovementResponse =
  | { kind: "accepted"; journey: JourneyDetail; movement: ActualMovement; publication: "pending" | "published" }
  | {
      kind: "duplicate";
      code: "DUPLICATE_MOVEMENT";
      reasonCode: "MOVEMENT_ALREADY_ACCEPTED" | "REPLAY_OF_REJECTED_REQUEST" | "IDEMPOTENCY_KEY_REUSED";
      correlationId: string;
      originalMovement?: MovementEvidence;
      originalRejection?: RejectionEvidence;
      preservedInput: CaptureMovementInput;
    }
  | { kind: "out-of-sequence"; correlationId: string; requiredNextCode: EquipmentEventCode; preservedInput: CaptureMovementInput };
```

```typescript
export interface MovementCapturePanelProps {
  journey: JourneyIdentity;
  nextRequiredCode: EquipmentEventCode;
  captureEnabled: boolean;
  disabledReason?: string;
  onAccepted(result: CaptureAcceptedView): void;
}

export interface MovementTimelineProps {
  items: ReadonlyArray<ExpectedTimelineItem | ActualTimelineItem>;
  freshness: "fresh" | "last-known";
}
```

The panel owns temporary form/error/pending state locally and preserves entered
values for 400/403/409/retryable errors. Routed reads remain server components;
`loading.tsx`, `error.tsx`, and not-found/denied states use shared primitives.
No RTK or app-to-app import is introduced.

## Method-to-Acceptance Trace

| Interface | Acceptance focus |
|---|---|
| `JourneyIntakeUseCase` | AC-01, AC-10 |
| `MovementTransitionPolicy` / `capture` | AC-02, AC-03, AC-04, AC-08 |
| `MovementStatusEventFactory` / relay | AC-05 |
| projection repository | AC-06, AC-07 |
| query/frontend interfaces | AC-07, AC-09 |
| all persistence/messaging interfaces | AC-10, AC-11, AC-12 |

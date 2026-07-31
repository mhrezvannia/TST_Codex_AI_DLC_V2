package com.linercore.platform.chargeagreement.applicationservice;

import com.linercore.platform.chargeagreement.applicationservice.command.ChargeTermCommand;
import com.linercore.platform.chargeagreement.applicationservice.command.CreateAgreementCommand;
import com.linercore.platform.chargeagreement.applicationservice.command.UpdateAgreementCommand;
import com.linercore.platform.chargeagreement.applicationservice.port.AgreementEventPublisherPort;
import com.linercore.platform.chargeagreement.applicationservice.port.AgreementRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.AuthorizationPort;
import com.linercore.platform.chargeagreement.applicationservice.port.IdGenerator;
import com.linercore.platform.chargeagreement.applicationservice.port.LegacyPricingRequestRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.ManualPricingCaseRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.EventPublicationException;
import com.linercore.platform.chargeagreement.applicationservice.port.OutboxRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.PricingRequestStatus;
import com.linercore.platform.chargeagreement.applicationservice.port.ReferenceValidationPort;
import com.linercore.platform.chargeagreement.applicationservice.port.ReferenceValidationRequest;
import com.linercore.platform.chargeagreement.applicationservice.port.SchemaRegistryPort;
import com.linercore.platform.chargeagreement.applicationservice.port.StoredLegacyPricingRequest;
import com.linercore.platform.chargeagreement.applicationservice.query.ActiveAgreementLookupQuery;
import com.linercore.platform.chargeagreement.applicationservice.query.ActiveAgreementLookupResult;
import com.linercore.platform.chargeagreement.applicationservice.query.AgreementSearchQuery;
import com.linercore.platform.chargeagreement.applicationservice.query.OutboxStatusQuery;
import com.linercore.platform.chargeagreement.applicationservice.query.PublishBatchResult;
import com.linercore.platform.chargeagreement.domain.model.AgreementId;
import com.linercore.platform.chargeagreement.domain.model.AgreementNumber;
import com.linercore.platform.chargeagreement.domain.model.ChargeTerm;
import com.linercore.platform.chargeagreement.domain.model.CustomerAgreement;
import com.linercore.platform.chargeagreement.domain.model.MoneyAmount;
import com.linercore.platform.chargeagreement.domain.model.ManualPricingCase;
import com.linercore.platform.chargeagreement.domain.model.LegacyPricingOutcome;
import com.linercore.platform.chargeagreement.domain.model.PricingLine;
import com.linercore.platform.chargeagreement.domain.model.PricingRequest;
import com.linercore.platform.chargeagreement.domain.model.PricingResult;
import com.linercore.platform.chargeagreement.domain.model.ReferenceId;
import com.linercore.platform.chargeagreement.domain.model.ValidityWindow;
import com.linercore.platform.chargeagreement.domain.outbox.AgreementOutboxEvent;
import com.linercore.platform.chargeagreement.domain.outbox.BrokerMetadata;
import com.linercore.platform.chargeagreement.domain.outbox.EventPublicationStatusView;
import com.linercore.platform.chargeagreement.domain.outbox.OutboxStatus;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import org.springframework.transaction.annotation.Transactional;

public class ChargeAgreementApplicationService {
    private final AgreementRepository agreements;
    private final AuthorizationPort authorization;
    private final ReferenceValidationPort referenceValidation;
    private final IdGenerator ids;
    private final Clock clock;
    private final AgreementEventPublisherPort eventPublisher;
    private final OutboxRepository outbox;
    private final SchemaRegistryPort schemaRegistry;
    private final ManualPricingCaseRepository manualPricingCases;
    private final LegacyPricingRequestRepository pricingRequests;

    public ChargeAgreementApplicationService(
            AgreementRepository agreements,
            AuthorizationPort authorization,
            ReferenceValidationPort referenceValidation,
            IdGenerator ids,
            Clock clock) {
        this(agreements, authorization, referenceValidation, ids, clock, null, null, null, null, null);
    }

    public ChargeAgreementApplicationService(
            AgreementRepository agreements,
            AuthorizationPort authorization,
            ReferenceValidationPort referenceValidation,
            IdGenerator ids,
            Clock clock,
            AgreementEventPublisherPort eventPublisher) {
        this(agreements, authorization, referenceValidation, ids, clock, null, eventPublisher, null, null, null);
    }

    public ChargeAgreementApplicationService(
            AgreementRepository agreements,
            AuthorizationPort authorization,
            ReferenceValidationPort referenceValidation,
            IdGenerator ids,
            Clock clock,
            AgreementEventPublisherPort eventPublisher,
            ManualPricingCaseRepository manualPricingCases) {
        this(agreements, authorization, referenceValidation, ids, clock, null, eventPublisher, null,
                manualPricingCases, null);
    }

    public ChargeAgreementApplicationService(
            AgreementRepository agreements,
            AuthorizationPort authorization,
            ReferenceValidationPort referenceValidation,
            IdGenerator ids,
            Clock clock,
            OutboxRepository outbox,
            AgreementEventPublisherPort eventPublisher,
            SchemaRegistryPort schemaRegistry,
            ManualPricingCaseRepository manualPricingCases) {
        this(agreements, authorization, referenceValidation, ids, clock, outbox, eventPublisher, schemaRegistry,
                manualPricingCases, null);
    }

    public ChargeAgreementApplicationService(
            AgreementRepository agreements,
            AuthorizationPort authorization,
            ReferenceValidationPort referenceValidation,
            IdGenerator ids,
            Clock clock,
            OutboxRepository outbox,
            AgreementEventPublisherPort eventPublisher,
            SchemaRegistryPort schemaRegistry,
            ManualPricingCaseRepository manualPricingCases,
            LegacyPricingRequestRepository pricingRequests) {
        this.agreements = agreements;
        this.authorization = authorization;
        this.referenceValidation = referenceValidation;
        this.ids = ids;
        this.clock = clock;
        this.eventPublisher = eventPublisher;
        this.outbox = outbox;
        this.schemaRegistry = schemaRegistry;
        this.manualPricingCases = manualPricingCases;
        this.pricingRequests = pricingRequests;
    }

    @Transactional
    public CustomerAgreement create(CreateAgreementCommand command) {
        requireAllowed(command.actorSubjectId(), "manage", command.correlationId());
        validateReferences(command.customerId(), command.tradeLaneId(), command.commodityId());
        CustomerAgreement agreement = CustomerAgreement.create(
                new AgreementId(ids.nextId()),
                new AgreementNumber(command.agreementNumber()),
                new ReferenceId(command.customerId()),
                new ReferenceId(command.tradeLaneId()),
                new ReferenceId(command.commodityId()),
                new ValidityWindow(command.validFrom(), command.validTo()),
                command.actorSubjectId(),
                now(),
                command.reason());
        CustomerAgreement saved = agreements.save(agreement);
        enqueueEvent("charge-agreement.created", saved, command.correlationId());
        return saved;
    }

    @Transactional
    public CustomerAgreement update(AgreementId id, long expectedVersion, UpdateAgreementCommand command) {
        requireAllowed(command.actorSubjectId(), "manage", command.correlationId());
        CustomerAgreement existing = detailForMutation(id);
        requireVersion(existing, expectedVersion);
        validateReferences(command);
        CustomerAgreement updated = existing
                .updateHeader(
                        new AgreementNumber(command.agreementNumber()),
                        new ReferenceId(command.customerId()),
                        new ReferenceId(command.tradeLaneId()),
                        new ReferenceId(command.commodityId()),
                        new ValidityWindow(command.validFrom(), command.validTo()),
                        command.actorSubjectId(),
                        now(),
                        command.reason())
                .replaceTerms(toTerms(command.terms()), command.actorSubjectId(), now(), command.reason());
        CustomerAgreement saved = agreements.save(updated);
        enqueueEvent("charge-agreement.updated", saved, command.correlationId());
        return saved;
    }

    @Transactional
    public CustomerAgreement approve(AgreementId id, long expectedVersion, String actorSubjectId, String reason, String correlationId) {
        requireAllowed(actorSubjectId, "approve", correlationId);
        CustomerAgreement existing = detailForMutation(id);
        requireVersion(existing, expectedVersion);
        CustomerAgreement saved = agreements.save(existing.approve(actorSubjectId, now(), reason));
        enqueueEvent("charge-agreement.approved", saved, correlationId);
        return saved;
    }

    @Transactional
    public CustomerAgreement suspend(AgreementId id, long expectedVersion, String actorSubjectId, String reason, String correlationId) {
        requireAllowed(actorSubjectId, "status", correlationId);
        CustomerAgreement existing = detailForMutation(id);
        requireVersion(existing, expectedVersion);
        CustomerAgreement saved = agreements.save(existing.suspend(actorSubjectId, now(), reason));
        enqueueEvent("charge-agreement.suspended", saved, correlationId);
        return saved;
    }

    @Transactional
    public CustomerAgreement expire(AgreementId id, long expectedVersion, String actorSubjectId, String reason, String correlationId) {
        requireAllowed(actorSubjectId, "status", correlationId);
        CustomerAgreement existing = detailForMutation(id);
        requireVersion(existing, expectedVersion);
        CustomerAgreement saved = agreements.save(existing.expire(actorSubjectId, now(), reason));
        enqueueEvent("charge-agreement.expired", saved, correlationId);
        return saved;
    }

    public List<CustomerAgreement> search(AgreementSearchQuery query) {
        requireAllowed(query.actorSubjectId(), "read", query.correlationId());
        return agreements.search(query);
    }

    public CustomerAgreement detail(AgreementId id, String actorSubjectId, String correlationId) {
        requireAllowed(actorSubjectId, "read", correlationId);
        return detailForMutation(id);
    }

    public ActiveAgreementLookupResult activeLookup(ActiveAgreementLookupQuery query) {
        if (query.customerId() == null || query.customerId().isBlank()) {
            throw new IllegalArgumentException("customer id is required");
        }
        if (query.effectiveDate() == null) {
            throw new IllegalArgumentException("effective date is required");
        }
        requireAllowed(query.actorSubjectId(), "read", query.correlationId());
        ReferenceId customerId = new ReferenceId(query.customerId());
        return agreements.findActiveCandidates(customerId, query.effectiveDate()).stream()
                .filter(agreement -> agreement.isActiveOn(query.effectiveDate()))
                .filter(agreement -> agreement.customerId().equals(customerId))
                .filter(agreement -> query.tradeLaneId() == null || agreement.tradeLaneId().value().equals(query.tradeLaneId()))
                .filter(agreement -> query.commodityId() == null || agreement.commodityId().value().equals(query.commodityId()))
                .max(Comparator.comparingInt(agreement -> specificity(agreement, query)))
                .map(agreement -> new ActiveAgreementLookupResult(true, agreement.id(), agreement.terms()))
                .orElseGet(ActiveAgreementLookupResult::noMatch);
    }

    public LegacyPricingOutcome price(PricingRequest request, String actorSubjectId) {
        requireAllowed(actorSubjectId, "price", request.correlationId());
        List<CustomerAgreement> candidates = agreements.findActiveCandidates(request.customerId(), request.effectiveDate()).stream()
                .filter(agreement -> agreement.isActiveOn(request.effectiveDate()))
                .filter(agreement -> agreement.customerId().equals(request.customerId()))
                .filter(agreement -> agreement.tradeLaneId().equals(request.tradeLaneId()))
                .filter(agreement -> agreement.commodityId().equals(request.commodityId()))
                .toList();
        if (candidates.isEmpty()) {
            LegacyPricingOutcome.Manual manual = new LegacyPricingOutcome.Manual(
                    request.requestId(), "NO_RATE", request.correlationId());
            recordManualPricingCase(request, manual.reasonCode());
            return manual;
        }
        int highestSpecificity = candidates.stream()
                .mapToInt(agreement -> specificity(agreement, new ActiveAgreementLookupQuery(
                        request.customerId().value(), request.tradeLaneId().value(), request.pol(), request.pod(),
                        request.commodityId().value(), request.effectiveDate(), actorSubjectId,
                        request.correlationId())))
                .max()
                .orElse(0);
        List<CustomerAgreement> highest = candidates.stream()
                .filter(agreement -> specificity(agreement, new ActiveAgreementLookupQuery(
                        request.customerId().value(), request.tradeLaneId().value(), request.pol(), request.pod(),
                        request.commodityId().value(), request.effectiveDate(), actorSubjectId,
                        request.correlationId())) == highestSpecificity)
                .toList();
        if (highest.size() > 1) {
            LegacyPricingOutcome.Manual manual = new LegacyPricingOutcome.Manual(
                    request.requestId(), "AMBIGUOUS_ACTIVE_AGREEMENT", request.correlationId());
            recordManualPricingCase(request, manual.reasonCode());
            return manual;
        }
        CustomerAgreement authority = highest.get(0);
        List<PricingLine> lines = authority.terms().stream()
                .filter(term -> term.validity().contains(request.effectiveDate()))
                .map(term -> toPricingLine(term, request))
                .toList();
        if (lines.isEmpty()) {
            LegacyPricingOutcome.Manual manual = new LegacyPricingOutcome.Manual(
                    request.requestId(), "NO_APPLICABLE_TERMS", request.correlationId());
            recordManualPricingCase(request, manual.reasonCode());
            return manual;
        }
        return new LegacyPricingOutcome.Automatic(
                PricingResult.priced(request.requestId(), authority.id(), lines, request.correlationId()));
    }

    public LegacyPricingOutcome requestPricing(PricingRequest request, String idempotencyKey, String actorSubjectId) {
        String expectedKey = request.bookingRef() + ":" + request.quantities().amendmentSeq();
        if (!expectedKey.equals(idempotencyKey)) {
            throw new IllegalArgumentException("Idempotency-Key must equal bookingRef:amendmentSeq");
        }
        if (pricingRequests == null) {
            return price(request, actorSubjectId);
        }
        String requestHash = requestHash(request);
        StoredLegacyPricingRequest existing = pricingRequests.findByIdempotencyKey(idempotencyKey).orElse(null);
        if (existing != null) {
            if (!existing.requestHash().equals(requestHash)) {
                throw new PricingConflictException("IDEMPOTENCY_CONFLICT",
                        "idempotency key was used for another pricing request");
            }
            if (existing.status() == PricingRequestStatus.IN_PROGRESS && existing.leaseUntil().isAfter(now())) {
                throw new PricingRequestInProgressException(Duration.between(now(), existing.leaseUntil()));
            }
            if (existing.outcome() != null) {
                return existing.outcome();
            }
            String ownerToken = ids.nextId();
            Instant leaseUntil = now().plus(Duration.ofSeconds(10));
            if (!pricingRequests.takeOverExpiredClaim(idempotencyKey, ownerToken, leaseUntil, now())) {
                throw new PricingRequestInProgressException(Duration.ofSeconds(1));
            }
            LegacyPricingOutcome outcome = price(request, actorSubjectId);
            if (!pricingRequests.completeOwned(
                    idempotencyKey, ownerToken, outcome, terminalCode(outcome), now())) {
                StoredLegacyPricingRequest winner =
                        pricingRequests.findByIdempotencyKey(idempotencyKey).orElseThrow();
                if (winner.outcome() != null) {
                    return winner.outcome();
                }
                throw new PricingRequestInProgressException(Duration.ofSeconds(1));
            }
            return outcome;
        }
        Instant startedAt = now();
        String ownerToken = ids.nextId();
        StoredLegacyPricingRequest claim = new StoredLegacyPricingRequest(
                idempotencyKey,
                request.bookingRef(),
                request.quantities().amendmentSeq(),
                requestHash,
                PricingRequestStatus.IN_PROGRESS,
                ownerToken,
                startedAt.plus(Duration.ofSeconds(10)),
                null,
                null,
                request.correlationId(),
                startedAt,
                null);
        if (!pricingRequests.insertClaim(claim)) {
            throw new PricingRequestInProgressException(Duration.ofSeconds(1));
        }
        LegacyPricingOutcome outcome = price(request, actorSubjectId);
        if (!pricingRequests.completeOwned(
                idempotencyKey, ownerToken, outcome, terminalCode(outcome), now())) {
            StoredLegacyPricingRequest winner =
                    pricingRequests.findByIdempotencyKey(idempotencyKey).orElseThrow();
            if (winner.outcome() != null) {
                return winner.outcome();
            }
            throw new PricingRequestInProgressException(Duration.ofSeconds(1));
        }
        return outcome;
    }

    private static String terminalCode(LegacyPricingOutcome outcome) {
        return outcome instanceof LegacyPricingOutcome.Manual manual ? manual.reasonCode() : "PRICED";
    }

    @Transactional
    public PublishBatchResult publishOutboxBatch(String workerId, int batchSize) {
        requireMessaging();
        if (workerId == null || workerId.isBlank()) {
            throw new IllegalArgumentException("worker id is required");
        }
        List<AgreementOutboxEvent> claimed = outbox.claimAvailable(
                workerId, now(), Math.max(1, Math.min(batchSize, 100)));
        int published = 0;
        int retryable = 0;
        int permanent = 0;
        for (AgreementOutboxEvent event : claimed) {
            try {
                schemaRegistry.ensureRegistered(event.eventType(), event.schemaVersion());
                BrokerMetadata metadata = eventPublisher.publish(event);
                outbox.save(event.published(metadata));
                published++;
            } catch (EventPublicationException ex) {
                outbox.save(ex.retryable()
                        ? event.retryable(ex.code(), ex.getMessage(), now().plus(Duration.ofMinutes(5)))
                        : event.failedPermanent(ex.code(), ex.getMessage()));
                if (ex.retryable()) {
                    retryable++;
                } else {
                    permanent++;
                }
            } catch (RuntimeException ex) {
                outbox.save(event.retryable("PUBLISHER_UNAVAILABLE", ex.getMessage(),
                        now().plus(Duration.ofMinutes(5))));
                retryable++;
            }
        }
        return new PublishBatchResult(claimed.size(), published, retryable, permanent);
    }

    public List<EventPublicationStatusView> outboxStatuses(OutboxStatusQuery query) {
        if (outbox == null) {
            throw new IllegalStateException("outbox repository is not configured");
        }
        return outbox.findStatuses(query);
    }

    private CustomerAgreement detailForMutation(AgreementId id) {
        return agreements.findById(id).orElseThrow();
    }

    private void requireVersion(CustomerAgreement agreement, long expectedVersion) {
        if (agreement.version() != expectedVersion) {
            throw new IllegalStateException("stale agreement version");
        }
    }

    private void validateReferences(UpdateAgreementCommand command) {
        ArrayList<String> refs = new ArrayList<>();
        refs.add(command.customerId());
        refs.add(command.tradeLaneId());
        refs.add(command.commodityId());
        for (ChargeTermCommand term : command.terms()) {
            refs.add(term.chargeCodeId());
            refs.add(term.currencyId());
        }
        validateReferences(refs.toArray(String[]::new));
    }

    private void validateReferences(String... referenceIds) {
        List<String> errors = referenceValidation.validate(new ReferenceValidationRequest(Arrays.stream(referenceIds).toList()));
        if (!errors.isEmpty()) {
            throw new IllegalArgumentException(String.join(",", errors));
        }
    }

    private List<ChargeTerm> toTerms(List<ChargeTermCommand> commands) {
        return commands.stream()
                .map(command -> new ChargeTerm(
                        command.id(),
                        new ReferenceId(command.chargeCodeId()),
                        command.basis(),
                        new MoneyAmount(command.amount(), new ReferenceId(command.currencyId())),
                        new ValidityWindow(command.validFrom(), command.validTo()),
                        command.notes()))
                .toList();
    }

    private int specificity(CustomerAgreement agreement, ActiveAgreementLookupQuery query) {
        int score = 0;
        if (query.tradeLaneId() != null && agreement.tradeLaneId().value().equals(query.tradeLaneId())) {
            score += 2;
        }
        if (query.commodityId() != null && agreement.commodityId().value().equals(query.commodityId())) {
            score += 1;
        }
        return score;
    }

    private PricingLine toPricingLine(ChargeTerm term, PricingRequest request) {
        int quantity = request.quantityFor(term.basis());
        BigDecimal amount = term.amount().amount().multiply(BigDecimal.valueOf(quantity));
        return new PricingLine(term.id(), term.chargeCodeId(), term.category(), term.basis(), quantity, term.amount(),
                new MoneyAmount(amount, term.amount().currencyId()));
    }

    private String requestHash(PricingRequest request) {
        String material = String.join("|",
                request.bookingRef(),
                request.tradeLane(),
                request.pol(),
                request.pod(),
                request.equipmentType(),
                request.partyId(),
                request.commodityCode(),
                Boolean.toString(request.reeferIndicator()),
                Boolean.toString(request.dgIndicator()),
                request.dates().effectiveDate().toString(),
                request.dates().requestedDepartureDate().toString(),
                Integer.toString(request.quantities().equipmentQuantity()),
                Integer.toString(request.quantities().teu()),
                Integer.toString(request.quantities().amendmentSeq()));
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(material.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    private void recordManualPricingCase(PricingRequest request, String reasonCode) {
        if (manualPricingCases == null) {
            return;
        }
        manualPricingCases.save(new ManualPricingCase(ids.nextId(), request.requestId(), reasonCode,
                request.correlationId(), now()));
    }

    private void requireAllowed(String subjectId, String action, String correlationId) {
        if (!authorization.allowed(subjectId, "charge-agreement", action, correlationId)) {
            throw new SecurityException("charge agreement access denied");
        }
    }

    private void enqueueEvent(String eventType, CustomerAgreement agreement, String correlationId) {
        if (outbox == null) {
            return;
        }
        String eventId = ids.nextId();
        String deduplicationKey = agreement.id().value() + ":" + agreement.version() + ":" + eventType;
        Instant occurredAt = now();
        Map<String, String> payload = Map.of(
                "eventId", eventId,
                "eventType", eventType,
                "schemaVersion", "1.0.0",
                "source", "charge-agreement-service",
                "occurredAt", occurredAt.toString(),
                "correlationId", correlationId,
                "idempotencyKey", deduplicationKey,
                "agreementId", agreement.id().value(),
                "agreementStatus", agreement.status().name(),
                "agreementVersion", String.valueOf(agreement.version()));
        outbox.enqueue(new AgreementOutboxEvent(eventId, eventType, "1.0.0", agreement.id().value(),
                agreement.status().name(), agreement.version(), eventType + "-value",
                "charge-agreement-service", deduplicationKey, correlationId, occurredAt, payload,
                OutboxStatus.PENDING, 0, null, null, null, null, null));
    }

    private Instant now() {
        return Instant.now(clock);
    }

    private void requireMessaging() {
        if (outbox == null) {
            throw new IllegalStateException("outbox repository is not configured");
        }
        if (eventPublisher == null || schemaRegistry == null) {
            throw new IllegalStateException("event publisher is not configured");
        }
    }
}

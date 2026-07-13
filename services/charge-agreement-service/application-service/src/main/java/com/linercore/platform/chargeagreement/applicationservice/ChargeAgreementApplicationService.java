package com.linercore.platform.chargeagreement.applicationservice;

import com.linercore.platform.chargeagreement.applicationservice.command.ChargeTermCommand;
import com.linercore.platform.chargeagreement.applicationservice.command.CreateAgreementCommand;
import com.linercore.platform.chargeagreement.applicationservice.command.UpdateAgreementCommand;
import com.linercore.platform.chargeagreement.applicationservice.port.AgreementEventPublisherPort;
import com.linercore.platform.chargeagreement.applicationservice.port.AgreementRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.AuthorizationPort;
import com.linercore.platform.chargeagreement.applicationservice.port.IdGenerator;
import com.linercore.platform.chargeagreement.applicationservice.port.ManualPricingCaseRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.EventPublicationException;
import com.linercore.platform.chargeagreement.applicationservice.port.OutboxRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.ReferenceValidationPort;
import com.linercore.platform.chargeagreement.applicationservice.port.ReferenceValidationRequest;
import com.linercore.platform.chargeagreement.applicationservice.port.SchemaRegistryPort;
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
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
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

    public ChargeAgreementApplicationService(
            AgreementRepository agreements,
            AuthorizationPort authorization,
            ReferenceValidationPort referenceValidation,
            IdGenerator ids,
            Clock clock) {
        this(agreements, authorization, referenceValidation, ids, clock, null, null, null, null);
    }

    public ChargeAgreementApplicationService(
            AgreementRepository agreements,
            AuthorizationPort authorization,
            ReferenceValidationPort referenceValidation,
            IdGenerator ids,
            Clock clock,
            AgreementEventPublisherPort eventPublisher) {
        this(agreements, authorization, referenceValidation, ids, clock, null, eventPublisher, null, null);
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
                manualPricingCases);
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
        this.agreements = agreements;
        this.authorization = authorization;
        this.referenceValidation = referenceValidation;
        this.ids = ids;
        this.clock = clock;
        this.eventPublisher = eventPublisher;
        this.outbox = outbox;
        this.schemaRegistry = schemaRegistry;
        this.manualPricingCases = manualPricingCases;
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

    public PricingResult price(PricingRequest request, String actorSubjectId) {
        requireAllowed(actorSubjectId, "price", request.correlationId());
        ActiveAgreementLookupResult lookup = activeLookup(new ActiveAgreementLookupQuery(
                request.customerId().value(),
                request.tradeLaneId().value(),
                null,
                null,
                request.commodityId().value(),
                request.effectiveDate(),
                actorSubjectId,
                request.correlationId()));
        if (!lookup.matched()) {
            PricingResult manual = PricingResult.manual(request.requestId(), "NO_ACTIVE_AGREEMENT", request.correlationId());
            recordManualPricingCase(request, manual.reasonCode());
            return manual;
        }
        List<PricingLine> lines = lookup.terms().stream()
                .filter(term -> term.validity().contains(request.effectiveDate()))
                .map(term -> toPricingLine(term, request))
                .toList();
        if (lines.isEmpty()) {
            PricingResult manual = PricingResult.manual(request.requestId(), "NO_APPLICABLE_TERMS", request.correlationId());
            recordManualPricingCase(request, manual.reasonCode());
            return manual;
        }
        return PricingResult.priced(request.requestId(), lookup.agreementId(), lines, request.correlationId());
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
        int quantity = request.quantities().getOrDefault(term.basis(), 1);
        BigDecimal amount = term.amount().amount().multiply(BigDecimal.valueOf(quantity));
        return new PricingLine(term.id(), term.chargeCodeId(), term.basis(), quantity, term.amount(),
                new MoneyAmount(amount, term.amount().currencyId()));
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

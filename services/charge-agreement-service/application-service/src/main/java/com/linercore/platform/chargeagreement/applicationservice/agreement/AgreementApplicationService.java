package com.linercore.platform.chargeagreement.applicationservice.agreement;

import com.linercore.platform.chargeagreement.applicationservice.port.AgreementAdminReadRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.AgreementAuthorizationPort;
import com.linercore.platform.chargeagreement.applicationservice.port.AgreementRateVersionPort;
import com.linercore.platform.chargeagreement.applicationservice.port.AgreementReferenceValidationPort;
import com.linercore.platform.chargeagreement.applicationservice.port.AgreementRepositoryException;
import com.linercore.platform.chargeagreement.applicationservice.port.IdGenerator;
import com.linercore.platform.chargeagreement.applicationservice.port.OutboxRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.W2AgreementRepository;
import com.linercore.platform.chargeagreement.domain.agreement.Agreement;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementActivity;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementActivityAction;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementAuthorityModel;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementId;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementLifecycle;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementNumber;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementRateLink;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementValidity;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementVersion;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementVersionId;
import com.linercore.platform.chargeagreement.domain.model.ReferenceId;
import com.linercore.platform.chargeagreement.domain.outbox.AgreementOutboxEvent;
import com.linercore.platform.chargeagreement.domain.outbox.OutboxStatus;
import com.linercore.platform.chargeagreement.domain.rate.RateCategory;
import com.linercore.platform.chargeagreement.domain.rate.RateLifecycle;
import com.linercore.platform.chargeagreement.domain.rate.RateVersionId;
import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

public class AgreementApplicationService {
    private static final String RESOURCE = "charge-agreements";

    private final W2AgreementRepository agreements;
    private final AgreementAdminReadRepository reads;
    private final AgreementAuthorizationPort authorization;
    private final AgreementReferenceValidationPort references;
    private final AgreementRateVersionPort rateVersions;
    private final OutboxRepository outbox;
    private final IdGenerator ids;
    private final Clock clock;

    public AgreementApplicationService(
            W2AgreementRepository agreements,
            AgreementAdminReadRepository reads,
            AgreementAuthorizationPort authorization,
            AgreementReferenceValidationPort references,
            AgreementRateVersionPort rateVersions,
            OutboxRepository outbox,
            IdGenerator ids,
            Clock clock) {
        this.agreements = Objects.requireNonNull(agreements);
        this.reads = Objects.requireNonNull(reads);
        this.authorization = Objects.requireNonNull(authorization);
        this.references = Objects.requireNonNull(references);
        this.rateVersions = Objects.requireNonNull(rateVersions);
        this.outbox = Objects.requireNonNull(outbox);
        this.ids = Objects.requireNonNull(ids);
        this.clock = Objects.requireNonNull(clock);
    }

    @Transactional
    public AgreementViews.Detail create(AgreementCommands.Create command) {
        requireAuthorized(command.subjectId(), "create", command.correlationId());
        AgreementCommands.Commercial commercial = requireCommercial(command.commercial());
        validateReferences(commercial, command.correlationId());
        List<AgreementRateLink> links = validateRateLinks(commercial);
        try {
            Instant at = clock.instant();
            Agreement agreement = Agreement.firstDraft(
                    new AgreementId(ids.nextId()), new AgreementNumber(command.agreementNumber()),
                    new AgreementVersionId(ids.nextId()), ref(commercial.customerId()),
                    ref(commercial.tradeLaneId()), ref(commercial.originLocationId()),
                    ref(commercial.destinationLocationId()), ref(commercial.equipmentTypeId()),
                    validity(commercial), links, command.subjectId(), at, command.correlationId());
            AgreementVersion version = agreement.latestVersion();
            agreements.create(agreement, activity(agreement, version, AgreementActivityAction.CREATED,
                    command.subjectId(), at, command.correlationId(), command.reason()));
            outbox.enqueue(event(agreement, version, AgreementActivityAction.CREATED, at, command.correlationId()));
            return detailView(agreement, version.id().value(), capabilities(command.subjectId(), command.correlationId()));
        } catch (AgreementRepositoryException exception) {
            throw repositoryFailure(exception);
        } catch (IllegalArgumentException exception) {
            throw semantic(exception);
        }
    }

    @Transactional
    public AgreementViews.Detail updateDraft(AgreementCommands.UpdateDraft command) {
        requireAuthorized(command.subjectId(), "update", command.correlationId());
        requireReason(command.reason());
        Agreement stable = requireW2Agreement(command.agreementId());
        AgreementVersion current = requireVersion(stable, command.agreementVersionId());
        AgreementCommands.Commercial commercial = requireCommercial(command.commercial());
        validateReferences(commercial, command.correlationId());
        List<AgreementRateLink> links = validateRateLinks(commercial);
        try {
            Instant at = clock.instant();
            AgreementVersion revised = current.reviseDraft(
                    ref(commercial.customerId()), ref(commercial.tradeLaneId()),
                    ref(commercial.originLocationId()), ref(commercial.destinationLocationId()),
                    ref(commercial.equipmentTypeId()), validity(commercial), links,
                    command.expectedRowVersion(), command.subjectId(), at, command.correlationId());
            Agreement persisted = agreements.updateDraft(stable, revised,
                    activity(stable, revised, AgreementActivityAction.DRAFT_UPDATED,
                            command.subjectId(), at, command.correlationId(), command.reason()));
            outbox.enqueue(event(persisted, revised, AgreementActivityAction.DRAFT_UPDATED,
                    at, command.correlationId()));
            return detailView(persisted, revised.id().value(), capabilities(command.subjectId(), command.correlationId()));
        } catch (AgreementRepositoryException exception) {
            throw repositoryFailure(exception);
        } catch (IllegalStateException exception) {
            throw conflictOrLifecycle(exception);
        } catch (IllegalArgumentException exception) {
            throw semantic(exception);
        }
    }

    @Transactional
    public AgreementViews.Detail createSuccessor(AgreementCommands.CreateSuccessor command) {
        requireAuthorized(command.subjectId(), "create-successor", command.correlationId());
        requireReason(command.reason());
        Agreement stable = requireW2Agreement(command.agreementId());
        AgreementVersion source = requireVersion(stable, command.sourceAgreementVersionId());
        if (stable.draft() != null) {
            throw new AgreementApplicationException(409, "AGREEMENT_DRAFT_EXISTS",
                    "A Draft already exists for this Agreement");
        }
        if (source.lifecycle() != AgreementLifecycle.APPROVED) {
            throw new AgreementApplicationException(422, "AGREEMENT_SUCCESSOR_SOURCE_INVALID",
                    "Only an Approved W2 version may seed a successor");
        }
        AgreementCommands.Commercial commercial = requireCommercial(command.commercial());
        validateReferences(commercial, command.correlationId());
        List<AgreementRateLink> links = validateRateLinks(commercial);
        try {
            Instant at = clock.instant();
            long nextVersion = stable.versions().stream()
                    .mapToLong(AgreementVersion::versionNo).max().orElseThrow() + 1;
            AgreementVersion successor = new AgreementVersion(
                    new AgreementVersionId(ids.nextId()), stable.id(), nextVersion,
                    AgreementAuthorityModel.W2_VERSIONED, AgreementLifecycle.DRAFT,
                    ref(commercial.customerId()), ref(commercial.tradeLaneId()),
                    ref(commercial.originLocationId()), ref(commercial.destinationLocationId()),
                    ref(commercial.equipmentTypeId()), null, validity(commercial), links,
                    0, source.id(), command.subjectId(), at, null, null, null, null,
                    command.correlationId());
            Agreement persisted = agreements.createSuccessor(stable, source, successor,
                    activity(stable, successor, AgreementActivityAction.SUCCESSOR_CREATED,
                            command.subjectId(), at, command.correlationId(), command.reason()));
            outbox.enqueue(event(persisted, successor, AgreementActivityAction.SUCCESSOR_CREATED,
                    at, command.correlationId()));
            return detailView(persisted, successor.id().value(), capabilities(command.subjectId(), command.correlationId()));
        } catch (AgreementRepositoryException exception) {
            throw repositoryFailure(exception);
        } catch (IllegalArgumentException exception) {
            throw semantic(exception);
        }
    }

    @Transactional
    public AgreementViews.Detail approve(AgreementCommands.Approve command) {
        requireAuthorized(command.subjectId(), "approve", command.correlationId());
        requireReason(command.reason());
        Agreement stable = requireW2Agreement(command.agreementId());
        AgreementVersion draft = requireVersion(stable, command.agreementVersionId());
        try {
            Instant at = clock.instant();
            Agreement persisted = agreements.approveUnderLock(
                    stable, draft, command.expectedRowVersion(),
                    locked -> validateLockedAuthority(locked, command.correlationId()),
                    command.subjectId(), at, command.correlationId(), ids.nextId(), command.reason());
            AgreementVersion approved = requireVersion(persisted, command.agreementVersionId());
            outbox.enqueue(event(persisted, approved, AgreementActivityAction.APPROVED,
                    at, command.correlationId()));
            return detailView(persisted, approved.id().value(), capabilities(command.subjectId(), command.correlationId()));
        } catch (AgreementRepositoryException exception) {
            throw repositoryFailure(exception);
        } catch (IllegalStateException exception) {
            throw conflictOrLifecycle(exception);
        }
    }

    @Transactional
    public AgreementViews.Detail suspend(AgreementCommands.Transition command) {
        return transition(command, AgreementLifecycle.SUSPENDED, AgreementActivityAction.SUSPENDED, "suspend");
    }

    @Transactional
    public AgreementViews.Detail expire(AgreementCommands.Transition command) {
        return transition(command, AgreementLifecycle.EXPIRED, AgreementActivityAction.EXPIRED, "expire");
    }

    public AgreementViews.Detail detail(
            String agreementId,
            String selectedVersionId,
            String subjectId,
            String correlationId) {
        requireAuthorized(subjectId, "read", correlationId);
        Agreement stable = requireAgreement(agreementId);
        if (selectedVersionId != null) {
            requireVersion(stable, selectedVersionId);
        }
        return detailView(stable, selectedVersionId, capabilities(subjectId, correlationId));
    }

    public AgreementViews.Page search(AgreementSearchQuery query) {
        requireAuthorized(query.subjectId(), "read", query.correlationId());
        AgreementViews.Capabilities capabilities = capabilities(query.subjectId(), query.correlationId());
        long offset = (long) query.page() * query.size();
        AgreementAdminReadRepository.SearchPage result = reads.search(new AgreementAdminReadRepository.SearchCriteria(
                query.customerId(), query.tradeLaneId(), query.lifecycle(), query.validOn(), offset, query.size()));
        List<AgreementViews.ListItem> items = result.items().stream()
                .map(value -> listItem(value, query, capabilities))
                .toList();
        return new AgreementViews.Page(items, query.page(), query.size(), result.total(),
                offset + items.size() < result.total(), capabilities.canCreate());
    }

    private AgreementViews.Detail transition(
            AgreementCommands.Transition command,
            AgreementLifecycle target,
            AgreementActivityAction action,
            String authorizationAction) {
        requireAuthorized(command.subjectId(), authorizationAction, command.correlationId());
        requireReason(command.reason());
        Agreement stable = requireW2Agreement(command.agreementId());
        AgreementVersion current = requireVersion(stable, command.agreementVersionId());
        try {
            Instant at = clock.instant();
            AgreementVersion transitioned = target == AgreementLifecycle.SUSPENDED
                    ? current.suspend(command.expectedRowVersion(), command.subjectId(), at, command.correlationId())
                    : current.expire(command.expectedRowVersion(), command.subjectId(), at, command.correlationId());
            Agreement persisted = agreements.transitionLifecycle(stable, transitioned,
                    activity(stable, transitioned, action, command.subjectId(), at,
                            command.correlationId(), command.reason()));
            outbox.enqueue(event(persisted, transitioned, action, at, command.correlationId()));
            return detailView(persisted, transitioned.id().value(),
                    capabilities(command.subjectId(), command.correlationId()));
        } catch (AgreementRepositoryException exception) {
            throw repositoryFailure(exception);
        } catch (IllegalStateException exception) {
            throw conflictOrLifecycle(exception);
        }
    }

    private void validateLockedAuthority(AgreementVersion version, String correlationId) {
        AgreementCommands.Commercial commercial = commercial(version);
        validateReferences(commercial, correlationId);
        validateRateLinks(commercial);
    }

    private void validateReferences(AgreementCommands.Commercial commercial, String correlationId) {
        List<AgreementReferenceValidationPort.Check> checks = List.of(
                new AgreementReferenceValidationPort.Check("customerId", "PARTY_CUSTOMER", commercial.customerId()),
                new AgreementReferenceValidationPort.Check("tradeLaneId", "TRADE_LANE", commercial.tradeLaneId()),
                new AgreementReferenceValidationPort.Check("originLocationId", "LOCATION", commercial.originLocationId()),
                new AgreementReferenceValidationPort.Check(
                        "destinationLocationId", "LOCATION", commercial.destinationLocationId()),
                new AgreementReferenceValidationPort.Check(
                        "equipmentTypeId", "EQUIPMENT_TYPE", commercial.equipmentTypeId()));
        List<AgreementReferenceValidationPort.Violation> violations;
        try {
            violations = references.validate(new AgreementReferenceValidationPort.Request(correlationId, checks));
        } catch (RuntimeException exception) {
            throw new AgreementApplicationException(503, "REFERENCE_DATA_UNAVAILABLE",
                    "Reference validation could not be completed safely");
        }
        if (!violations.isEmpty()) {
            throw new AgreementApplicationException(422, "AGREEMENT_REFERENCE_INVALID",
                    "One or more Agreement references are invalid",
                    violations.stream()
                            .map(value -> new AgreementApplicationException.FieldError(
                                    value.fieldPath(), value.reason()))
                            .toList());
        }
    }

    private List<AgreementRateLink> validateRateLinks(AgreementCommands.Commercial commercial) {
        Map<RateCategory, String> expected = new EnumMap<>(RateCategory.class);
        expected.put(RateCategory.BASE, commercial.baseRateVersionId());
        expected.put(RateCategory.SURCHARGE, commercial.surchargeRateVersionId());
        expected.put(RateCategory.LOCAL, commercial.localRateVersionId());
        if (expected.values().stream().anyMatch(value -> value == null || value.isBlank())
                || Set.copyOf(expected.values()).size() != 3) {
            throw new AgreementApplicationException(422, "AGREEMENT_RATE_LINKS_INVALID",
                    "Exactly three distinct RateVersion links are required");
        }
        List<AgreementRateVersionPort.RateVersionFact> facts;
        try {
            facts = rateVersions.findExact(List.copyOf(expected.values()));
        } catch (RuntimeException exception) {
            throw new AgreementApplicationException(503, "RATE_VERSION_VALIDATION_UNAVAILABLE",
                    "RateVersion validation could not be completed safely");
        }
        Map<String, AgreementRateVersionPort.RateVersionFact> byId = facts.stream()
                .collect(Collectors.toMap(AgreementRateVersionPort.RateVersionFact::rateVersionId, Function.identity()));
        List<AgreementApplicationException.FieldError> errors = new ArrayList<>();
        AgreementValidity agreementValidity = validity(commercial);
        for (Map.Entry<RateCategory, String> entry : expected.entrySet()) {
            AgreementRateVersionPort.RateVersionFact fact = byId.get(entry.getValue());
            String field = switch (entry.getKey()) {
                case BASE -> "baseRateVersionId";
                case SURCHARGE -> "surchargeRateVersionId";
                case LOCAL -> "localRateVersionId";
            };
            if (fact == null) {
                errors.add(new AgreementApplicationException.FieldError(field, "RateVersion is unavailable"));
                continue;
            }
            String requiredCode = switch (entry.getKey()) {
                case BASE -> "OFR";
                case SURCHARGE -> "BAF";
                case LOCAL -> "THC";
            };
            boolean matches = fact.category() == entry.getKey()
                    && requiredCode.equals(fact.chargeCode())
                    && fact.lifecycle() == RateLifecycle.APPROVED
                    && !fact.effectiveFrom().isAfter(agreementValidity.validFrom())
                    && !fact.effectiveTo().isBefore(agreementValidity.validTo())
                    && commercial.originLocationId().equals(fact.originLocationId())
                    && commercial.equipmentTypeId().equals(fact.equipmentTypeId())
                    && (entry.getKey() == RateCategory.LOCAL
                            ? fact.destinationLocationId() == null
                            : commercial.destinationLocationId().equals(fact.destinationLocationId()));
            if (!matches) {
                errors.add(new AgreementApplicationException.FieldError(
                        field, "RateVersion category, lifecycle, coverage, or applicability is incompatible"));
            }
        }
        if (!errors.isEmpty()) {
            throw new AgreementApplicationException(422, "AGREEMENT_RATE_LINKS_INVALID",
                    "One or more RateVersion links are incompatible", errors);
        }
        return expected.entrySet().stream()
                .map(entry -> new AgreementRateLink(entry.getKey(), new RateVersionId(entry.getValue())))
                .toList();
    }

    private AgreementViews.Detail detailView(
            Agreement agreement,
            String selectedVersionId,
            AgreementViews.Capabilities capabilities) {
        AgreementVersion selected = selectedVersionId == null
                ? selectSummary(agreement, null, null)
                : requireVersion(agreement, selectedVersionId);
        AgreementVersion approved = agreement.versions().stream()
                .filter(version -> version.lifecycle() == AgreementLifecycle.APPROVED)
                .max(Comparator.comparingLong(AgreementVersion::versionNo))
                .orElse(null);
        boolean eligible = agreement.authorityModel() == AgreementAuthorityModel.W2_VERSIONED;
        return new AgreementViews.Detail(agreement, selected, approved, reads.activity(agreement.id()),
                capabilities, eligible, !eligible);
    }

    private AgreementViews.ListItem listItem(
            Agreement agreement,
            AgreementSearchQuery query,
            AgreementViews.Capabilities capabilities) {
        AgreementVersion selected = selectSummary(agreement, query.lifecycle(), query.validOn());
        AgreementVersion approved = agreement.versions().stream()
                .filter(version -> version.lifecycle() == AgreementLifecycle.APPROVED)
                .filter(version -> query.validOn() == null || version.validity().contains(query.validOn()))
                .max(Comparator.comparingLong(AgreementVersion::versionNo))
                .orElse(null);
        boolean eligible = agreement.authorityModel() == AgreementAuthorityModel.W2_VERSIONED;
        return new AgreementViews.ListItem(
                agreement.id().value(), agreement.number().value(), agreement.authorityModel(),
                selected, approved, agreement.draft() != null, eligible, !eligible);
    }

    private static AgreementVersion selectSummary(
            Agreement agreement,
            AgreementLifecycle lifecycle,
            java.time.LocalDate validOn) {
        return agreement.versions().stream()
                .filter(version -> lifecycle == null || version.lifecycle() == lifecycle)
                .filter(version -> validOn == null || version.validity().contains(validOn))
                .sorted(Comparator
                        .comparing((AgreementVersion version) -> version.lifecycle() == AgreementLifecycle.DRAFT)
                        .thenComparingLong(AgreementVersion::versionNo)
                        .reversed())
                .findFirst()
                .orElse(null);
    }

    private AgreementViews.Capabilities capabilities(String subjectId, String correlationId) {
        return new AgreementViews.Capabilities(
                allowed(subjectId, "create", correlationId),
                allowed(subjectId, "update", correlationId),
                allowed(subjectId, "approve", correlationId),
                allowed(subjectId, "create-successor", correlationId),
                allowed(subjectId, "suspend", correlationId),
                allowed(subjectId, "expire", correlationId));
    }

    private boolean allowed(String subjectId, String action, String correlationId) {
        return authorization.authorize(subjectId, RESOURCE, action, correlationId)
                == AgreementAuthorizationPort.Decision.ALLOW;
    }

    private void requireAuthorized(String subjectId, String action, String correlationId) {
        if (subjectId == null || subjectId.isBlank()) {
            throw new AgreementApplicationException(401, "AUTHENTICATION_REQUIRED",
                    "An authenticated subject is required");
        }
        AgreementAuthorizationPort.Decision decision =
                authorization.authorize(subjectId, RESOURCE, action, correlationId);
        if (decision == AgreementAuthorizationPort.Decision.UNAVAILABLE) {
            throw new AgreementApplicationException(503, "IDENTITY_UNAVAILABLE",
                    "Authorization could not be completed safely");
        }
        if (decision != AgreementAuthorizationPort.Decision.ALLOW) {
            throw new AgreementApplicationException(403, "AGREEMENT_ACCESS_DENIED",
                    "Agreement operation is not permitted");
        }
    }

    private Agreement requireAgreement(String value) {
        try {
            return reads.findById(new AgreementId(value))
                    .orElseThrow(() -> new AgreementApplicationException(
                            404, "AGREEMENT_NOT_FOUND", "Agreement was not found"));
        } catch (IllegalArgumentException exception) {
            throw new AgreementApplicationException(400, "AGREEMENT_ID_INVALID", "Agreement id is invalid");
        }
    }

    private Agreement requireW2Agreement(String value) {
        Agreement agreement = requireAgreement(value);
        if (agreement.authorityModel() != AgreementAuthorityModel.W2_VERSIONED) {
            throw new AgreementApplicationException(
                    422,
                    "LEGACY_AGREEMENT_READ_ONLY",
                    "LEGACY Agreement history is read-only in the W2 administration contract");
        }
        return agreement;
    }

    private static AgreementVersion requireVersion(Agreement agreement, String value) {
        return agreement.versions().stream()
                .filter(version -> version.id().value().equals(value))
                .findFirst()
                .orElseThrow(() -> new AgreementApplicationException(
                        404, "AGREEMENT_VERSION_NOT_FOUND", "Agreement version was not found"));
    }

    private static AgreementCommands.Commercial requireCommercial(AgreementCommands.Commercial value) {
        if (value == null) {
            throw new AgreementApplicationException(400, "AGREEMENT_BODY_INVALID",
                    "Agreement commercial fields are required");
        }
        return value;
    }

    private static AgreementCommands.Commercial commercial(AgreementVersion version) {
        Map<RateCategory, AgreementRateLink> links = version.linksByCategory();
        return new AgreementCommands.Commercial(
                version.customerId().value(), version.tradeLaneId().value(),
                version.originLocationId().value(), version.destinationLocationId().value(),
                version.equipmentTypeId().value(), version.validity().validFrom(),
                version.validity().validTo(), links.get(RateCategory.BASE).rateVersionId().value(),
                links.get(RateCategory.SURCHARGE).rateVersionId().value(),
                links.get(RateCategory.LOCAL).rateVersionId().value());
    }

    private AgreementActivity activity(
            Agreement agreement,
            AgreementVersion version,
            AgreementActivityAction action,
            String actor,
            Instant at,
            String correlationId,
            String reason) {
        return new AgreementActivity(
                ids.nextId(), agreement.id(), version.id(), action, actor, at,
                correlationId, reason, version.rowVersion());
    }

    private AgreementOutboxEvent event(
            Agreement agreement,
            AgreementVersion version,
            AgreementActivityAction action,
            Instant at,
            String correlationId) {
        String eventType = switch (action) {
            case CREATED -> "charge-agreement.created";
            case DRAFT_UPDATED, SUCCESSOR_CREATED -> "charge-agreement.updated";
            case APPROVED -> "charge-agreement.approved";
            case SUSPENDED -> "charge-agreement.suspended";
            case EXPIRED -> "charge-agreement.expired";
        };
        String eventId = "w2agr-" + ids.nextId();
        Map<String, String> payload = new HashMap<>();
        payload.put("agreementVersionId", version.id().value());
        payload.put("agreementVersionNo", String.valueOf(version.versionNo()));
        payload.put("authorityModel", version.authorityModel().name());
        payload.put("lifecycleAction", action.name());
        if (version.sourceVersionId() != null) {
            payload.put("sourceAgreementVersionId", version.sourceVersionId().value());
        }
        return new AgreementOutboxEvent(
                eventId, eventType, "1.1.0", agreement.id().value(), version.lifecycle().name(),
                version.rowVersion(), eventType + "-value", "charge-agreement-service",
                agreement.id().value() + ":" + version.id().value() + ":" + version.rowVersion() + ":" + eventType,
                correlationId, at, payload, OutboxStatus.PENDING, 0, at,
                null, null, null, null);
    }

    private static AgreementValidity validity(AgreementCommands.Commercial commercial) {
        return new AgreementValidity(commercial.validFrom(), commercial.validTo());
    }

    private static ReferenceId ref(String value) {
        return new ReferenceId(value);
    }

    private static void requireReason(String reason) {
        if (reason == null || reason.isBlank() || reason.length() > 512) {
            throw new AgreementApplicationException(
                    422,
                    "AGREEMENT_VALIDATION_FAILED",
                    "reason is required and must not exceed 512 characters");
        }
    }

    private static AgreementApplicationException semantic(RuntimeException exception) {
        return new AgreementApplicationException(422, "AGREEMENT_VALIDATION_FAILED", exception.getMessage());
    }

    private static AgreementApplicationException conflictOrLifecycle(IllegalStateException exception) {
        if (exception.getMessage() != null && exception.getMessage().contains("conflict")) {
            return new AgreementApplicationException(
                    409, "AGREEMENT_STALE_VERSION", "Agreement version changed");
        }
        return new AgreementApplicationException(
                422, "AGREEMENT_LIFECYCLE_INVALID", exception.getMessage());
    }

    private static AgreementApplicationException repositoryFailure(AgreementRepositoryException exception) {
        return switch (exception.code()) {
            case "AGREEMENT_STALE_VERSION", "AGREEMENT_DRAFT_EXISTS", "AGREEMENT_AUTHORITY_CONFLICT" ->
                    new AgreementApplicationException(409, exception.code(), exception.getMessage());
            case "AGREEMENT_NOT_FOUND" ->
                    new AgreementApplicationException(404, exception.code(), "Agreement was not found");
            default -> new AgreementApplicationException(
                    503, "AGREEMENT_PERSISTENCE_UNAVAILABLE", "Agreement persistence is unavailable");
        };
    }
}

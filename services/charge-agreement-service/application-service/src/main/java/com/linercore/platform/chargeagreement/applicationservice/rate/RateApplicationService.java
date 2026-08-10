package com.linercore.platform.chargeagreement.applicationservice.rate;

import com.linercore.platform.chargeagreement.applicationservice.port.IdGenerator;
import com.linercore.platform.chargeagreement.applicationservice.port.RateAuthorizationPort;
import com.linercore.platform.chargeagreement.applicationservice.port.RateReferenceValidationPort;
import com.linercore.platform.chargeagreement.applicationservice.port.RateRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.RateRepositoryException;
import com.linercore.platform.chargeagreement.domain.model.ReferenceId;
import com.linercore.platform.chargeagreement.domain.rate.Rate;
import com.linercore.platform.chargeagreement.domain.rate.RateActivity;
import com.linercore.platform.chargeagreement.domain.rate.RateApplicability;
import com.linercore.platform.chargeagreement.domain.rate.RateId;
import com.linercore.platform.chargeagreement.domain.rate.RateLifecycle;
import com.linercore.platform.chargeagreement.domain.rate.RateMoney;
import com.linercore.platform.chargeagreement.domain.rate.RatePresentationState;
import com.linercore.platform.chargeagreement.domain.rate.RateVersion;
import com.linercore.platform.chargeagreement.domain.rate.RateVersionId;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

public final class RateApplicationService {
    private static final String RESOURCE = "charge-rates";

    private final RateRepository rates;
    private final RateAuthorizationPort authorization;
    private final RateReferenceValidationPort references;
    private final IdGenerator ids;
    private final Clock clock;

    public RateApplicationService(
            RateRepository rates,
            RateAuthorizationPort authorization,
            RateReferenceValidationPort references,
            IdGenerator ids,
            Clock clock) {
        this.rates = Objects.requireNonNull(rates);
        this.authorization = Objects.requireNonNull(authorization);
        this.references = Objects.requireNonNull(references);
        this.ids = Objects.requireNonNull(ids);
        this.clock = Objects.requireNonNull(clock);
    }

    public RateViews.Detail create(RateCommands.Create command) {
        requireAuthorized(command.subjectId(), "create", command.correlationId());
        validateReferences(command);
        try {
            Instant at = clock.instant();
            Rate rate = Rate.firstDraft(new RateId(ids.nextId()), new RateVersionId(ids.nextId()),
                    command.category(), ref(command.chargeCodeId()), command.chargeCode(),
                    money(command.unitRate(), command.currencyId(), command.currencyCode()),
                    command.effectiveFrom(), command.effectiveTo(),
                    applicability(command.category(), command.originLocationId(), command.destinationLocationId(),
                            command.equipmentTypeId()),
                    command.subjectId(), at, command.correlationId());
            rates.create(rate, activity(rate, rate.latestVersion(), RateActivity.Action.RATE_CREATED,
                    command.subjectId(), at, command.correlationId(), null));
            return detailView(rate, mutationCapabilities(command.subjectId(), command.correlationId()), today());
        } catch (IllegalArgumentException exception) {
            throw semantic(exception);
        } catch (RateRepositoryException exception) {
            throw repositoryFailure(exception);
        }
    }

    public RateViews.Detail updateDraft(RateCommands.UpdateDraft command) {
        requireAuthorized(command.subjectId(), "update", command.correlationId());
        Rate stable = requireRate(command.rateId());
        RateVersion current = requireVersion(stable, command.versionId());
        validateReferences(stable, command.currencyId(), command.originLocationId(), command.destinationLocationId(),
                command.equipmentTypeId(), command.correlationId());
        try {
            Instant at = clock.instant();
            RateVersion revised = current.reviseDraft(
                    money(command.unitRate(), command.currencyId(), command.currencyCode()),
                    command.effectiveFrom(), command.effectiveTo(),
                    applicability(stable.category(), command.originLocationId(), command.destinationLocationId(),
                            command.equipmentTypeId()),
                    command.expectedRowVersion(), command.subjectId(), at, command.correlationId());
            Rate persisted = rates.updateDraft(stable, revised, activity(stable, revised,
                    RateActivity.Action.RATE_DRAFT_UPDATED, command.subjectId(), at,
                    command.correlationId(), "Draft commercial fields revised"));
            return detailView(persisted, mutationCapabilities(command.subjectId(), command.correlationId()), today());
        } catch (IllegalStateException exception) {
            throw conflictOrLifecycle(exception);
        } catch (IllegalArgumentException exception) {
            throw semantic(exception);
        } catch (RateRepositoryException exception) {
            throw repositoryFailure(exception);
        }
    }

    public RateViews.Detail approve(RateCommands.Approve command) {
        requireAuthorized(command.subjectId(), "approve", command.correlationId());
        Rate stable = requireRate(command.rateId());
        RateVersion current = requireVersion(stable, command.versionId());
        validateReferences(stable, current.money().currencyId().value(),
                current.applicability().originLocationId().value(),
                current.applicability().destinationLocationId() == null
                        ? null : current.applicability().destinationLocationId().value(),
                current.applicability().equipmentTypeId().value(), command.correlationId());
        try {
            Instant at = clock.instant();
            RateVersion approved = current.approve(command.expectedRowVersion(), command.subjectId(), at,
                    command.correlationId());
            Rate persisted = rates.approveUnderLock(stable, approved, activity(stable, approved,
                    RateActivity.Action.RATE_VERSION_APPROVED, command.subjectId(), at,
                    command.correlationId(), "Approved as immutable authority"));
            return detailView(persisted, mutationCapabilities(command.subjectId(), command.correlationId()), today());
        } catch (IllegalStateException exception) {
            throw conflictOrLifecycle(exception);
        } catch (RateRepositoryException exception) {
            throw repositoryFailure(exception);
        }
    }

    public RateViews.Detail createSuccessor(RateCommands.CreateSuccessor command) {
        requireAuthorized(command.subjectId(), "create-successor", command.correlationId());
        Rate stable = requireRate(command.rateId());
        RateVersion source = requireVersion(stable, command.sourceVersionId());
        if (source.lifecycle() != RateLifecycle.APPROVED) {
            throw new RateApplicationException(422, "RATE_SUCCESSOR_SOURCE_INVALID",
                    "A successor must be created from an Approved version");
        }
        if (stable.draft() != null) {
            throw new RateApplicationException(409, "RATE_DRAFT_EXISTS", "A Draft already exists for this Rate");
        }
        RateMoney successorMoney = command.unitRate() == null
                ? source.money()
                : money(command.unitRate(), source.money().currencyId().value(), source.money().currencyCode());
        LocalDate from = command.effectiveFrom() == null ? source.effectiveFrom() : command.effectiveFrom();
        LocalDate to = command.effectiveTo() == null ? source.effectiveTo() : command.effectiveTo();
        RateApplicability applicability = successorApplicability(stable, source, command);
        validateReferences(stable, successorMoney.currencyId().value(), applicability.originLocationId().value(),
                applicability.destinationLocationId() == null ? null : applicability.destinationLocationId().value(),
                applicability.equipmentTypeId().value(), command.correlationId());
        try {
            Instant at = clock.instant();
            RateVersion successor = new RateVersion(new RateVersionId(ids.nextId()), stable.id(),
                    stable.nextVersionNo(), RateLifecycle.DRAFT, source.basis(), successorMoney, from, to,
                    applicability, 0, source.id(), command.subjectId(), at, null, null, null, null,
                    command.correlationId());
            Rate persisted = rates.createSuccessor(stable, source, successor, activity(stable, successor,
                    RateActivity.Action.RATE_SUCCESSOR_CREATED, command.subjectId(), at,
                    command.correlationId(), "Created from " + source.id().value()));
            return detailView(persisted, mutationCapabilities(command.subjectId(), command.correlationId()), today());
        } catch (IllegalArgumentException exception) {
            throw semantic(exception);
        } catch (RateRepositoryException exception) {
            throw repositoryFailure(exception);
        }
    }

    public RateViews.Detail detail(String rateId, LocalDate asOf, String subjectId, String correlationId) {
        MutationCapabilities capabilities = requireReadAndMutationCapabilities(subjectId, correlationId);
        return detailView(requireRate(rateId), capabilities, asOf == null ? today() : asOf);
    }

    public RateViews.Page search(RateSearchQuery query) {
        MutationCapabilities capabilities =
                requireReadAndMutationCapabilities(query.subjectId(), query.correlationId());
        LocalDate asOf = query.asOf() == null ? today() : query.asOf();
        long requestedOffset = (long) query.page() * query.size();
        RateRepository.SearchPage result = rates.search(new RateRepository.SearchCriteria(
                query.category(), query.lifecycle(), asOf, query.originLocationId(), query.destinationLocationId(),
                query.equipmentTypeId(), query.query(), requestedOffset, query.size()));
        List<RateViews.ListItem> items = result.items().stream()
                .map(rate -> listItem(rate, query.lifecycle(), asOf, capabilities))
                .toList();
        boolean hasMore = requestedOffset + items.size() < result.total();
        return new RateViews.Page(items, query.page(), query.size(), result.total(), hasMore,
                capabilities.create(), asOf);
    }

    private MutationCapabilities requireReadAndMutationCapabilities(String subjectId, String correlationId) {
        requireAuthorized(subjectId, "read", correlationId);
        return mutationCapabilities(subjectId, correlationId);
    }

    private MutationCapabilities mutationCapabilities(String subjectId, String correlationId) {
        return new MutationCapabilities(
                optionallyAuthorized(subjectId, "create", correlationId),
                optionallyAuthorized(subjectId, "update", correlationId),
                optionallyAuthorized(subjectId, "approve", correlationId),
                optionallyAuthorized(subjectId, "create-successor", correlationId));
    }

    private boolean optionallyAuthorized(String subjectId, String action, String correlationId) {
        return authorization.authorize(subjectId, RESOURCE, action, correlationId)
                == RateAuthorizationPort.Decision.ALLOW;
    }

    private void requireAuthorized(String subjectId, String action, String correlationId) {
        if (subjectId == null || subjectId.isBlank()) {
            throw new RateApplicationException(401, "AUTHENTICATION_REQUIRED", "An authenticated subject is required");
        }
        RateAuthorizationPort.Decision decision = authorization.authorize(subjectId, RESOURCE, action, correlationId);
        if (decision == RateAuthorizationPort.Decision.UNAVAILABLE) {
            throw new RateApplicationException(503, "IDENTITY_UNAVAILABLE",
                    "Authorization could not be completed safely");
        }
        if (decision != RateAuthorizationPort.Decision.ALLOW) {
            throw new RateApplicationException(403, "RATE_ACCESS_DENIED", "Rate operation is not permitted");
        }
    }

    private Rate requireRate(String value) {
        try {
            return rates.findById(new RateId(value))
                    .orElseThrow(() -> new RateApplicationException(404, "RATE_NOT_FOUND", "Rate was not found"));
        } catch (IllegalArgumentException exception) {
            throw new RateApplicationException(400, "RATE_ID_INVALID", "Rate id is invalid");
        }
    }

    private RateVersion requireVersion(Rate rate, String versionId) {
        return rate.versions().stream()
                .filter(version -> version.id().value().equals(versionId))
                .findFirst()
                .orElseThrow(() -> new RateApplicationException(404, "RATE_VERSION_NOT_FOUND",
                        "Rate version was not found"));
    }

    private void validateReferences(RateCommands.Create command) {
        validateReferences(command.category(), command.chargeCodeId(), command.chargeCode(), command.currencyId(),
                command.originLocationId(), command.destinationLocationId(), command.equipmentTypeId(),
                command.correlationId());
    }

    private void validateReferences(
            Rate stable,
            String currencyId,
            String originId,
            String destinationId,
            String equipmentId,
            String correlationId) {
        validateReferences(stable.category(), stable.chargeCodeId().value(), stable.chargeCode(), currencyId,
                originId, destinationId, equipmentId, correlationId);
    }

    private void validateReferences(
            com.linercore.platform.chargeagreement.domain.rate.RateCategory category,
            String chargeCodeId,
            String chargeCode,
            String currencyId,
            String originId,
            String destinationId,
            String equipmentId,
            String correlationId) {
        List<RateReferenceValidationPort.Check> checks = new ArrayList<>();
        checks.add(new RateReferenceValidationPort.Check("chargeCodeId", "CHARGE_CODE", chargeCodeId, chargeCode));
        checks.add(new RateReferenceValidationPort.Check("currencyId", "CURRENCY", currencyId, "USD"));
        checks.add(new RateReferenceValidationPort.Check("originLocationId", "LOCATION", originId, null));
        if (category != com.linercore.platform.chargeagreement.domain.rate.RateCategory.LOCAL) {
            checks.add(new RateReferenceValidationPort.Check("destinationLocationId", "LOCATION", destinationId, null));
        }
        checks.add(new RateReferenceValidationPort.Check("equipmentTypeId", "EQUIPMENT_TYPE", equipmentId, null));
        List<RateReferenceValidationPort.Violation> violations;
        try {
            violations = references.validate(new RateReferenceValidationPort.Request(correlationId, checks));
        } catch (RuntimeException exception) {
            throw new RateApplicationException(503, "REFERENCE_DATA_UNAVAILABLE",
                    "Reference validation could not be completed safely");
        }
        if (!violations.isEmpty()) {
            throw new RateApplicationException(422, "RATE_REFERENCE_INVALID", "One or more references are invalid",
                    violations.stream()
                            .map(value -> new RateApplicationException.FieldError(value.fieldPath(), value.reason()))
                            .toList());
        }
    }

    private RateViews.Detail detailView(Rate rate, boolean canMutate, LocalDate asOf) {
        MutationCapabilities capabilities = canMutate
                ? new MutationCapabilities(true, true, true, true)
                : new MutationCapabilities(false, false, false, false);
        return detailView(rate, capabilities, asOf);
    }

    private RateViews.Detail detailView(Rate rate, MutationCapabilities capabilities, LocalDate asOf) {
        List<RateViews.Version> versions = rate.versions().stream()
                .sorted(Comparator.comparingLong(RateVersion::versionNo).reversed())
                .map(version -> RateViews.version(version, asOf))
                .toList();
        return new RateViews.Detail(rate, versions, rates.activities(rate.id()), actions(rate, capabilities), asOf);
    }

    private RateViews.ListItem listItem(
            Rate rate,
            RatePresentationState filter,
            LocalDate asOf,
            MutationCapabilities capabilities) {
        RateVersion selected = RateViews.selectSummary(rate, filter, asOf);
        RateVersion effective = RateViews.effective(rate.versions(), asOf);
        return new RateViews.ListItem(rate, RateViews.version(rate.latestVersion(), asOf),
                RateViews.version(selected, asOf), RateViews.version(effective, asOf), rate.draft() != null,
                rate.versions().size(), actions(rate, capabilities), asOf);
    }

    private RateViews.Actions actions(Rate rate, MutationCapabilities capabilities) {
        boolean hasDraft = rate.draft() != null;
        boolean hasApproved = rate.versions().stream()
                .anyMatch(version -> version.lifecycle() == RateLifecycle.APPROVED);
        return new RateViews.Actions(capabilities.update() && hasDraft,
                capabilities.approve() && hasDraft,
                capabilities.createSuccessor() && !hasDraft && hasApproved);
    }

    private RateActivity activity(
            Rate rate,
            RateVersion version,
            RateActivity.Action action,
            String actor,
            Instant at,
            String correlation,
            String reason) {
        return new RateActivity(ids.nextId(), rate.id(), version.id(), version.versionNo(), action, actor, at,
                correlation, reason, version.rowVersion());
    }

    private RateApplicability successorApplicability(
            Rate rate,
            RateVersion source,
            RateCommands.CreateSuccessor command) {
        String origin = command.originLocationId() == null
                ? source.applicability().originLocationId().value() : command.originLocationId();
        String destination = command.destinationLocationId() == null
                ? source.applicability().destinationLocationId() == null
                        ? null : source.applicability().destinationLocationId().value()
                : command.destinationLocationId();
        String equipment = command.equipmentTypeId() == null
                ? source.applicability().equipmentTypeId().value() : command.equipmentTypeId();
        return applicability(rate.category(), origin, destination, equipment);
    }

    private static RateMoney money(java.math.BigDecimal amount, String currencyId, String code) {
        return new RateMoney(amount, ref(currencyId), code);
    }

    private static RateApplicability applicability(
            com.linercore.platform.chargeagreement.domain.rate.RateCategory category,
            String origin,
            String destination,
            String equipment) {
        return RateApplicability.forCategory(category, ref(origin), destination == null ? null : ref(destination),
                ref(equipment));
    }

    private static ReferenceId ref(String value) {
        return new ReferenceId(value);
    }

    private LocalDate today() {
        return LocalDate.now(clock);
    }

    private record MutationCapabilities(boolean create, boolean update, boolean approve, boolean createSuccessor) {
    }

    private static RateApplicationException semantic(RuntimeException exception) {
        return new RateApplicationException(422, "RATE_VALIDATION_FAILED", exception.getMessage());
    }

    private static RateApplicationException conflictOrLifecycle(IllegalStateException exception) {
        if (exception.getMessage().contains("conflict")) {
            return new RateApplicationException(409, "RATE_VERSION_CONFLICT", "Rate version changed");
        }
        return new RateApplicationException(422, "RATE_VERSION_IMMUTABLE", exception.getMessage());
    }

    private static RateApplicationException repositoryFailure(RateRepositoryException exception) {
        return switch (exception.code()) {
            case "RATE_AUTHORITY_CONFLICT" ->
                    new RateApplicationException(409, exception.code(), "An overlapping Approved authority exists");
            case "RATE_DRAFT_EXISTS" ->
                    new RateApplicationException(409, exception.code(), "A Draft already exists for this Rate");
            case "RATE_VERSION_CONFLICT" ->
                    new RateApplicationException(409, exception.code(), "Rate version changed");
            default -> new RateApplicationException(500, "RATE_PERSISTENCE_FAILED", "Rate operation failed");
        };
    }
}

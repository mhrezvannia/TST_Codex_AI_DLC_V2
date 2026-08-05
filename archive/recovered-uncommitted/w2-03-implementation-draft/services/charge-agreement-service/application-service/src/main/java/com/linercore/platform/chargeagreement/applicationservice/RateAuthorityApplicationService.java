package com.linercore.platform.chargeagreement.applicationservice;

import com.linercore.platform.chargeagreement.applicationservice.command.CreateRateCommand;
import com.linercore.platform.chargeagreement.applicationservice.command.VersionRateCommand;
import com.linercore.platform.chargeagreement.applicationservice.port.AgreementRateBindingRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.AuthorizationPort;
import com.linercore.platform.chargeagreement.applicationservice.port.IdGenerator;
import com.linercore.platform.chargeagreement.applicationservice.port.RateAuthorityPort;
import com.linercore.platform.chargeagreement.applicationservice.port.RateRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.ReferenceValidationPort;
import com.linercore.platform.chargeagreement.applicationservice.port.ReferenceValidationRequest;
import com.linercore.platform.chargeagreement.domain.model.AgreementId;
import com.linercore.platform.chargeagreement.domain.model.AgreementRateBinding;
import com.linercore.platform.chargeagreement.domain.model.ChargeCategory;
import com.linercore.platform.chargeagreement.domain.model.MoneyAmount;
import com.linercore.platform.chargeagreement.domain.model.PricingLine;
import com.linercore.platform.chargeagreement.domain.model.PricingRequest;
import com.linercore.platform.chargeagreement.domain.model.RateStatus;
import com.linercore.platform.chargeagreement.domain.model.RateVersion;
import com.linercore.platform.chargeagreement.domain.model.ReferenceId;
import com.linercore.platform.chargeagreement.domain.model.ValidityWindow;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;

public class RateAuthorityApplicationService implements RateAuthorityPort {
    private static final EnumSet<ChargeCategory> REQUIRED_CATEGORIES = EnumSet.allOf(ChargeCategory.class);

    private final RateRepository rates;
    private final AgreementRateBindingRepository bindings;
    private final AuthorizationPort authorization;
    private final ReferenceValidationPort referenceValidation;
    private final IdGenerator ids;

    public RateAuthorityApplicationService(
            RateRepository rates,
            AgreementRateBindingRepository bindings,
            AuthorizationPort authorization,
            ReferenceValidationPort referenceValidation,
            IdGenerator ids) {
        this.rates = rates;
        this.bindings = bindings;
        this.authorization = authorization;
        this.referenceValidation = referenceValidation;
        this.ids = ids;
    }

    public RateVersion create(CreateRateCommand command) {
        requireAllowed(command.actorSubjectId(), "manage-rates", command.correlationId());
        validateReferences(command.chargeCodeId(), command.tradeLaneId(), command.equipmentTypeId(),
                command.currencyId(), command.locationId());
        String definitionId = ids.nextId();
        return rates.save(RateVersion.draft(
                ids.nextId(), definitionId, command.category(), new ReferenceId(command.chargeCodeId()),
                new ReferenceId(command.tradeLaneId()), new ReferenceId(command.equipmentTypeId()),
                optionalReference(command.locationId()), new MoneyAmount(command.amount(), new ReferenceId(command.currencyId())),
                new ValidityWindow(command.validFrom(), command.validTo())));
    }

    public RateVersion createVersion(String currentId, VersionRateCommand command) {
        requireAllowed(command.actorSubjectId(), "manage-rates", command.correlationId());
        RateVersion current = detail(currentId, command.actorSubjectId(), command.correlationId());
        if (current.version() != command.expectedVersion()) {
            throw new IllegalStateException("stale rate version");
        }
        return rates.save(current.nextDraft(ids.nextId(),
                new MoneyAmount(command.amount(), new ReferenceId(command.currencyId())),
                new ValidityWindow(command.validFrom(), command.validTo())));
    }

    public RateVersion approve(String id, int expectedVersion, String actorSubjectId, String correlationId) {
        requireAllowed(actorSubjectId, "approve-rates", correlationId);
        RateVersion rate = detail(id, actorSubjectId, correlationId);
        if (rate.version() != expectedVersion) {
            throw new IllegalStateException("stale rate version");
        }
        return rates.save(rate.approve());
    }

    public RateVersion detail(String id, String actorSubjectId, String correlationId) {
        requireAllowed(actorSubjectId, "read-rates", correlationId);
        return rates.findById(id).orElseThrow(() -> new IllegalArgumentException("rate version not found"));
    }

    public List<RateVersion> search(ChargeCategory category, String actorSubjectId, String correlationId) {
        requireAllowed(actorSubjectId, "read-rates", correlationId);
        return rates.search(category);
    }

    public AgreementRateBinding bindAgreement(
            AgreementId agreementId,
            long draftVersion,
            List<String> rateVersionIds,
            String actorSubjectId,
            String correlationId) {
        requireAllowed(actorSubjectId, "manage-agreements", correlationId);
        List<RateVersion> selected = rates.findAllByIds(rateVersionIds);
        validateCompleteSelection(rateVersionIds, selected);
        return bindings.replace(new AgreementRateBinding(agreementId, draftVersion, rateVersionIds));
    }

    @Override
    public void validateAgreementApproval(AgreementId agreementId, long draftVersion) {
        AgreementRateBinding binding = bindings.find(agreementId, draftVersion)
                .orElseThrow(() -> new IllegalStateException("agreement approval requires rate-version bindings"));
        validateCompleteSelection(binding.rateVersionIds(), rates.findAllByIds(binding.rateVersionIds()));
    }

    @Override
    public void promoteAgreementBinding(AgreementId agreementId, long draftVersion, long approvedVersion) {
        AgreementRateBinding binding = bindings.find(agreementId, draftVersion)
                .orElseThrow(() -> new IllegalStateException("draft agreement rate binding not found"));
        bindings.replace(new AgreementRateBinding(agreementId, approvedVersion, binding.rateVersionIds()));
    }

    @Override
    public List<PricingLine> pricingLines(AgreementId agreementId, long agreementVersion, PricingRequest request) {
        return bindings.find(agreementId, agreementVersion)
                .map(binding -> completePricingLines(binding, request))
                .orElse(List.of());
    }

    private List<PricingLine> completePricingLines(AgreementRateBinding binding, PricingRequest request) {
        List<RateVersion> matching = rates.findAllByIds(binding.rateVersionIds()).stream()
                .filter(rate -> rate.matches(request))
                .toList();
        EnumSet<ChargeCategory> categories = matching.stream()
                .map(RateVersion::category)
                .collect(() -> EnumSet.noneOf(ChargeCategory.class), EnumSet::add, EnumSet::addAll);
        if (matching.size() != REQUIRED_CATEGORIES.size() || !categories.equals(REQUIRED_CATEGORIES)) {
            return List.of();
        }
        return matching.stream()
                .sorted(Comparator.comparing(RateVersion::category))
                .map(rate -> rate.price(request))
                .toList();
    }

    private void validateCompleteSelection(List<String> requestedIds, List<RateVersion> selected) {
        if (selected.size() != requestedIds.stream().distinct().count()) {
            throw new IllegalArgumentException("one or more rate versions do not exist");
        }
        if (selected.size() != REQUIRED_CATEGORIES.size()) {
            throw new IllegalStateException("agreement bindings require exactly one rate version per category");
        }
        if (selected.stream().anyMatch(rate -> rate.status() != RateStatus.APPROVED)) {
            throw new IllegalStateException("agreement bindings require approved rate versions");
        }
        EnumSet<ChargeCategory> categories = selected.stream()
                .map(RateVersion::category)
                .collect(() -> EnumSet.noneOf(ChargeCategory.class), EnumSet::add, EnumSet::addAll);
        if (!categories.equals(REQUIRED_CATEGORIES)) {
            throw new IllegalStateException("agreement bindings require FREIGHT, SURCHARGE, and LOCAL rate versions");
        }
    }

    private void validateReferences(String... referenceIds) {
        List<String> values = java.util.Arrays.stream(referenceIds)
                .filter(value -> value != null && !value.isBlank())
                .toList();
        List<String> failures = referenceValidation.validate(new ReferenceValidationRequest(values));
        if (!failures.isEmpty()) {
            throw new IllegalArgumentException(String.join("; ", failures));
        }
    }

    private void requireAllowed(String subjectId, String action, String correlationId) {
        if (!authorization.allowed(subjectId, "charge-rate-authority", action, correlationId)) {
            throw new SecurityException("not authorized for " + action);
        }
    }

    private static ReferenceId optionalReference(String value) {
        return value == null || value.isBlank() ? null : new ReferenceId(value);
    }
}

package com.linercore.platform.chargeagreement.domain.model;

import java.math.BigDecimal;

public record RateVersion(
        String id,
        String definitionId,
        int version,
        ChargeCategory category,
        ReferenceId chargeCodeId,
        ReferenceId tradeLaneId,
        ReferenceId equipmentTypeId,
        ReferenceId locationId,
        ChargeBasis basis,
        MoneyAmount amount,
        ValidityWindow validity,
        RateStatus status,
        String previousVersionId) {

    public RateVersion {
        id = required(id, "rate version id");
        definitionId = required(definitionId, "rate definition id");
        if (version < 1) {
            throw new IllegalArgumentException("rate version must be positive");
        }
        if (category == null || chargeCodeId == null || tradeLaneId == null || equipmentTypeId == null
                || basis == null || amount == null || validity == null || status == null) {
            throw new IllegalArgumentException("rate category, references, basis, amount, validity, and status are required");
        }
        if (!"USD".equalsIgnoreCase(amount.currencyId().value())) {
            throw new IllegalArgumentException("W2-03 supports USD rates only");
        }
        if (category == ChargeCategory.LOCAL && locationId == null) {
            throw new IllegalArgumentException("local charges require a location");
        }
        if (category != ChargeCategory.LOCAL && locationId != null) {
            throw new IllegalArgumentException("only local charges may define a location");
        }
        previousVersionId = previousVersionId == null || previousVersionId.isBlank() ? null : previousVersionId.trim();
    }

    public static RateVersion draft(
            String id,
            String definitionId,
            ChargeCategory category,
            ReferenceId chargeCodeId,
            ReferenceId tradeLaneId,
            ReferenceId equipmentTypeId,
            ReferenceId locationId,
            MoneyAmount amount,
            ValidityWindow validity) {
        return new RateVersion(id, definitionId, 1, category, chargeCodeId, tradeLaneId, equipmentTypeId,
                locationId, ChargeBasis.CONTAINER, amount, validity, RateStatus.DRAFT, null);
    }

    public RateVersion approve() {
        if (status != RateStatus.DRAFT) {
            throw new IllegalStateException("only draft rate versions can be approved");
        }
        return new RateVersion(id, definitionId, version, category, chargeCodeId, tradeLaneId, equipmentTypeId,
                locationId, basis, amount, validity, RateStatus.APPROVED, previousVersionId);
    }

    public RateVersion nextDraft(String nextId, MoneyAmount nextAmount, ValidityWindow nextValidity) {
        if (status != RateStatus.APPROVED) {
            throw new IllegalStateException("new versions require an approved predecessor");
        }
        return new RateVersion(nextId, definitionId, version + 1, category, chargeCodeId, tradeLaneId,
                equipmentTypeId, locationId, basis, nextAmount, nextValidity, RateStatus.DRAFT, id);
    }

    public boolean matches(PricingRequest request) {
        if (status != RateStatus.APPROVED || !validity.contains(request.effectiveDate())) {
            return false;
        }
        if (!tradeLaneId.value().equals(request.tradeLane())
                || !equipmentTypeId.value().equals(request.equipmentType())) {
            return false;
        }
        return category != ChargeCategory.LOCAL
                || locationId.value().equals(request.pol())
                || locationId.value().equals(request.pod());
    }

    public PricingLine price(PricingRequest request) {
        if (!matches(request)) {
            throw new IllegalArgumentException("rate version does not match pricing request");
        }
        int quantity = request.quantityFor(basis);
        MoneyAmount total = new MoneyAmount(amount.amount().multiply(BigDecimal.valueOf(quantity)), amount.currencyId());
        return new PricingLine(id, chargeCodeId, category, basis, quantity, amount, total);
    }

    private static String required(String value, String label) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(label + " is required");
        }
        return value.trim();
    }
}

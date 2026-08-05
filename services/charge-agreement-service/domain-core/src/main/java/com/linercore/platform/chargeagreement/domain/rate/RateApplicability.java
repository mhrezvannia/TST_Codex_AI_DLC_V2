package com.linercore.platform.chargeagreement.domain.rate;

import com.linercore.platform.chargeagreement.domain.model.ReferenceId;
import java.util.Objects;

public record RateApplicability(
        ReferenceId originLocationId,
        ReferenceId destinationLocationId,
        ReferenceId equipmentTypeId) {

    public RateApplicability {
        Objects.requireNonNull(originLocationId, "origin location id is required");
        Objects.requireNonNull(equipmentTypeId, "equipment type id is required");
    }

    public static RateApplicability forCategory(
            RateCategory category,
            ReferenceId origin,
            ReferenceId destination,
            ReferenceId equipment) {
        Objects.requireNonNull(category, "category is required");
        if (category == RateCategory.LOCAL && destination != null) {
            throw new IllegalArgumentException("destination must be absent for LOCAL rates");
        }
        if (category != RateCategory.LOCAL && destination == null) {
            throw new IllegalArgumentException("destination is required for BASE and SURCHARGE rates");
        }
        return new RateApplicability(origin, destination, equipment);
    }

    public String approvalKey(RateCategory category, String chargeCodeId) {
        return "rate:v1|"
                + encode(category.name()) + "|"
                + encode(chargeCodeId) + "|"
                + encode(originLocationId.value()) + "|"
                + encode(destinationLocationId == null ? "" : destinationLocationId.value()) + "|"
                + encode(equipmentTypeId.value());
    }

    private static String encode(String value) {
        return value.length() + ":" + value;
    }
}

package com.linercore.platform.chargeagreement.applicationservice.rate;

import com.linercore.platform.chargeagreement.domain.rate.RateCategory;
import com.linercore.platform.chargeagreement.domain.rate.RatePresentationState;
import java.time.LocalDate;

public record RateSearchQuery(
        RateCategory category,
        RatePresentationState lifecycle,
        LocalDate asOf,
        String originLocationId,
        String destinationLocationId,
        String equipmentTypeId,
        String query,
        int page,
        int size,
        String subjectId,
        String correlationId) {

    public RateSearchQuery {
        if (page < 0 || size < 1 || size > 100) {
            throw new IllegalArgumentException("page must be non-negative and size must be between 1 and 100");
        }
    }
}

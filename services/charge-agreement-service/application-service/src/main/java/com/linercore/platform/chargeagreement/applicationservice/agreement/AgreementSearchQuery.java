package com.linercore.platform.chargeagreement.applicationservice.agreement;

import com.linercore.platform.chargeagreement.domain.agreement.AgreementLifecycle;
import java.time.LocalDate;

public record AgreementSearchQuery(
        String customerId,
        String tradeLaneId,
        AgreementLifecycle lifecycle,
        LocalDate validOn,
        int page,
        int size,
        String subjectId,
        String correlationId) {

    public AgreementSearchQuery {
        if (page < 0) {
            throw new IllegalArgumentException("page must be zero or greater");
        }
        if (size < 1 || size > 100) {
            throw new IllegalArgumentException("size must be between 1 and 100");
        }
        customerId = blankToNull(customerId);
        tradeLaneId = blankToNull(tradeLaneId);
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}

package com.linercore.platform.chargeagreement.applicationservice.query;

import com.linercore.platform.chargeagreement.domain.model.AgreementStatus;
import java.time.LocalDate;

public record AgreementSearchQuery(
        String customerId,
        String tradeLaneId,
        String commodityId,
        AgreementStatus status,
        LocalDate validOn,
        boolean includeInactive,
        int page,
        int size,
        String actorSubjectId,
        String correlationId) {
    public AgreementSearchQuery {
        page = Math.max(0, page);
        size = Math.max(1, Math.min(size, 100));
    }
}

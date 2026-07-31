package com.linercore.platform.chargeagreement.applicationservice.port;

import com.linercore.platform.chargeagreement.domain.rate.RateCategory;
import com.linercore.platform.chargeagreement.domain.rate.RateLifecycle;
import java.time.LocalDate;
import java.util.List;

public interface AgreementRateVersionPort {
    List<RateVersionFact> findExact(List<String> rateVersionIds);

    record RateVersionFact(
            String rateVersionId,
            RateCategory category,
            String chargeCode,
            RateLifecycle lifecycle,
            LocalDate effectiveFrom,
            LocalDate effectiveTo,
            String originLocationId,
            String destinationLocationId,
            String equipmentTypeId) {
    }
}

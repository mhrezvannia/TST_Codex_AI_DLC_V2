package com.linercore.platform.chargeagreement.domain.agreement;

import com.linercore.platform.chargeagreement.domain.rate.RateCategory;
import com.linercore.platform.chargeagreement.domain.rate.RateVersionId;
import java.util.Objects;

public record AgreementRateLink(RateCategory category, RateVersionId rateVersionId) {
    public AgreementRateLink {
        Objects.requireNonNull(category, "rate category is required");
        Objects.requireNonNull(rateVersionId, "rate version id is required");
    }
}

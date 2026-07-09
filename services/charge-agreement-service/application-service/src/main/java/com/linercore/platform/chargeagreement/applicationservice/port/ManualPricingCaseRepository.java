package com.linercore.platform.chargeagreement.applicationservice.port;

import com.linercore.platform.chargeagreement.domain.model.ManualPricingCase;

public interface ManualPricingCaseRepository {
    void save(ManualPricingCase manualPricingCase);
}

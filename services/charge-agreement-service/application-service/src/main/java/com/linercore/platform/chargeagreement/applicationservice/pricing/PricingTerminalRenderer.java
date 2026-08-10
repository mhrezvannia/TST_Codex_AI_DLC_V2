package com.linercore.platform.chargeagreement.applicationservice.pricing;

import com.linercore.platform.chargeagreement.domain.model.PricingRequest;
import com.linercore.platform.chargeagreement.domain.model.PricingResult;
import com.linercore.platform.chargeagreement.domain.pricing.PricingTerminalReason;
import java.time.Instant;

public interface PricingTerminalRenderer {
    byte[] renderSuccess(PricingResult result);

    byte[] renderManual(
            PricingRequest request,
            PricingTerminalReason reason,
            String manualCaseId,
            Instant terminalAt);
}

package com.linercore.platform.chargeagreement.applicationservice.port;

import com.linercore.platform.chargeagreement.domain.model.AgreementId;
import com.linercore.platform.chargeagreement.domain.model.PricingLine;
import com.linercore.platform.chargeagreement.domain.model.PricingRequest;
import java.util.List;

public interface RateAuthorityPort {
    void validateAgreementApproval(AgreementId agreementId, long draftVersion);

    void promoteAgreementBinding(AgreementId agreementId, long draftVersion, long approvedVersion);

    List<PricingLine> pricingLines(AgreementId agreementId, long agreementVersion, PricingRequest request);
}

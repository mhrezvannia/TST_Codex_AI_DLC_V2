package com.linercore.platform.chargeagreement.applicationservice.port;

import com.linercore.platform.chargeagreement.domain.model.AgreementId;
import com.linercore.platform.chargeagreement.domain.model.AgreementRateBinding;
import java.util.Optional;

public interface AgreementRateBindingRepository {
    AgreementRateBinding replace(AgreementRateBinding binding);

    Optional<AgreementRateBinding> find(AgreementId agreementId, long agreementVersion);
}

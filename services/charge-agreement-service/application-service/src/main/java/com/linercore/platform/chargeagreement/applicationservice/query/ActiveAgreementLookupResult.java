package com.linercore.platform.chargeagreement.applicationservice.query;

import com.linercore.platform.chargeagreement.domain.model.AgreementId;
import com.linercore.platform.chargeagreement.domain.model.ChargeTerm;
import java.util.List;

public record ActiveAgreementLookupResult(boolean matched, AgreementId agreementId, List<ChargeTerm> terms) {
    public ActiveAgreementLookupResult {
        terms = terms == null ? List.of() : List.copyOf(terms);
    }

    public static ActiveAgreementLookupResult noMatch() {
        return new ActiveAgreementLookupResult(false, null, List.of());
    }
}

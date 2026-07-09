package com.linercore.platform.chargeagreement.applicationservice.port;

import com.linercore.platform.chargeagreement.applicationservice.query.AgreementSearchQuery;
import com.linercore.platform.chargeagreement.domain.model.AgreementId;
import com.linercore.platform.chargeagreement.domain.model.CustomerAgreement;
import com.linercore.platform.chargeagreement.domain.model.ReferenceId;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AgreementRepository {
    CustomerAgreement save(CustomerAgreement agreement);

    Optional<CustomerAgreement> findById(AgreementId id);

    List<CustomerAgreement> search(AgreementSearchQuery query);

    List<CustomerAgreement> findActiveCandidates(ReferenceId customerId, LocalDate effectiveDate);
}

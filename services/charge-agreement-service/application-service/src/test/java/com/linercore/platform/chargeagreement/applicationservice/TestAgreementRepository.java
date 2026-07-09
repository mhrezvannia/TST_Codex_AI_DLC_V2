package com.linercore.platform.chargeagreement.applicationservice;

import com.linercore.platform.chargeagreement.applicationservice.port.AgreementRepository;
import com.linercore.platform.chargeagreement.applicationservice.query.AgreementSearchQuery;
import com.linercore.platform.chargeagreement.domain.model.AgreementId;
import com.linercore.platform.chargeagreement.domain.model.AgreementStatus;
import com.linercore.platform.chargeagreement.domain.model.CustomerAgreement;
import com.linercore.platform.chargeagreement.domain.model.ReferenceId;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

class TestAgreementRepository implements AgreementRepository {
    private final Map<AgreementId, CustomerAgreement> records = new LinkedHashMap<>();

    public CustomerAgreement save(CustomerAgreement agreement) {
        records.put(agreement.id(), agreement);
        return agreement;
    }

    public Optional<CustomerAgreement> findById(AgreementId id) {
        return Optional.ofNullable(records.get(id));
    }

    public List<CustomerAgreement> search(AgreementSearchQuery query) {
        return records.values().stream()
                .filter(agreement -> query.includeInactive() || agreement.status() == AgreementStatus.APPROVED)
                .filter(agreement -> query.customerId() == null || agreement.customerId().value().equals(query.customerId()))
                .filter(agreement -> query.tradeLaneId() == null || agreement.tradeLaneId().value().equals(query.tradeLaneId()))
                .filter(agreement -> query.commodityId() == null || agreement.commodityId().value().equals(query.commodityId()))
                .filter(agreement -> query.status() == null || agreement.status() == query.status())
                .filter(agreement -> query.validOn() == null || agreement.validity().contains(query.validOn()))
                .skip((long) query.page() * query.size())
                .limit(query.size())
                .toList();
    }

    public List<CustomerAgreement> findActiveCandidates(ReferenceId customerId, LocalDate effectiveDate) {
        return records.values().stream()
                .filter(agreement -> agreement.customerId().equals(customerId))
                .filter(agreement -> agreement.isActiveOn(effectiveDate))
                .toList();
    }
}

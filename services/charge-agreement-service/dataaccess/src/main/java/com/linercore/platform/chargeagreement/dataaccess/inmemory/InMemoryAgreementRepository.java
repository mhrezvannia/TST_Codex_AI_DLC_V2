package com.linercore.platform.chargeagreement.dataaccess.inmemory;

import com.linercore.platform.chargeagreement.applicationservice.port.AgreementRepository;
import com.linercore.platform.chargeagreement.applicationservice.query.AgreementSearchQuery;
import com.linercore.platform.chargeagreement.domain.model.AgreementId;
import com.linercore.platform.chargeagreement.domain.model.AgreementStatus;
import com.linercore.platform.chargeagreement.domain.model.CustomerAgreement;
import com.linercore.platform.chargeagreement.domain.model.ReferenceId;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Stream;

public class InMemoryAgreementRepository implements AgreementRepository {
    private final Map<AgreementId, CustomerAgreement> records = new ConcurrentHashMap<>();

    public CustomerAgreement save(CustomerAgreement agreement) {
        records.put(agreement.id(), agreement);
        return agreement;
    }

    public Optional<CustomerAgreement> findById(AgreementId id) {
        return Optional.ofNullable(records.get(id));
    }

    public List<CustomerAgreement> search(AgreementSearchQuery query) {
        Stream<CustomerAgreement> stream = records.values().stream()
                .filter(agreement -> query.customerId() == null || agreement.customerId().value().equals(query.customerId()))
                .filter(agreement -> query.tradeLaneId() == null || agreement.tradeLaneId().value().equals(query.tradeLaneId()))
                .filter(agreement -> query.commodityId() == null || agreement.commodityId().value().equals(query.commodityId()))
                .filter(agreement -> query.status() == null || agreement.status() == query.status())
                .filter(agreement -> query.validOn() == null || agreement.validity().contains(query.validOn()));
        if (!query.includeInactive()) {
            stream = stream.filter(agreement -> agreement.status() != AgreementStatus.SUSPENDED
                    && agreement.status() != AgreementStatus.EXPIRED);
        }
        return stream.sorted(Comparator.comparing(agreement -> agreement.agreementNumber().value()))
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

package com.linercore.platform.chargeagreement.applicationservice.port;

import com.linercore.platform.chargeagreement.domain.agreement.Agreement;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementActivity;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementId;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementLifecycle;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AgreementAdminReadRepository {
    SearchPage search(SearchCriteria criteria);

    Optional<Agreement> findById(AgreementId agreementId);

    List<AgreementActivity> activity(AgreementId agreementId);

    record SearchCriteria(
            String customerId,
            String tradeLaneId,
            AgreementLifecycle lifecycle,
            LocalDate validOn,
            long offset,
            int limit) {
    }

    record SearchPage(List<Agreement> items, long total) {
        public SearchPage {
            items = List.copyOf(items);
        }
    }
}

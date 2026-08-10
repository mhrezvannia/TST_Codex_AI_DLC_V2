package com.linercore.platform.chargeagreement.applicationservice.pricing;

import com.linercore.platform.chargeagreement.domain.agreement.AgreementVersion;
import com.linercore.platform.chargeagreement.domain.pricing.ResolvedPricingAuthority;
import com.linercore.platform.chargeagreement.domain.rate.RateCategory;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface PricingAuthoritySnapshotPort {
    <T> T inRepeatableReadSnapshot(SnapshotWork<T> work);

    interface Snapshot {
        List<AgreementVersion> findAgreementCandidates(PricingAuthorityQuery query);

        AgreementVersion reloadAgreement(AgreementVersion candidate);

        List<ResolvedPricingAuthority.RateSource> reloadLinkedRates(AgreementVersion agreement);

        Map<RateCategory, List<ResolvedPricingAuthority.RateSource>> findTariffCandidates(
                PricingAuthorityQuery query);
    }

    @FunctionalInterface
    interface SnapshotWork<T> {
        T execute(Snapshot snapshot);
    }

    record PricingAuthorityQuery(
            String customerId,
            String tradeLaneId,
            String originLocationId,
            String destinationLocationId,
            String equipmentTypeId,
            LocalDate requestedDepartureDate) {
        public PricingAuthorityQuery {
            customerId = required(customerId, "customer id");
            tradeLaneId = required(tradeLaneId, "trade lane id");
            originLocationId = required(originLocationId, "origin location id");
            destinationLocationId = required(destinationLocationId, "destination location id");
            equipmentTypeId = required(equipmentTypeId, "equipment type id");
            if (requestedDepartureDate == null) {
                throw new IllegalArgumentException("requested departure date is required");
            }
        }

        private static String required(String value, String label) {
            if (value == null || value.isBlank()) {
                throw new IllegalArgumentException(label + " is required");
            }
            return value;
        }
    }
}

package com.linercore.platform.chargeagreement.applicationservice.port;

import com.linercore.platform.chargeagreement.domain.rate.Rate;
import com.linercore.platform.chargeagreement.domain.rate.RateActivity;
import com.linercore.platform.chargeagreement.domain.rate.RateId;
import com.linercore.platform.chargeagreement.domain.rate.RateCategory;
import com.linercore.platform.chargeagreement.domain.rate.RatePresentationState;
import com.linercore.platform.chargeagreement.domain.rate.RateVersion;
import com.linercore.platform.chargeagreement.domain.rate.RateVersionId;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

public interface RateRepository {
    void create(Rate rate, RateActivity activity);

    Rate updateDraft(Rate stableRate, RateVersion revisedVersion, RateActivity activity);

    Rate approveUnderLock(Rate stableRate, RateVersion approvedVersion, RateActivity activity);

    Rate createSuccessor(Rate stableRate, RateVersion sourceVersion, RateVersion successor, RateActivity activity);

    Optional<Rate> findById(RateId rateId);

    SearchPage search(SearchCriteria criteria);

    List<RateActivity> activities(RateId rateId);

    default List<PricingCandidate> findApprovedPricingCandidates(PricingCandidateQuery query) {
        throw new UnsupportedOperationException("pricing candidate lookup is unavailable");
    }

    default Optional<PricingCandidate> findApprovedPricingVersion(RateVersionId versionId) {
        throw new UnsupportedOperationException("exact approved pricing version lookup is unavailable");
    }

    record PricingCandidateQuery(
            RateCategory category,
            String originLocationId,
            String destinationLocationId,
            String equipmentTypeId,
            LocalDate requestedDepartureDate) {
        public PricingCandidateQuery {
            Objects.requireNonNull(category, "rate category is required");
            originLocationId = required(originLocationId, "origin location id");
            equipmentTypeId = required(equipmentTypeId, "equipment type id");
            Objects.requireNonNull(requestedDepartureDate, "requested departure date is required");
            if (category == RateCategory.LOCAL) {
                destinationLocationId = null;
            } else {
                destinationLocationId = required(destinationLocationId, "destination location id");
            }
        }
    }

    record PricingCandidate(RateCategory category, String chargeCode, RateVersion version) {
        public PricingCandidate {
            Objects.requireNonNull(category, "rate category is required");
            chargeCode = required(chargeCode, "charge code");
            Objects.requireNonNull(version, "rate version is required");
            if (version.lifecycle()
                    != com.linercore.platform.chargeagreement.domain.rate.RateLifecycle.APPROVED) {
                throw new IllegalArgumentException("pricing candidate must be Approved");
            }
        }
    }

    record SearchCriteria(
            RateCategory category,
            RatePresentationState lifecycle,
            LocalDate asOf,
            String originLocationId,
            String destinationLocationId,
            String equipmentTypeId,
            String query,
            long offset,
            int limit) {
    }

    record SearchPage(List<Rate> items, long total) {
    }

    private static String required(String value, String label) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(label + " is required");
        }
        return value;
    }
}

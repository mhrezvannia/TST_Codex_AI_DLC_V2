package com.linercore.platform.chargeagreement.applicationservice.port;

import com.linercore.platform.chargeagreement.domain.model.ManualPricingCase;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface ManualPricingCaseRepository {
    void save(ManualPricingCase manualPricingCase);

    default ManualPricingCase createOrGetOpen(ManualPricingCase proposedCase) {
        save(proposedCase);
        return proposedCase;
    }

    default ManualCasePage listOpen(ManualCaseQuery query) {
        throw new UnsupportedOperationException("manual case listing is unavailable");
    }

    default Optional<ManualPricingCase> findOpenById(String caseId) {
        throw new UnsupportedOperationException("manual case detail is unavailable");
    }

    record ManualCaseQuery(
            String reasonCode,
            String bookingRef,
            Instant openedFrom,
            Instant openedTo,
            int page,
            int size) {
        public ManualCaseQuery {
            if (page < 0) {
                throw new IllegalArgumentException("manual case page must not be negative");
            }
            if (size < 1 || size > 100) {
                throw new IllegalArgumentException("manual case size must be between 1 and 100");
            }
            if (openedFrom != null && openedTo != null && openedFrom.isAfter(openedTo)) {
                throw new IllegalArgumentException("openedFrom must not be after openedTo");
            }
        }

        public long offset() {
            return Math.multiplyExact((long) page, size);
        }
    }

    record ManualCasePage(List<ManualPricingCase> items, long total, int page, int size) {
        public ManualCasePage {
            items = List.copyOf(items);
        }
    }
}

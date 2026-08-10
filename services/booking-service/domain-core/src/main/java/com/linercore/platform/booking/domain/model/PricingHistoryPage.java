package com.linercore.platform.booking.domain.model;

import java.util.List;

public record PricingHistoryPage(
        PricingSnapshot current,
        List<PricingSnapshot> prior,
        String nextCursor) {
    public static final int MAX_PAGE_SIZE = 50;

    public PricingHistoryPage {
        prior = List.copyOf(prior == null ? List.of() : prior);
        if (prior.size() > MAX_PAGE_SIZE) {
            throw new IllegalArgumentException("pricing history page exceeds " + MAX_PAGE_SIZE);
        }
    }
}

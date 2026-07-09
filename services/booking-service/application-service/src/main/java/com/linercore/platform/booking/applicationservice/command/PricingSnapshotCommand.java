package com.linercore.platform.booking.applicationservice.command;

import java.util.Map;

public record PricingSnapshotCommand(
        String pricingRequestId,
        String pricingQuoteId,
        String status,
        Map<String, String> quotedAmounts,
        String actorSubjectId,
        String correlationId) {
}

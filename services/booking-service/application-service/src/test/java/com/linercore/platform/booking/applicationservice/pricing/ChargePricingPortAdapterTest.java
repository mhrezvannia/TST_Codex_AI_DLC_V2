package com.linercore.platform.booking.applicationservice.pricing;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.linercore.platform.booking.applicationservice.port.PricingOutcome;
import com.linercore.platform.booking.applicationservice.port.PricingRequestResult;
import com.linercore.platform.booking.domain.model.Booking;
import com.linercore.platform.booking.domain.model.BookingId;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class ChargePricingPortAdapterTest {
    private final Clock clock = Clock.fixed(Instant.parse("2026-07-01T10:15:30Z"), ZoneOffset.UTC);

    @Test
    void mapsSuccessfulChargeQuoteToBookingSnapshotResult() {
        CapturingClient client = new CapturingClient(new ChargePricingResponse("quote-1", "AGREEMENT",
                List.of(new ChargePricingLineItem("OCEAN-FRT", "CONTAINER", 2, "200.00", "USD")),
                false, null, "corr-1"));
        ChargePricingPortAdapter adapter = new ChargePricingPortAdapter(client, clock);

        PricingRequestResult result = adapter.requestPricing(booking(), "idem-price-1", "corr-1");

        assertEquals(PricingOutcome.PRICED, result.outcome());
        assertEquals("quote-1", result.pricingQuoteId());
        assertEquals("AGREEMENT", result.quotedAmounts().get("pricingBasis"));
        assertEquals("OCEAN-FRT", result.quotedAmounts().get("line.1.chargeCode"));
        assertEquals("corr-1", client.request.correlationId());
        assertEquals("idem-price-1", client.request.idempotencyKey());
        assertEquals(client.request.requestHash(), result.quotedAmounts().get("requestHash"));
    }

    @Test
    void mapsManualChargeResponseWithoutCalculatingPricing() {
        CapturingClient client = new CapturingClient(new ChargePricingResponse(null, "MANUAL", List.of(),
                true, "NO_ACTIVE_AGREEMENT", "corr-2"));
        ChargePricingPortAdapter adapter = new ChargePricingPortAdapter(client, clock);

        PricingRequestResult result = adapter.requestPricing(booking(), "idem-price-2", "corr-2");

        assertEquals(PricingOutcome.MANUAL_REQUIRED, result.outcome());
        assertEquals("NO_ACTIVE_AGREEMENT", result.reasonCode());
    }

    @Test
    void mapsTransientFailureForRetryableChargeOutage() {
        ChargePricingPortAdapter adapter = new ChargePricingPortAdapter(request -> {
            throw new ChargePricingClientException(ChargePricingFailureType.TRANSIENT,
                    "CHARGE_UNAVAILABLE", "Charge pricing unavailable");
        }, clock);

        PricingRequestResult result = adapter.requestPricing(booking(), "idem-price-3", "corr-3");

        assertEquals(PricingOutcome.TRANSIENT_FAILURE, result.outcome());
        assertEquals("CHARGE_UNAVAILABLE", result.reasonCode());
    }

    @Test
    void mapsDeniedFailureWithoutRetryClassification() {
        ChargePricingPortAdapter adapter = new ChargePricingPortAdapter(request -> {
            throw new ChargePricingClientException(ChargePricingFailureType.DENIED,
                    "SERVICE_IDENTITY_DENIED", "Charge denied service identity");
        }, clock);

        PricingRequestResult result = adapter.requestPricing(booking(), "idem-price-4", "corr-4");

        assertEquals(PricingOutcome.DENIED, result.outcome());
        assertEquals("SERVICE_IDENTITY_DENIED", result.reasonCode());
    }

    @Test
    void requestHashAndRequestIdAreStableForSameBookingAndIdempotencyKey() {
        CapturingClient firstClient = new CapturingClient(success("corr-5"));
        CapturingClient secondClient = new CapturingClient(success("corr-5"));
        ChargePricingPortAdapter first = new ChargePricingPortAdapter(firstClient, clock);
        ChargePricingPortAdapter second = new ChargePricingPortAdapter(secondClient, clock);

        PricingRequestResult firstResult = first.requestPricing(booking(), "idem-stable", "corr-5");
        PricingRequestResult secondResult = second.requestPricing(booking(), "idem-stable", "corr-5");

        assertEquals(firstClient.request.requestHash(), secondClient.request.requestHash());
        assertEquals(firstResult.pricingRequestId(), secondResult.pricingRequestId());
    }

    private ChargePricingResponse success(String correlationId) {
        return new ChargePricingResponse("quote-stable", "AGREEMENT",
                List.of(new ChargePricingLineItem("OCEAN-FRT", "CONTAINER", 1, "100.00", "USD")),
                false, null, correlationId);
    }

    private Booking booking() {
        return Booking.draft(new BookingId("booking-1"), "BKG-1", "customer-1", "loc-origin",
                "loc-destination", "40HC", Map.of("commodityId", "commodity-1", "tradeLaneId", "lane-1"),
                "booking-user", "corr-0", Instant.parse("2026-07-01T00:00:00Z"))
                .validated("booking-user", "corr-0", Instant.parse("2026-07-01T00:01:00Z"));
    }

    private static class CapturingClient implements ChargePricingClient {
        private final ChargePricingResponse response;
        private ChargePricingRequest request;

        private CapturingClient(ChargePricingResponse response) {
            this.response = response;
        }

        @Override
        public ChargePricingResponse quote(ChargePricingRequest request) {
            this.request = request;
            return response;
        }
    }
}

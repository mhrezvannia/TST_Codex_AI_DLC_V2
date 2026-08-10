package com.linercore.platform.booking.applicationservice.pricing;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

import com.linercore.platform.booking.applicationservice.port.PricingPortResult;
import com.linercore.platform.booking.domain.model.Booking;
import com.linercore.platform.booking.domain.model.BookingId;
import com.linercore.platform.booking.domain.model.EquipmentAssignment;
import com.linercore.platform.booking.domain.model.RoutingLeg;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class ChargePricingPortAdapterTest {
    private static final Instant PROVIDER_AT = Instant.parse("2026-07-01T10:15:30Z");
    private final Clock clock = Clock.fixed(
            Instant.parse("2026-07-01T10:15:31Z"), ZoneOffset.UTC);

    @Test
    void productionTypedPathPreservesEveryU04Field() {
        CapturingClient client = new CapturingClient(success("corr-typed"));
        ChargePricingPortAdapter adapter = new ChargePricingPortAdapter(client, clock);
        PricingAttempt attempt = attempt("corr-typed");

        var priced = assertInstanceOf(
                PricingPortResult.Priced.class, adapter.requestPricing(attempt));
        var snapshot = priced.snapshot();

        assertArrayEquals(attempt.canonicalBody(), client.bodies.get(0));
        assertEquals("BKG-1:0", client.keys.get(0));
        assertEquals(List.of("OFR", "BAF", "THC"),
                snapshot.lines().stream().map(line -> line.chargeCode()).toList());
        assertEquals(List.of(1, 1, 1),
                snapshot.lines().stream().map(line -> line.quantity()).toList());
        assertEquals(List.of(
                        new BigDecimal("200.00"),
                        new BigDecimal("40.00"),
                        new BigDecimal("20.00")),
                snapshot.lines().stream().map(line -> line.unitRate()).toList());
        assertEquals(new BigDecimal("260.00"), snapshot.total());
        assertEquals("USD", snapshot.currency());
        assertEquals("AGREEMENT", snapshot.pricingBasis());
        assertEquals("agreement-version-u04", snapshot.pricingRef());
        assertEquals("agreement-version-u04", snapshot.agreementVersionId());
        assertEquals(List.of("rv-base", "rv-baf", "rv-thc"),
                snapshot.lines().stream().map(line -> line.sourceRateVersionId()).toList());
        assertEquals(List.of("IMPORT_DEMURRAGE"), snapshot.applicableDndRuleTypes());
        assertEquals("BKG-1:0", snapshot.pricingRequestId());
        assertEquals(PROVIDER_AT, snapshot.pricedAt());
        assertEquals("corr-typed", snapshot.correlationId());
    }

    @Test
    void retryReusesByteIdenticalCapturedBodyAndProviderKey() {
        CapturingClient client = new CapturingClient(success("corr-retry"));
        client.failFirst = true;
        ChargePricingPortAdapter adapter = new ChargePricingPortAdapter(client, clock);
        PricingAttempt attempt = attempt("corr-retry");

        assertInstanceOf(PricingPortResult.Priced.class, adapter.requestPricing(attempt));

        assertEquals(2, client.bodies.size());
        assertArrayEquals(attempt.canonicalBody(), client.bodies.get(0));
        assertArrayEquals(client.bodies.get(0), client.bodies.get(1));
        assertEquals(List.of("BKG-1:0", "BKG-1:0"), client.keys);
    }

    @Test
    void exactNegativeOutcomeIsNotRelabeledManual() {
        ChargePricingPortAdapter adapter = new ChargePricingPortAdapter(
                (body, key, correlation) -> {
                    throw new ChargePricingClientException(
                            ChargePricingFailureType.VALIDATION,
                            "PRICING_VALIDATION",
                            "Provider rejected the request",
                            "BKG-1:0",
                            null,
                            correlation,
                            0);
                },
                clock);

        PricingPortResult result = adapter.requestPricing(attempt("corr-validation"));

        assertInstanceOf(PricingPortResult.Validation.class, result);
        assertEquals("PRICING_VALIDATION", result.reasonCode());
    }

    private PricingAttempt attempt(String correlationId) {
        PricingInput input = PricingInput.from(booking(), 0);
        return new PricingAttempt(
                booking(),
                input,
                input.canonicalBytes(),
                input.fingerprint(),
                input.providerKey(),
                correlationId);
    }

    private static ChargePricingResponse success(String correlationId) {
        return new ChargePricingResponse(
                "BKG-1",
                "AGREEMENT",
                "agreement-version-u04",
                List.of(
                        line("OFR", "FREIGHT", "BASE", "200.00", "200.00", "rv-base"),
                        line("BAF", "SURCHARGE", "SURCHARGE", "40.00", "40.00", "rv-baf"),
                        line("THC", "LOCAL", "LOCAL", "20.00", "20.00", "rv-thc")),
                List.of("IMPORT_DEMURRAGE"),
                new BigDecimal("260.00"),
                "USD",
                LocalDate.parse("2026-07-01"),
                "BKG-1:0",
                correlationId,
                PROVIDER_AT,
                "agreement-version-u04");
    }

    private static ChargePricingLineItem line(
            String code,
            String category,
            String rateCategory,
            String amount,
            String unitRate,
            String version) {
        return new ChargePricingLineItem(
                code,
                category,
                new BigDecimal(amount),
                "USD",
                rateCategory,
                "PER_CONTAINER",
                1,
                new BigDecimal(unitRate),
                version);
    }

    private static Booking booking() {
        return Booking.draft(
                        new BookingId("booking-1"),
                        "BKG-1",
                        "customer-1",
                        List.of(new RoutingLeg(1, "USNYC", "NLRTM", "voyage-1")),
                        List.of(new EquipmentAssignment("45G1", 1, "MSCU6639870")),
                        "USD",
                        "FCL_DRY",
                        false,
                        false,
                        Map.of(
                                "commodityId", "commodity-1",
                                "tradeLaneId", "lane-1",
                                "requestedDepartureDate", "2026-07-01"),
                        "booking-user",
                        "corr-0",
                        Instant.parse("2026-07-01T00:00:00Z"))
                .validated(
                        "booking-user",
                        "corr-0",
                        Instant.parse("2026-07-01T00:01:00Z"));
    }

    private static final class CapturingClient implements ChargePricingClient {
        private final ChargePricingResponse response;
        private final List<byte[]> bodies = new ArrayList<>();
        private final List<String> keys = new ArrayList<>();
        private boolean failFirst;

        private CapturingClient(ChargePricingResponse response) {
            this.response = response;
        }

        @Override
        public ChargePricingResponse quote(
                byte[] canonicalBody, String idempotencyKey, String correlationId) {
            bodies.add(canonicalBody.clone());
            keys.add(idempotencyKey);
            if (failFirst && bodies.size() == 1) {
                throw new ChargePricingClientException(
                        ChargePricingFailureType.TRANSIENT,
                        "PRICING_UNAVAILABLE",
                        "retry");
            }
            return response;
        }
    }
}

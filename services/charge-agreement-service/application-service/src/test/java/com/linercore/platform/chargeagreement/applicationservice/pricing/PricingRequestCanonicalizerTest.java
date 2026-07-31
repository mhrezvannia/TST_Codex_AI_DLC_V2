package com.linercore.platform.chargeagreement.applicationservice.pricing;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

import com.linercore.platform.chargeagreement.domain.model.PricingRequest;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class PricingRequestCanonicalizerTest {
    private static final String GOLDEN_JSON = """
            {"bookingRef":"BK-1","tradeLane":"lane-1","pol":"USNYC","pod":"NLRTM","equipmentType":"22G1","partyId":"party-1","commodityCode":"commodity-1","reeferIndicator":false,"dgIndicator":false,"dates":{"effectiveDate":"2026-08-01","requestedDepartureDate":"2026-08-01"},"quantities":{"equipmentQuantity":2,"teu":4,"amendmentSeq":2}}""";
    private static final String GOLDEN_SHA256 =
            "63ddf13301b7faf61caa355ff0408856a3bd69cd61b884b655f1175a674aaa62";
    private final PricingRequestCanonicalizer canonicalizer = new PricingRequestCanonicalizer();

    @Test
    void emitsContractOrderedUtf8GoldenVector() {
        PricingRequest request = request("party-1", 4, LocalDate.parse("2026-08-01"), "corr-1");

        assertEquals(GOLDEN_JSON, canonicalizer.canonicalJson(request));
        assertEquals(GOLDEN_SHA256, canonicalizer.hash(request));
    }

    @Test
    void hashIncludesBodyFieldsIncludingTeuAndBothContractDates() {
        PricingRequest baseline = request("party-1", 4, LocalDate.parse("2026-08-01"), "corr-1");

        assertNotEquals(canonicalizer.hash(baseline),
                canonicalizer.hash(request("party-2", 4, LocalDate.parse("2026-08-01"), "corr-1")));
        assertNotEquals(canonicalizer.hash(baseline),
                canonicalizer.hash(request("party-1", 5, LocalDate.parse("2026-08-01"), "corr-1")));
        assertNotEquals(canonicalizer.hash(baseline),
                canonicalizer.hash(request("party-1", 4, LocalDate.parse("2026-08-02"), "corr-1")));
    }

    @Test
    void transportCorrelationDoesNotChangeIdempotencyHash() {
        assertEquals(
                canonicalizer.hash(request("party-1", 4, LocalDate.parse("2026-08-01"), "corr-a")),
                canonicalizer.hash(request("party-1", 4, LocalDate.parse("2026-08-01"), "corr-b")));
    }

    private PricingRequest request(String partyId, int teu, LocalDate departureDate, String correlationId) {
        return new PricingRequest(
                "BK-1", "lane-1", "USNYC", "NLRTM", "22G1", partyId, "commodity-1",
                false, false, new PricingRequest.PricingDates(departureDate, departureDate),
                new PricingRequest.PricingQuantities(2, teu, 2), correlationId);
    }
}

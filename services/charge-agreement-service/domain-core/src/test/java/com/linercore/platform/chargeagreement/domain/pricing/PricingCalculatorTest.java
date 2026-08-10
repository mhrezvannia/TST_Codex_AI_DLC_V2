package com.linercore.platform.chargeagreement.domain.pricing;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.linercore.platform.chargeagreement.domain.agreement.AgreementVersionId;
import com.linercore.platform.chargeagreement.domain.model.ChargeCategory;
import com.linercore.platform.chargeagreement.domain.model.PricingRequest;
import com.linercore.platform.chargeagreement.domain.model.PricingResult;
import com.linercore.platform.chargeagreement.domain.model.ReferenceId;
import com.linercore.platform.chargeagreement.domain.rate.RateApplicability;
import com.linercore.platform.chargeagreement.domain.rate.RateBasis;
import com.linercore.platform.chargeagreement.domain.rate.RateCategory;
import com.linercore.platform.chargeagreement.domain.rate.RateId;
import com.linercore.platform.chargeagreement.domain.rate.RateLifecycle;
import com.linercore.platform.chargeagreement.domain.rate.RateMoney;
import com.linercore.platform.chargeagreement.domain.rate.RateVersion;
import com.linercore.platform.chargeagreement.domain.rate.RateVersionId;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;

class PricingCalculatorTest {
    private static final Instant TERMINAL_AT = Instant.parse("2026-07-28T08:00:00Z");
    private final PricingCalculator calculator = new PricingCalculator();

    @Test
    void calculatesOrderedAgreementLinesAndTotalsForEquipmentQuantity() {
        PricingRequest request = request(3);
        ResolvedPricingAuthority authority = ResolvedPricingAuthority.agreement(
                new AgreementVersionId("av-1"),
                List.of(
                        source(RateCategory.LOCAL, "THC", "rv-thc", "10.01"),
                        source(RateCategory.BASE, "OFR", "rv-base", "100.01"),
                        source(RateCategory.SURCHARGE, "BAF", "rv-baf", "20.01")));

        var result = calculator.calculate(authority, request, "corr-1", TERMINAL_AT);

        assertEquals(List.of(RateCategory.BASE, RateCategory.SURCHARGE, RateCategory.LOCAL),
                result.lines().stream().map(line -> line.rateCategory()).toList());
        assertEquals(List.of(ChargeCategory.FREIGHT, ChargeCategory.SURCHARGE, ChargeCategory.LOCAL),
                result.lines().stream().map(line -> line.category()).toList());
        assertEquals(List.of(new BigDecimal("300.03"), new BigDecimal("60.03"), new BigDecimal("30.03")),
                result.lines().stream().map(line -> line.amount().amount()).toList());
        assertEquals(new BigDecimal("390.09"), result.totalAmount());
        assertEquals("AGREEMENT", result.pricingBasis());
        assertEquals("av-1", result.pricingRef());
        assertEquals("av-1", result.agreementVersionId());
        assertEquals("BK-1:2", result.pricingRequestId());
        assertEquals(TERMINAL_AT, result.pricedAt());
    }

    @Test
    void createsDeterministicTariffReferenceForQuantityOne() {
        ResolvedPricingAuthority authority = ResolvedPricingAuthority.tariff(List.of(
                source(RateCategory.BASE, "OFR", "rv-base", "100.00"),
                source(RateCategory.SURCHARGE, "BAF", "rv-baf", "20.00"),
                source(RateCategory.LOCAL, "THC", "rv-thc", "10.00")));

        var result = calculator.calculate(authority, request(1), "corr-1", TERMINAL_AT);

        assertEquals("TARIFF-c676b4e4472631fbdd069424", result.pricingRef());
        assertEquals(new BigDecimal("130.00"), result.totalAmount());
        assertEquals(null, result.agreementVersionId());
    }

    @Test
    void rejectsZeroMoneyAndDateMismatch() {
        ResolvedPricingAuthority zeroAuthority = ResolvedPricingAuthority.tariff(List.of(
                source(RateCategory.BASE, "OFR", "rv-base", "0.00"),
                source(RateCategory.SURCHARGE, "BAF", "rv-baf", "20.00"),
                source(RateCategory.LOCAL, "THC", "rv-thc", "10.00")));
        assertThrows(IllegalArgumentException.class,
                () -> calculator.calculate(zeroAuthority, request(1), "corr-1", TERMINAL_AT));

        assertThrows(IllegalArgumentException.class, () -> new PricingRequest.PricingDates(
                LocalDate.parse("2026-08-01"), LocalDate.parse("2026-08-02")));
    }

    @Test
    void quantityOneKeepsUnitRatesAndSumsRoundedLineAmounts() {
        ResolvedPricingAuthority authority = ResolvedPricingAuthority.tariff(List.of(
                source(RateCategory.BASE, "OFR", "rv-base", "100.01"),
                source(RateCategory.SURCHARGE, "BAF", "rv-baf", "20.02"),
                source(RateCategory.LOCAL, "THC", "rv-thc", "10.03")));

        PricingResult result = calculator.calculate(authority, request(1), "corr-1", TERMINAL_AT);

        assertEquals(List.of(new BigDecimal("100.01"), new BigDecimal("20.02"), new BigDecimal("10.03")),
                result.lines().stream().map(line -> line.unitRate()).toList());
        assertEquals(List.of(new BigDecimal("100.01"), new BigDecimal("20.02"), new BigDecimal("10.03")),
                result.lines().stream().map(line -> line.amount().amount()).toList());
        assertEquals(new BigDecimal("130.06"), result.totalAmount());
        assertEquals(2, result.totalAmount().scale());
    }

    @Test
    void rejectsIncompleteDuplicateAndNonUsdAuthorityEvidence() {
        assertThrows(IllegalArgumentException.class, () -> ResolvedPricingAuthority.tariff(List.of(
                source(RateCategory.BASE, "OFR", "rv-base", "100.00"),
                source(RateCategory.SURCHARGE, "BAF", "rv-baf", "20.00"))));
        assertThrows(IllegalArgumentException.class, () -> ResolvedPricingAuthority.tariff(List.of(
                source(RateCategory.BASE, "OFR", "rv-base-a", "100.00"),
                source(RateCategory.BASE, "OFR", "rv-base-b", "101.00"),
                source(RateCategory.LOCAL, "THC", "rv-thc", "10.00"))));
        assertThrows(IllegalArgumentException.class,
                () -> new RateMoney(new BigDecimal("1.00"), new ReferenceId("currency-eur"), "EUR"));
    }

    @Test
    void completeSuccessRejectsWrongLineOrderMissingTimeAndCorrelationMismatch() {
        PricingResult result = calculator.calculate(ResolvedPricingAuthority.tariff(List.of(
                source(RateCategory.BASE, "OFR", "rv-base", "100.00"),
                source(RateCategory.SURCHARGE, "BAF", "rv-baf", "20.00"),
                source(RateCategory.LOCAL, "THC", "rv-thc", "10.00"))),
                request(1), "corr-1", TERMINAL_AT);
        List<com.linercore.platform.chargeagreement.domain.model.PricingLine> wrongOrder = List.of(
                result.lines().get(1), result.lines().get(0), result.lines().get(2));

        assertThrows(IllegalArgumentException.class, () -> PricingResult.w2Priced(
                result.pricingRequestId(), result.bookingRef(), result.pricingBasis(), result.pricingRef(),
                null, result.requestedDepartureDate(), wrongOrder, result.correlationId(), TERMINAL_AT));
        assertThrows(NullPointerException.class, () -> PricingResult.w2Priced(
                result.pricingRequestId(), result.bookingRef(), result.pricingBasis(), result.pricingRef(),
                null, result.requestedDepartureDate(), result.lines(), result.correlationId(), null));
        assertThrows(IllegalArgumentException.class, () -> calculator.calculate(
                ResolvedPricingAuthority.tariff(List.of(
                        source(RateCategory.BASE, "OFR", "rv-base", "100.00"),
                        source(RateCategory.SURCHARGE, "BAF", "rv-baf", "20.00"),
                        source(RateCategory.LOCAL, "THC", "rv-thc", "10.00"))),
                request(1), "corr-other", TERMINAL_AT));
    }

    private PricingRequest request(int equipmentQuantity) {
        LocalDate date = LocalDate.parse("2026-08-01");
        return new PricingRequest(
                "BK-1", "lane-1", "USNYC", "NLRTM", "22G1", "party-1", "commodity-1",
                false, false, new PricingRequest.PricingDates(date, date),
                new PricingRequest.PricingQuantities(equipmentQuantity, 2, 2), "corr-1");
    }

    private ResolvedPricingAuthority.RateSource source(
            RateCategory category,
            String code,
            String versionId,
            String amount) {
        ReferenceId origin = new ReferenceId("USNYC");
        ReferenceId destination = category == RateCategory.LOCAL ? null : new ReferenceId("NLRTM");
        RateVersion version = new RateVersion(
                new RateVersionId(versionId),
                new RateId("rate-" + versionId),
                1,
                RateLifecycle.APPROVED,
                RateBasis.PER_CONTAINER,
                new RateMoney(new BigDecimal(amount), new ReferenceId("currency-usd"), "USD"),
                LocalDate.parse("2026-01-01"),
                LocalDate.parse("2026-12-31"),
                RateApplicability.forCategory(category, origin, destination, new ReferenceId("22G1")),
                1,
                null,
                "analyst",
                Instant.parse("2026-01-01T00:00:00Z"),
                null,
                null,
                "approver",
                Instant.parse("2026-01-02T00:00:00Z"),
                "corr-source");
        return new ResolvedPricingAuthority.RateSource(category, code, version);
    }
}

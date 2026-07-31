package com.linercore.platform.chargeagreement.applicationservice.pricing;

import com.linercore.platform.chargeagreement.domain.agreement.AgreementAuthorityModel;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementId;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementLifecycle;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementRateLink;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementValidity;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementVersion;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementVersionId;
import com.linercore.platform.chargeagreement.domain.model.ManualPricingCase;
import com.linercore.platform.chargeagreement.domain.model.PricingRequest;
import com.linercore.platform.chargeagreement.domain.model.ReferenceId;
import com.linercore.platform.chargeagreement.domain.pricing.ResolvedPricingAuthority;
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
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * U04 fixture factory built from the U01 Rate and U03 Agreement domain types.
 * It deliberately contains no duplicate pricing authority model.
 */
final class U04PricingTestFixtures {
    static final LocalDate REQUESTED_DEPARTURE = LocalDate.parse("2026-08-01");
    static final Instant TERMINAL_AT = Instant.parse("2026-07-28T08:00:00Z");
    static final String REQUEST_HASH = "a".repeat(64);

    private U04PricingTestFixtures() {
    }

    static PricingRequest request() {
        return new PricingRequest(
                "BK-U04", "lane-1", "USNYC", "NLRTM", "22G1", "party-1", "commodity-1",
                false, false, new PricingRequest.PricingDates(REQUESTED_DEPARTURE, REQUESTED_DEPARTURE),
                new PricingRequest.PricingQuantities(2, 4, 3), "corr-u04");
    }

    static AgreementAuthority approvedAgreementWithThreeLinkedRates() {
        List<ResolvedPricingAuthority.RateSource> sources = completeTariff();
        AgreementVersion agreement = new AgreementVersion(
                new AgreementVersionId("agreement-version-u04"),
                new AgreementId("agreement-u04"),
                1,
                AgreementAuthorityModel.W2_VERSIONED,
                AgreementLifecycle.APPROVED,
                new ReferenceId("party-1"),
                new ReferenceId("lane-1"),
                new ReferenceId("USNYC"),
                new ReferenceId("NLRTM"),
                new ReferenceId("22G1"),
                null,
                new AgreementValidity(LocalDate.parse("2026-01-01"), LocalDate.parse("2026-12-31")),
                sources.stream()
                        .map(source -> new AgreementRateLink(source.category(), source.version().id()))
                        .toList(),
                1,
                null,
                "analyst",
                Instant.parse("2026-01-01T00:00:00Z"),
                null,
                null,
                "approver",
                Instant.parse("2026-01-02T00:00:00Z"),
                "corr-agreement-u04");
        return new AgreementAuthority(agreement, sources);
    }

    static List<ResolvedPricingAuthority.RateSource> completeTariff() {
        return List.of(
                source(RateCategory.BASE, "OFR", "rate-version-base-u04", "100.00"),
                source(RateCategory.SURCHARGE, "BAF", "rate-version-surcharge-u04", "20.00"),
                source(RateCategory.LOCAL, "THC", "rate-version-local-u04", "10.00"));
    }

    static Map<RateCategory, List<ResolvedPricingAuthority.RateSource>> missing(RateCategory category) {
        EnumMap<RateCategory, List<ResolvedPricingAuthority.RateSource>> candidates = completeCandidates();
        candidates.put(category, List.of());
        return candidates;
    }

    static Map<RateCategory, List<ResolvedPricingAuthority.RateSource>> ambiguous(RateCategory category) {
        EnumMap<RateCategory, List<ResolvedPricingAuthority.RateSource>> candidates = completeCandidates();
        String code = switch (category) {
            case BASE -> "OFR";
            case SURCHARGE -> "BAF";
            case LOCAL -> "THC";
        };
        candidates.put(category, List.of(
                source(category, code, "ambiguous-a-" + category.name().toLowerCase(), "10.00"),
                source(category, code, "ambiguous-b-" + category.name().toLowerCase(), "11.00")));
        return candidates;
    }

    static Map<RateCategory, List<ResolvedPricingAuthority.RateSource>> mixedMissingAndAmbiguous() {
        EnumMap<RateCategory, List<ResolvedPricingAuthority.RateSource>> candidates =
                new EnumMap<>(ambiguous(RateCategory.SURCHARGE));
        candidates.put(RateCategory.BASE, List.of());
        return candidates;
    }

    static LegacyReceiptRow legacyReceiptRow() {
        return new LegacyReceiptRow(
                request().pricingRequestId(), request().bookingRef(), request().quantities().amendmentSeq(),
                REQUEST_HASH, "COMPLETED", "{\"legacy\":true}".getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    static ManualPricingCase canonicalBackfilledWinner() {
        return new ManualPricingCase(
                "legacy-case-winner", request().pricingRequestId(), "NO_RATE", null, null);
    }

    private static EnumMap<RateCategory, List<ResolvedPricingAuthority.RateSource>> completeCandidates() {
        EnumMap<RateCategory, List<ResolvedPricingAuthority.RateSource>> candidates =
                new EnumMap<>(RateCategory.class);
        completeTariff().forEach(source -> candidates.put(source.category(), List.of(source)));
        return candidates;
    }

    private static ResolvedPricingAuthority.RateSource source(
            RateCategory category,
            String chargeCode,
            String versionId,
            String amount) {
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
                RateApplicability.forCategory(
                        category, new ReferenceId("USNYC"), destination, new ReferenceId("22G1")),
                1,
                null,
                "analyst",
                Instant.parse("2026-01-01T00:00:00Z"),
                null,
                null,
                "approver",
                Instant.parse("2026-01-02T00:00:00Z"),
                "corr-rate-u04");
        return new ResolvedPricingAuthority.RateSource(category, chargeCode, version);
    }

    record AgreementAuthority(
            AgreementVersion agreement,
            List<ResolvedPricingAuthority.RateSource> linkedRates) {
    }

    record LegacyReceiptRow(
            String idempotencyKey,
            String bookingRef,
            int amendmentSeq,
            String requestHash,
            String status,
            byte[] responseSnapshot) {
        LegacyReceiptRow {
            responseSnapshot = responseSnapshot.clone();
        }

        @Override
        public byte[] responseSnapshot() {
            return responseSnapshot.clone();
        }
    }
}

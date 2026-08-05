package com.linercore.platform.chargeagreement.applicationservice.pricing;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

import com.linercore.platform.chargeagreement.applicationservice.pricing.PricingAuthoritySnapshotPort.PricingAuthorityQuery;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementAuthorityModel;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementId;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementLifecycle;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementRateLink;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementValidity;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementVersion;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementVersionId;
import com.linercore.platform.chargeagreement.domain.model.PricingRequest;
import com.linercore.platform.chargeagreement.domain.model.ReferenceId;
import com.linercore.platform.chargeagreement.domain.pricing.PricingResolution;
import com.linercore.platform.chargeagreement.domain.pricing.PricingTerminalReason;
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
import org.junit.jupiter.api.Test;

class PricingAuthorityResolverTest {

    @Test
    void agreementWinsAndTariffIsNeverRead() {
        ProbeSnapshot snapshot = new ProbeSnapshot();
        snapshot.agreements = List.of(agreement("av-1"));
        snapshot.linkedRates = sources("av-1");
        PricingAuthorityResolver resolver = new PricingAuthorityResolver(port(snapshot));

        PricingResolution.Priced priced = assertInstanceOf(PricingResolution.Priced.class,
                resolver.resolve(request()));

        assertEquals(ResolvedPricingAuthority.Basis.AGREEMENT, priced.authority().basis());
        assertEquals("av-1", priced.authority().pricingRef());
        assertEquals(0, snapshot.tariffReads);
    }

    @Test
    void agreementAmbiguityStopsBeforeTariff() {
        ProbeSnapshot snapshot = new ProbeSnapshot();
        snapshot.agreements = List.of(agreement("av-1"), agreement("av-2"));
        PricingAuthorityResolver resolver = new PricingAuthorityResolver(port(snapshot));

        PricingResolution.Manual manual = assertInstanceOf(PricingResolution.Manual.class,
                resolver.resolve(request()));

        assertEquals(PricingTerminalReason.AMBIGUOUS_AGREEMENT_AUTHORITY, manual.reason());
        assertEquals(0, snapshot.tariffReads);
    }

    @Test
    void completeTariffUsesAllThreeExactSources() {
        ProbeSnapshot snapshot = new ProbeSnapshot();
        snapshot.tariffs = candidateMap(sources("t"));
        PricingAuthorityResolver resolver = new PricingAuthorityResolver(port(snapshot));

        PricingResolution.Priced priced = assertInstanceOf(PricingResolution.Priced.class,
                resolver.resolve(request()));

        assertEquals(ResolvedPricingAuthority.Basis.TARIFF, priced.authority().basis());
        assertEquals(1, snapshot.tariffReads);
        assertEquals(List.of(RateCategory.BASE, RateCategory.SURCHARGE, RateCategory.LOCAL),
                priced.authority().sources().stream().map(ResolvedPricingAuthority.RateSource::category).toList());
    }

    @Test
    void ambiguityPrecedesMissingInBaseSurchargeLocalOrder() {
        ProbeSnapshot snapshot = new ProbeSnapshot();
        EnumMap<RateCategory, List<ResolvedPricingAuthority.RateSource>> candidates =
                new EnumMap<>(RateCategory.class);
        candidates.put(RateCategory.BASE, List.of());
        candidates.put(RateCategory.SURCHARGE, List.of(
                source(RateCategory.SURCHARGE, "BAF", "rv-baf-1"),
                source(RateCategory.SURCHARGE, "BAF", "rv-baf-2")));
        candidates.put(RateCategory.LOCAL, List.of(
                source(RateCategory.LOCAL, "THC", "rv-thc-1"),
                source(RateCategory.LOCAL, "THC", "rv-thc-2")));
        snapshot.tariffs = candidates;
        PricingAuthorityResolver resolver = new PricingAuthorityResolver(port(snapshot));

        PricingResolution.Manual manual = assertInstanceOf(PricingResolution.Manual.class,
                resolver.resolve(request()));

        assertEquals(PricingTerminalReason.AMBIGUOUS_SURCHARGE_RATE, manual.reason());
    }

    @Test
    void missingCategoryWithoutAnyAmbiguityIsNoRate() {
        ProbeSnapshot snapshot = new ProbeSnapshot();
        snapshot.tariffs = candidateMap(sources("t"));
        snapshot.tariffs.put(RateCategory.LOCAL, List.of());
        PricingAuthorityResolver resolver = new PricingAuthorityResolver(port(snapshot));

        PricingResolution.Manual manual = assertInstanceOf(PricingResolution.Manual.class,
                resolver.resolve(request()));

        assertEquals(PricingTerminalReason.NO_RATE, manual.reason());
    }

    @Test
    void linkedAgreementAuthorityMismatchFailsClosedAsUnavailable() {
        ProbeSnapshot snapshot = new ProbeSnapshot();
        snapshot.agreements = List.of(agreement("av-1"));
        snapshot.linkedRates = sources("different-links");

        PricingResolution.Unavailable unavailable = assertInstanceOf(PricingResolution.Unavailable.class,
                new PricingAuthorityResolver(port(snapshot)).resolve(request()));

        assertEquals("AGREEMENT_AUTHORITY_INTEGRITY", unavailable.reason());
        assertEquals(0, snapshot.tariffReads);
    }

    @Test
    void tariffAmbiguityUsesBaseThenSurchargeThenLocalPrecedence() {
        ProbeSnapshot baseSnapshot = new ProbeSnapshot();
        baseSnapshot.tariffs = candidateMap(sources("base-order"));
        baseSnapshot.tariffs.put(RateCategory.BASE, List.of(
                source(RateCategory.BASE, "OFR", "rv-base-1"),
                source(RateCategory.BASE, "OFR", "rv-base-2")));
        baseSnapshot.tariffs.put(RateCategory.SURCHARGE, List.of(
                source(RateCategory.SURCHARGE, "BAF", "rv-baf-1"),
                source(RateCategory.SURCHARGE, "BAF", "rv-baf-2")));
        PricingResolution.Manual base = assertInstanceOf(PricingResolution.Manual.class,
                new PricingAuthorityResolver(port(baseSnapshot)).resolve(request()));
        assertEquals(PricingTerminalReason.AMBIGUOUS_BASE_RATE, base.reason());

        ProbeSnapshot localSnapshot = new ProbeSnapshot();
        localSnapshot.tariffs = candidateMap(sources("local-order"));
        localSnapshot.tariffs.put(RateCategory.LOCAL, List.of(
                source(RateCategory.LOCAL, "THC", "rv-thc-1"),
                source(RateCategory.LOCAL, "THC", "rv-thc-2")));
        PricingResolution.Manual local = assertInstanceOf(PricingResolution.Manual.class,
                new PricingAuthorityResolver(port(localSnapshot)).resolve(request()));
        assertEquals(PricingTerminalReason.AMBIGUOUS_LOCAL_RATE, local.reason());
    }

    private PricingAuthoritySnapshotPort port(ProbeSnapshot snapshot) {
        return new PricingAuthoritySnapshotPort() {
            @Override
            public <T> T inRepeatableReadSnapshot(SnapshotWork<T> work) {
                return work.execute(snapshot);
            }
        };
    }

    private PricingRequest request() {
        LocalDate date = LocalDate.parse("2026-08-01");
        return new PricingRequest(
                "BK-1", "lane-1", "USNYC", "NLRTM", "22G1", "party-1", "commodity-1",
                false, false, new PricingRequest.PricingDates(date, date),
                new PricingRequest.PricingQuantities(2, 4, 0), "corr-1");
    }

    private AgreementVersion agreement(String versionId) {
        List<ResolvedPricingAuthority.RateSource> sources = sources(versionId);
        return new AgreementVersion(
                new AgreementVersionId(versionId),
                new AgreementId("agreement-" + versionId),
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
                "corr-agreement");
    }

    private List<ResolvedPricingAuthority.RateSource> sources(String suffix) {
        return List.of(
                source(RateCategory.BASE, "OFR", "rv-base-" + suffix),
                source(RateCategory.SURCHARGE, "BAF", "rv-baf-" + suffix),
                source(RateCategory.LOCAL, "THC", "rv-thc-" + suffix));
    }

    private ResolvedPricingAuthority.RateSource source(RateCategory category, String code, String id) {
        ReferenceId destination = category == RateCategory.LOCAL ? null : new ReferenceId("NLRTM");
        RateVersion version = new RateVersion(
                new RateVersionId(id),
                new RateId("rate-" + id),
                1,
                RateLifecycle.APPROVED,
                RateBasis.PER_CONTAINER,
                new RateMoney(new BigDecimal("10.00"), new ReferenceId("currency-usd"), "USD"),
                LocalDate.parse("2026-01-01"),
                LocalDate.parse("2026-12-31"),
                RateApplicability.forCategory(category, new ReferenceId("USNYC"), destination,
                        new ReferenceId("22G1")),
                1,
                null,
                "analyst",
                Instant.parse("2026-01-01T00:00:00Z"),
                null,
                null,
                "approver",
                Instant.parse("2026-01-02T00:00:00Z"),
                "corr-rate");
        return new ResolvedPricingAuthority.RateSource(category, code, version);
    }

    private EnumMap<RateCategory, List<ResolvedPricingAuthority.RateSource>> candidateMap(
            List<ResolvedPricingAuthority.RateSource> sources) {
        EnumMap<RateCategory, List<ResolvedPricingAuthority.RateSource>> result =
                new EnumMap<>(RateCategory.class);
        sources.forEach(source -> result.put(source.category(), List.of(source)));
        return result;
    }

    private static final class ProbeSnapshot implements PricingAuthoritySnapshotPort.Snapshot {
        private List<AgreementVersion> agreements = List.of();
        private List<ResolvedPricingAuthority.RateSource> linkedRates = List.of();
        private EnumMap<RateCategory, List<ResolvedPricingAuthority.RateSource>> tariffs =
                new EnumMap<>(RateCategory.class);
        private int tariffReads;

        @Override
        public List<AgreementVersion> findAgreementCandidates(PricingAuthorityQuery query) {
            return agreements;
        }

        @Override
        public AgreementVersion reloadAgreement(AgreementVersion candidate) {
            return candidate;
        }

        @Override
        public List<ResolvedPricingAuthority.RateSource> reloadLinkedRates(AgreementVersion agreement) {
            return linkedRates;
        }

        @Override
        public Map<RateCategory, List<ResolvedPricingAuthority.RateSource>> findTariffCandidates(
                PricingAuthorityQuery query) {
            tariffReads++;
            return tariffs;
        }
    }
}

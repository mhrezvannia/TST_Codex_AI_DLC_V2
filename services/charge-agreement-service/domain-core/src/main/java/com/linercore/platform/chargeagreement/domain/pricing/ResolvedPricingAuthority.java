package com.linercore.platform.chargeagreement.domain.pricing;

import com.linercore.platform.chargeagreement.domain.agreement.AgreementVersionId;
import com.linercore.platform.chargeagreement.domain.rate.RateBasis;
import com.linercore.platform.chargeagreement.domain.rate.RateCategory;
import com.linercore.platform.chargeagreement.domain.rate.RateLifecycle;
import com.linercore.platform.chargeagreement.domain.rate.RateVersion;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.HexFormat;
import java.util.List;
import java.util.Objects;

public record ResolvedPricingAuthority(
        Basis basis,
        AgreementVersionId agreementVersionId,
        List<RateSource> sources) {

    public ResolvedPricingAuthority {
        Objects.requireNonNull(basis, "pricing basis is required");
        sources = List.copyOf(sources == null ? List.of() : sources);
        if (sources.size() != RateCategory.values().length) {
            throw new IllegalArgumentException("pricing authority requires exactly three sources");
        }
        EnumSet<RateCategory> categories = sources.stream()
                .map(RateSource::category)
                .collect(java.util.stream.Collectors.toCollection(() -> EnumSet.noneOf(RateCategory.class)));
        if (!categories.equals(EnumSet.allOf(RateCategory.class))) {
            throw new IllegalArgumentException("pricing authority requires distinct BASE, SURCHARGE, and LOCAL sources");
        }
        sources = ordered(sources);
        if (basis == Basis.AGREEMENT && agreementVersionId == null) {
            throw new IllegalArgumentException("agreement authority requires an agreement version id");
        }
        if (basis == Basis.TARIFF && agreementVersionId != null) {
            throw new IllegalArgumentException("tariff authority cannot carry an agreement version id");
        }
    }

    public static ResolvedPricingAuthority agreement(
            AgreementVersionId agreementVersionId,
            List<RateSource> sources) {
        return new ResolvedPricingAuthority(Basis.AGREEMENT, agreementVersionId, sources);
    }

    public static ResolvedPricingAuthority tariff(List<RateSource> sources) {
        return new ResolvedPricingAuthority(Basis.TARIFF, null, sources);
    }

    public String pricingRef() {
        if (basis == Basis.AGREEMENT) {
            return agreementVersionId.value();
        }
        String source = sources.stream()
                .map(rate -> rate.version().id().value())
                .collect(java.util.stream.Collectors.joining("|"));
        return "TARIFF-" + sha256(source).substring(0, 24);
    }

    private static List<RateSource> ordered(List<RateSource> sources) {
        EnumMap<RateCategory, RateSource> byCategory = new EnumMap<>(RateCategory.class);
        sources.forEach(source -> byCategory.put(source.category(), source));
        return List.of(
                byCategory.get(RateCategory.BASE),
                byCategory.get(RateCategory.SURCHARGE),
                byCategory.get(RateCategory.LOCAL));
    }

    private static String sha256(String value) {
        try {
            return HexFormat.of().formatHex(
                    MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    public enum Basis {
        AGREEMENT,
        TARIFF
    }

    public record RateSource(RateCategory category, String chargeCode, RateVersion version) {
        public RateSource {
            Objects.requireNonNull(category, "rate category is required");
            if (chargeCode == null || chargeCode.isBlank()) {
                throw new IllegalArgumentException("charge code is required");
            }
            category.requireChargeCode(chargeCode);
            Objects.requireNonNull(version, "rate version is required");
            if (version.lifecycle() != RateLifecycle.APPROVED) {
                throw new IllegalArgumentException("pricing sources must be Approved");
            }
            if (version.basis() != RateBasis.PER_CONTAINER) {
                throw new IllegalArgumentException("pricing sources must use PER_CONTAINER");
            }
        }
    }
}

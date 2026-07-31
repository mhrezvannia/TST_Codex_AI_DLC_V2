package com.linercore.platform.chargeagreement.applicationservice.pricing;

import com.linercore.platform.chargeagreement.applicationservice.pricing.PricingAuthoritySnapshotPort.PricingAuthorityQuery;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementAuthorityModel;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementLifecycle;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementVersion;
import com.linercore.platform.chargeagreement.domain.model.PricingRequest;
import com.linercore.platform.chargeagreement.domain.pricing.PricingResolution;
import com.linercore.platform.chargeagreement.domain.pricing.PricingTerminalReason;
import com.linercore.platform.chargeagreement.domain.pricing.ResolvedPricingAuthority;
import com.linercore.platform.chargeagreement.domain.rate.RateCategory;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

public final class PricingAuthorityResolver {
    private final PricingAuthoritySnapshotPort snapshots;

    public PricingAuthorityResolver(PricingAuthoritySnapshotPort snapshots) {
        this.snapshots = Objects.requireNonNull(snapshots, "pricing snapshot port is required");
    }

    public PricingResolution resolve(PricingRequest request) {
        Objects.requireNonNull(request, "pricing request is required");
        PricingAuthorityQuery query = new PricingAuthorityQuery(
                request.partyId(),
                request.tradeLane(),
                request.pol(),
                request.pod(),
                request.equipmentType(),
                request.requestedDepartureDate());
        return snapshots.inRepeatableReadSnapshot(snapshot -> resolve(snapshot, query));
    }

    private PricingResolution resolve(PricingAuthoritySnapshotPort.Snapshot snapshot, PricingAuthorityQuery query) {
        List<AgreementVersion> agreements = bounded(snapshot.findAgreementCandidates(query));
        if (agreements.size() > 1) {
            return new PricingResolution.Manual(PricingTerminalReason.AMBIGUOUS_AGREEMENT_AUTHORITY);
        }
        if (agreements.size() == 1) {
            return resolveAgreement(snapshot, agreements.get(0), query);
        }
        return resolveTariff(snapshot.findTariffCandidates(query));
    }

    private PricingResolution resolveAgreement(
            PricingAuthoritySnapshotPort.Snapshot snapshot,
            AgreementVersion candidate,
            PricingAuthorityQuery query) {
        try {
            AgreementVersion agreement = snapshot.reloadAgreement(candidate);
            if (agreement.authorityModel() != AgreementAuthorityModel.W2_VERSIONED
                    || agreement.lifecycle() != AgreementLifecycle.APPROVED
                    || !agreement.validity().contains(query.requestedDepartureDate())
                    || !agreement.customerId().value().equals(query.customerId())
                    || !agreement.tradeLaneId().value().equals(query.tradeLaneId())
                    || !agreement.originLocationId().value().equals(query.originLocationId())
                    || !agreement.destinationLocationId().value().equals(query.destinationLocationId())
                    || !agreement.equipmentTypeId().value().equals(query.equipmentTypeId())) {
                return new PricingResolution.Unavailable("AGREEMENT_AUTHORITY_INTEGRITY");
            }
            List<ResolvedPricingAuthority.RateSource> sources = snapshot.reloadLinkedRates(agreement);
            validateLinkedSources(agreement, sources, query);
            return new PricingResolution.Priced(ResolvedPricingAuthority.agreement(agreement.id(), sources));
        } catch (IllegalArgumentException | IllegalStateException exception) {
            return new PricingResolution.Unavailable("AGREEMENT_AUTHORITY_INTEGRITY");
        }
    }

    private PricingResolution resolveTariff(
            Map<RateCategory, List<ResolvedPricingAuthority.RateSource>> candidates) {
        Map<RateCategory, List<ResolvedPricingAuthority.RateSource>> safe =
                candidates == null ? Map.of() : candidates;
        for (RateCategory category : RateCategory.values()) {
            if (safe.getOrDefault(category, List.of()).size() > 1) {
                return new PricingResolution.Manual(ambiguity(category));
            }
        }
        for (RateCategory category : RateCategory.values()) {
            if (safe.getOrDefault(category, List.of()).isEmpty()) {
                return new PricingResolution.Manual(PricingTerminalReason.NO_RATE);
            }
        }
        List<ResolvedPricingAuthority.RateSource> sources = new ArrayList<>(3);
        for (RateCategory category : RateCategory.values()) {
            sources.add(safe.get(category).get(0));
        }
        try {
            return new PricingResolution.Priced(ResolvedPricingAuthority.tariff(sources));
        } catch (IllegalArgumentException exception) {
            return new PricingResolution.Unavailable("TARIFF_AUTHORITY_INTEGRITY");
        }
    }

    private void validateLinkedSources(
            AgreementVersion agreement,
            List<ResolvedPricingAuthority.RateSource> sources,
            PricingAuthorityQuery query) {
        ResolvedPricingAuthority authority = ResolvedPricingAuthority.agreement(agreement.id(), sources);
        for (ResolvedPricingAuthority.RateSource source : authority.sources()) {
            if (!agreement.linksByCategory().get(source.category()).rateVersionId().equals(source.version().id())
                    || query.requestedDepartureDate().isBefore(source.version().effectiveFrom())
                    || query.requestedDepartureDate().isAfter(source.version().effectiveTo())
                    || !source.version().applicability().originLocationId().value().equals(query.originLocationId())
                    || !source.version().applicability().equipmentTypeId().value().equals(query.equipmentTypeId())
                    || source.category() != RateCategory.LOCAL
                            && !source.version().applicability().destinationLocationId().value()
                                    .equals(query.destinationLocationId())
                    || source.category() == RateCategory.LOCAL
                            && source.version().applicability().destinationLocationId() != null) {
                throw new IllegalStateException("linked pricing authority is inconsistent");
            }
        }
    }

    private List<AgreementVersion> bounded(List<AgreementVersion> candidates) {
        if (candidates == null) {
            return List.of();
        }
        return candidates.size() <= 2 ? List.copyOf(candidates) : List.copyOf(candidates.subList(0, 2));
    }

    private PricingTerminalReason ambiguity(RateCategory category) {
        return switch (category) {
            case BASE -> PricingTerminalReason.AMBIGUOUS_BASE_RATE;
            case SURCHARGE -> PricingTerminalReason.AMBIGUOUS_SURCHARGE_RATE;
            case LOCAL -> PricingTerminalReason.AMBIGUOUS_LOCAL_RATE;
        };
    }
}

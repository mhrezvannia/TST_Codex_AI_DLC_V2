package com.linercore.platform.chargeagreement.dataaccess.jdbc;

import com.linercore.platform.chargeagreement.applicationservice.port.RateRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.W2AgreementRepository;
import com.linercore.platform.chargeagreement.applicationservice.pricing.PricingAuthoritySnapshotPort;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementVersion;
import com.linercore.platform.chargeagreement.domain.pricing.ResolvedPricingAuthority;
import com.linercore.platform.chargeagreement.domain.rate.RateCategory;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

public final class JdbcPricingAuthoritySnapshotAdapter implements PricingAuthoritySnapshotPort {
    private final W2AgreementRepository agreements;
    private final RateRepository rates;
    private final TransactionTemplate snapshot;

    public JdbcPricingAuthoritySnapshotAdapter(
            W2AgreementRepository agreements,
            RateRepository rates,
            TransactionTemplate transactionTemplate) {
        this.agreements = agreements;
        this.rates = rates;
        this.snapshot = transactionTemplate;
        this.snapshot.setReadOnly(true);
        this.snapshot.setIsolationLevel(TransactionDefinition.ISOLATION_REPEATABLE_READ);
    }

    @Override
    public <T> T inRepeatableReadSnapshot(SnapshotWork<T> work) {
        return snapshot.execute(status -> work.execute(new JdbcSnapshot()));
    }

    private final class JdbcSnapshot implements Snapshot {
        @Override
        public List<AgreementVersion> findAgreementCandidates(PricingAuthorityQuery query) {
            return agreements.findApprovedPricingCandidates(new W2AgreementRepository.PricingCandidateQuery(
                    query.customerId(), query.tradeLaneId(), query.originLocationId(),
                    query.destinationLocationId(), query.equipmentTypeId(), query.requestedDepartureDate()));
        }

        @Override
        public AgreementVersion reloadAgreement(AgreementVersion candidate) {
            return agreements.findApprovedPricingVersion(candidate.id())
                    .orElseThrow(() -> new IllegalStateException(
                            "approved Agreement pricing authority disappeared during snapshot"));
        }

        @Override
        public List<ResolvedPricingAuthority.RateSource> reloadLinkedRates(AgreementVersion agreement) {
            return agreement.links().stream()
                    .sorted(java.util.Comparator.comparingInt(link -> link.category().ordinal()))
                    .map(link -> {
                        RateRepository.PricingCandidate candidate =
                                rates.findApprovedPricingVersion(link.rateVersionId())
                                        .orElseThrow(() -> new IllegalStateException(
                                                "linked approved RateVersion disappeared during snapshot"));
                        if (candidate.category() != link.category()) {
                            throw new IllegalStateException(
                                    "linked RateVersion category differs from Agreement link");
                        }
                        return source(candidate);
                    })
                    .toList();
        }

        @Override
        public Map<RateCategory, List<ResolvedPricingAuthority.RateSource>> findTariffCandidates(
                PricingAuthorityQuery query) {
            EnumMap<RateCategory, List<ResolvedPricingAuthority.RateSource>> result =
                    new EnumMap<>(RateCategory.class);
            for (RateCategory category : RateCategory.values()) {
                RateRepository.PricingCandidateQuery candidateQuery =
                        new RateRepository.PricingCandidateQuery(
                                category, query.originLocationId(), query.destinationLocationId(),
                                query.equipmentTypeId(), query.requestedDepartureDate());
                result.put(category, rates.findApprovedPricingCandidates(candidateQuery).stream()
                        .map(this::source)
                        .toList());
            }
            return result;
        }

        private ResolvedPricingAuthority.RateSource source(RateRepository.PricingCandidate candidate) {
            return new ResolvedPricingAuthority.RateSource(
                    candidate.category(), candidate.chargeCode(), candidate.version());
        }
    }
}

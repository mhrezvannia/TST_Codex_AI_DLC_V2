package com.linercore.platform.chargeagreement.dataaccess.jdbc;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.linercore.platform.chargeagreement.applicationservice.port.AgreementRepositoryException;
import com.linercore.platform.chargeagreement.applicationservice.port.W2AgreementRepository;
import com.linercore.platform.chargeagreement.applicationservice.agreement.AgreementApplicationService;
import com.linercore.platform.chargeagreement.applicationservice.agreement.AgreementCommands;
import com.linercore.platform.chargeagreement.applicationservice.port.AgreementAuthorizationPort;
import com.linercore.platform.chargeagreement.domain.agreement.Agreement;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementActivityAction;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementLifecycle;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementVersion;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import java.time.Clock;
import java.time.ZoneOffset;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

class JdbcW2AgreementRepositoryPostgresTest extends AgreementPostgresSupport {
    @Test
    void createUpdateAndApprovalPersistVersionLinksAndActivityAtomically() {
        JdbcW2AgreementRepository repository = repository();
        Agreement draft = draft("basic");
        transactions().executeWithoutResult(ignored -> repository.create(
                draft, activity(draft, draft.latestVersion(), "activity-create", AgreementActivityAction.CREATED)));

        AgreementVersion revised = draft.latestVersion().reviseDraft(
                draft.latestVersion().customerId(), draft.latestVersion().tradeLaneId(),
                draft.latestVersion().originLocationId(), draft.latestVersion().destinationLocationId(),
                draft.latestVersion().equipmentTypeId(), draft.latestVersion().validity(),
                draft.latestVersion().links(), 0, "pricing-user", NOW.plusSeconds(1), "corr-update");
        Agreement updated = transactions().execute(ignored -> repository.updateDraft(
                draft, revised, activity(draft, revised, "activity-update", AgreementActivityAction.DRAFT_UPDATED)));
        Agreement approved = transactions().execute(ignored -> repository.approveUnderLock(
                updated, revised, 1, locked -> assertEquals(3, locked.links().size()),
                "approver", NOW.plusSeconds(2), "corr-approve", "activity-approve", "approved"));

        assertEquals(AgreementLifecycle.APPROVED, approved.latestVersion().lifecycle());
        assertEquals(3, jdbc.queryForObject(
                "SELECT COUNT(*) FROM charge_agreement_rate_links WHERE agreement_version_id = ?",
                Integer.class, revised.id().value()));
        assertEquals(3, jdbc.queryForObject(
                "SELECT COUNT(*) FROM charge_agreement_activity WHERE agreement_id = ?",
                Integer.class, draft.id().value()));
    }

    @Test
    void failedMutationRollsBackActivityAndCommercialRows() {
        JdbcW2AgreementRepository repository = repository();
        Agreement draft = draft("rollback");
        transactions().executeWithoutResult(ignored -> repository.create(
                draft, activity(draft, draft.latestVersion(), "activity-create", AgreementActivityAction.CREATED)));
        AgreementVersion revised = draft.latestVersion().reviseDraft(
                draft.latestVersion().customerId(), draft.latestVersion().tradeLaneId(),
                draft.latestVersion().originLocationId(), draft.latestVersion().destinationLocationId(),
                draft.latestVersion().equipmentTypeId(), draft.latestVersion().validity(),
                draft.latestVersion().links(), 0, "pricing-user", NOW.plusSeconds(1), "corr-update");

        assertThrows(AgreementRepositoryException.class, () -> transactions().executeWithoutResult(ignored -> {
            repository.updateDraft(
                    draft, revised,
                    activity(draft, revised, "activity-update", AgreementActivityAction.DRAFT_UPDATED));
            throw new AgreementRepositoryException("FORCED_ROLLBACK", "force transaction rollback");
        }));

        Agreement persisted = repository.findById(draft.id()).orElseThrow();
        assertEquals(0, persisted.latestVersion().rowVersion());
        assertEquals(1, jdbc.queryForObject(
                "SELECT COUNT(*) FROM charge_agreement_activity WHERE agreement_id = ?",
                Integer.class, draft.id().value()));
    }

    @Test
    void outboxFailureRollsBackHeaderVersionLinksAndActivity() {
        JdbcW2AgreementRepository writes = repository();
        AtomicInteger ids = new AtomicInteger();
        AgreementApplicationService service = new AgreementApplicationService(
                writes,
                new JdbcAgreementAdminReadRepository(jdbc, writes),
                (subject, resource, action, correlation) -> AgreementAuthorizationPort.Decision.ALLOW,
                request -> java.util.List.of(),
                new JdbcAgreementRateVersionAdapter(new NamedParameterJdbcTemplate(jdbc)),
                event -> {
                    throw new IllegalStateException("outbox unavailable");
                },
                () -> "atomic-" + ids.incrementAndGet(),
                Clock.fixed(NOW, ZoneOffset.UTC));
        AgreementCommands.Commercial commercial = new AgreementCommands.Commercial(
                "customer-1", "lane-1", "origin-1", "destination-1", "equipment-1",
                FROM, TO, "rate-version-base", "rate-version-surcharge", "rate-version-local");

        assertThrows(IllegalStateException.class, () -> transactions().execute(status ->
                service.create(new AgreementCommands.Create(
                        "AGR-ATOMIC", commercial, null, "pricing-user", "corr-atomic"))));

        assertEquals(0, jdbc.queryForObject(
                "SELECT COUNT(*) FROM charge_agreements WHERE authority_model = 'W2_VERSIONED'",
                Integer.class));
        assertEquals(0, jdbc.queryForObject(
                "SELECT COUNT(*) FROM charge_agreement_activity WHERE agreement_version_id IS NOT NULL",
                Integer.class));
    }

    @Test
    void pricingCandidateReadIsInclusiveW2OnlyAndSupportsExactReload() {
        JdbcW2AgreementRepository repository = repository();
        Agreement draft = draft("pricing-candidate");
        transactions().executeWithoutResult(ignored -> repository.create(
                draft, activity(draft, draft.latestVersion(), "candidate-create", AgreementActivityAction.CREATED)));
        Agreement approved = transactions().execute(ignored -> repository.approveUnderLock(
                draft,
                draft.latestVersion(),
                0,
                locked -> assertEquals(3, locked.links().size()),
                "approver",
                NOW.plusSeconds(1),
                "corr-candidate",
                "candidate-approve",
                "approved"));
        W2AgreementRepository.PricingCandidateQuery fromBoundary =
                new W2AgreementRepository.PricingCandidateQuery(
                        "customer-1", "lane-1", "origin-1", "destination-1",
                        "equipment-1", FROM);
        W2AgreementRepository.PricingCandidateQuery toBoundary =
                new W2AgreementRepository.PricingCandidateQuery(
                        "customer-1", "lane-1", "origin-1", "destination-1",
                        "equipment-1", TO);

        assertEquals(List.of(approved.latestVersion().id()),
                repository.findApprovedPricingCandidates(fromBoundary).stream()
                        .map(AgreementVersion::id).toList());
        assertEquals(1, repository.findApprovedPricingCandidates(toBoundary).size());
        assertEquals(approved.latestVersion().id(), repository.findApprovedPricingVersion(
                approved.latestVersion().id()).orElseThrow().id());
        assertEquals(3, repository.findApprovedPricingVersion(
                approved.latestVersion().id()).orElseThrow().links().size());
        assertEquals(0, repository.findApprovedPricingCandidates(
                new W2AgreementRepository.PricingCandidateQuery(
                        "customer-1", "lane-1", "origin-1", "destination-1",
                        "equipment-1", FROM.minusDays(1))).size());

        jdbc.update("""
                UPDATE charge_agreement_versions
                   SET lifecycle = 'SUSPENDED'
                 WHERE agreement_version_id = ?
                """, approved.latestVersion().id().value());
        assertEquals(0, repository.findApprovedPricingCandidates(fromBoundary).size());
        assertTrue(repository.findApprovedPricingVersion(approved.latestVersion().id()).isEmpty());
    }
}

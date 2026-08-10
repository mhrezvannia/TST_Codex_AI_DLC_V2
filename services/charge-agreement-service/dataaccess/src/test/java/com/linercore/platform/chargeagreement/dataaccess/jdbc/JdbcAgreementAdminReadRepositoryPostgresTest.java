package com.linercore.platform.chargeagreement.dataaccess.jdbc;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import com.linercore.platform.chargeagreement.applicationservice.port.AgreementAdminReadRepository;
import com.linercore.platform.chargeagreement.domain.agreement.Agreement;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementActivityAction;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementAuthorityModel;
import org.junit.jupiter.api.Test;

class JdbcAgreementAdminReadRepositoryPostgresTest extends AgreementPostgresSupport {
    @Test
    void dualReadOrdersStableIdentitiesAndLegacyWriterCannotSeeW2() {
        Agreement w2 = draft("dual");
        transactions().executeWithoutResult(ignored -> repository().create(
                w2, activity(w2, w2.latestVersion(), "activity-create", AgreementActivityAction.CREATED)));
        jdbc.update("""
                INSERT INTO charge_agreements (
                    id, agreement_number, customer_id, trade_lane_id, commodity_id,
                    valid_from, valid_to, status, version, snapshot, authority_model
                ) VALUES (
                    'legacy-1', 'AAA-LEGACY', 'customer-1', 'lane-1', 'commodity-1',
                    ?, ?, 'APPROVED', 1, '{}', 'LEGACY'
                )
                """, FROM, TO);
        jdbc.update("""
                INSERT INTO charge_agreement_versions (
                    agreement_version_id, agreement_id, version_no, authority_model,
                    w2_authority_eligible, customer_id, trade_lane_id, commodity_id,
                    valid_from, valid_to, lifecycle, legacy_status, row_version,
                    created_by, created_at, snapshot
                ) VALUES (
                    'legacy-version-1', 'legacy-1', 1, 'LEGACY', FALSE,
                    'customer-1', 'lane-1', 'commodity-1', ?, ?, 'LEGACY',
                    'APPROVED', 1, 'legacy', ?, '{}'
                )
                """, FROM, TO, java.sql.Timestamp.from(NOW));

        JdbcAgreementAdminReadRepository reads =
                new JdbcAgreementAdminReadRepository(jdbc, repository());
        AgreementAdminReadRepository.SearchPage page = reads.search(
                new AgreementAdminReadRepository.SearchCriteria(
                        "customer-1", "lane-1", null, FROM, 0, 20));

        assertEquals(2, page.total());
        assertEquals(AgreementAuthorityModel.LEGACY, page.items().getFirst().authorityModel());
        assertEquals(AgreementAuthorityModel.W2_VERSIONED, page.items().get(1).authorityModel());
        JdbcAgreementRepository legacy = new JdbcAgreementRepository(
                jdbc, new com.fasterxml.jackson.databind.ObjectMapper());
        assertFalse(legacy.findById(new com.linercore.platform.chargeagreement.domain.model.AgreementId(
                w2.id().value())).isPresent());
    }
}

package com.linercore.platform.chargeagreement.dataaccess.jdbc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linercore.platform.chargeagreement.applicationservice.port.ManualPricingCaseRepository;
import com.linercore.platform.chargeagreement.domain.model.ManualPricingCase;
import java.sql.Timestamp;
import org.springframework.jdbc.core.JdbcTemplate;

public class JdbcManualPricingCaseRepository implements ManualPricingCaseRepository {
    private final JdbcTemplate jdbc;
    private final JdbcJson json;

    public JdbcManualPricingCaseRepository(JdbcTemplate jdbc, ObjectMapper mapper) {
        this.jdbc = jdbc;
        this.json = new JdbcJson(mapper);
    }

    public void save(ManualPricingCase manualPricingCase) {
        jdbc.update("""
                INSERT INTO manual_pricing_cases
                    (case_id, pricing_request_id, reason_code, correlation_id, opened_at, snapshot)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT (case_id) DO UPDATE SET
                    pricing_request_id = EXCLUDED.pricing_request_id,
                    reason_code = EXCLUDED.reason_code,
                    correlation_id = EXCLUDED.correlation_id,
                    opened_at = EXCLUDED.opened_at,
                    snapshot = EXCLUDED.snapshot
                """,
                manualPricingCase.caseId(),
                manualPricingCase.pricingRequestId(),
                manualPricingCase.reasonCode(),
                manualPricingCase.correlationId(),
                manualPricingCase.openedAt() == null ? null : Timestamp.from(manualPricingCase.openedAt()),
                json.write(manualPricingCase));
    }
}

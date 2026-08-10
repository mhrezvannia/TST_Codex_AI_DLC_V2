package com.linercore.platform.chargeagreement.dataaccess.jdbc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linercore.platform.chargeagreement.applicationservice.port.AgreementRepository;
import com.linercore.platform.chargeagreement.applicationservice.query.AgreementSearchQuery;
import com.linercore.platform.chargeagreement.domain.model.AgreementId;
import com.linercore.platform.chargeagreement.domain.model.AgreementStatus;
import com.linercore.platform.chargeagreement.domain.model.CustomerAgreement;
import com.linercore.platform.chargeagreement.domain.model.ReferenceId;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;

public class JdbcAgreementRepository implements AgreementRepository {
    private final JdbcTemplate jdbc;
    private final JdbcJson json;

    public JdbcAgreementRepository(JdbcTemplate jdbc, ObjectMapper mapper) {
        this.jdbc = jdbc;
        this.json = new JdbcJson(mapper);
    }

    public CustomerAgreement save(CustomerAgreement agreement) {
        jdbc.update("""
                INSERT INTO charge_agreements
                    (id, agreement_number, customer_id, trade_lane_id, commodity_id,
                     valid_from, valid_to, status, version, snapshot)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (id) DO UPDATE SET
                    agreement_number = EXCLUDED.agreement_number,
                    customer_id = EXCLUDED.customer_id,
                    trade_lane_id = EXCLUDED.trade_lane_id,
                    commodity_id = EXCLUDED.commodity_id,
                    valid_from = EXCLUDED.valid_from,
                    valid_to = EXCLUDED.valid_to,
                    status = EXCLUDED.status,
                    version = EXCLUDED.version,
                    snapshot = EXCLUDED.snapshot
                """,
                agreement.id().value(),
                agreement.agreementNumber().value(),
                agreement.customerId().value(),
                agreement.tradeLaneId().value(),
                agreement.commodityId().value(),
                agreement.validity().from(),
                agreement.validity().to(),
                agreement.status().name(),
                agreement.version(),
                json.write(agreement));
        return agreement;
    }

    public Optional<CustomerAgreement> findById(AgreementId id) {
        List<CustomerAgreement> rows = jdbc.query("SELECT snapshot FROM charge_agreements WHERE id = ?",
                (rs, rowNum) -> read(rs), id.value());
        return rows.stream().findFirst();
    }

    public List<CustomerAgreement> search(AgreementSearchQuery query) {
        StringBuilder sql = new StringBuilder("SELECT snapshot FROM charge_agreements WHERE 1=1");
        List<Object> args = new ArrayList<>();
        if (query.customerId() != null) {
            sql.append(" AND customer_id = ?");
            args.add(query.customerId());
        }
        if (query.tradeLaneId() != null) {
            sql.append(" AND trade_lane_id = ?");
            args.add(query.tradeLaneId());
        }
        if (query.commodityId() != null) {
            sql.append(" AND commodity_id = ?");
            args.add(query.commodityId());
        }
        if (query.status() != null) {
            sql.append(" AND status = ?");
            args.add(query.status().name());
        }
        if (query.validOn() != null) {
            sql.append(" AND valid_from <= ? AND valid_to >= ?");
            args.add(query.validOn());
            args.add(query.validOn());
        }
        if (!query.includeInactive()) {
            sql.append(" AND status NOT IN (?, ?)");
            args.add(AgreementStatus.SUSPENDED.name());
            args.add(AgreementStatus.EXPIRED.name());
        }
        sql.append(" ORDER BY agreement_number OFFSET ? LIMIT ?");
        args.add((long) query.page() * query.size());
        args.add(query.size());
        return jdbc.query(sql.toString(), (rs, rowNum) -> read(rs), args.toArray());
    }

    public List<CustomerAgreement> findActiveCandidates(ReferenceId customerId, java.time.LocalDate effectiveDate) {
        return jdbc.query("""
                SELECT snapshot FROM charge_agreements
                WHERE customer_id = ?
                  AND status = ?
                  AND valid_from <= ?
                  AND valid_to >= ?
                ORDER BY agreement_number
                """, (rs, rowNum) -> read(rs), customerId.value(), AgreementStatus.APPROVED.name(), effectiveDate, effectiveDate);
    }

    private CustomerAgreement read(ResultSet rs) throws SQLException {
        return json.read(rs.getString("snapshot"), CustomerAgreement.class);
    }
}

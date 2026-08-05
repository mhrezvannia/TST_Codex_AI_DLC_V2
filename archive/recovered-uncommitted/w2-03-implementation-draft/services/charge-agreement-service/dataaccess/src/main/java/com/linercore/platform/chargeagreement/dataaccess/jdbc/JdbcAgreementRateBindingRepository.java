package com.linercore.platform.chargeagreement.dataaccess.jdbc;

import com.linercore.platform.chargeagreement.applicationservice.port.AgreementRateBindingRepository;
import com.linercore.platform.chargeagreement.domain.model.AgreementId;
import com.linercore.platform.chargeagreement.domain.model.AgreementRateBinding;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

public class JdbcAgreementRateBindingRepository implements AgreementRateBindingRepository {
    private final JdbcTemplate jdbc;

    public JdbcAgreementRateBindingRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    @Transactional
    public AgreementRateBinding replace(AgreementRateBinding binding) {
        jdbc.update("DELETE FROM charge_agreement_rate_bindings WHERE agreement_id = ? AND agreement_version = ?",
                binding.agreementId().value(), binding.agreementVersion());
        for (String rateVersionId : binding.rateVersionIds()) {
            jdbc.update("""
                    INSERT INTO charge_agreement_rate_bindings (agreement_id, agreement_version, rate_version_id)
                    VALUES (?, ?, ?)
                    """, binding.agreementId().value(), binding.agreementVersion(), rateVersionId);
        }
        return binding;
    }

    @Override
    public Optional<AgreementRateBinding> find(AgreementId agreementId, long agreementVersion) {
        List<String> ids = jdbc.queryForList("""
                SELECT rate_version_id
                  FROM charge_agreement_rate_bindings
                 WHERE agreement_id = ? AND agreement_version = ?
                 ORDER BY rate_version_id
                """, String.class, agreementId.value(), agreementVersion);
        return ids.isEmpty() ? Optional.empty() : Optional.of(new AgreementRateBinding(agreementId, agreementVersion, ids));
    }
}

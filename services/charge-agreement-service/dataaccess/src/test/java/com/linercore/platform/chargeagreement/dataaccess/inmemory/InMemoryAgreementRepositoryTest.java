package com.linercore.platform.chargeagreement.dataaccess.inmemory;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.linercore.platform.chargeagreement.applicationservice.query.AgreementSearchQuery;
import com.linercore.platform.chargeagreement.domain.model.ActivityEntry;
import com.linercore.platform.chargeagreement.domain.model.AgreementId;
import com.linercore.platform.chargeagreement.domain.model.AgreementNumber;
import com.linercore.platform.chargeagreement.domain.model.AgreementStatus;
import com.linercore.platform.chargeagreement.domain.model.ChargeBasis;
import com.linercore.platform.chargeagreement.domain.model.ChargeTerm;
import com.linercore.platform.chargeagreement.domain.model.CustomerAgreement;
import com.linercore.platform.chargeagreement.domain.model.MoneyAmount;
import com.linercore.platform.chargeagreement.domain.model.ReferenceId;
import com.linercore.platform.chargeagreement.domain.model.ValidityWindow;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;

class InMemoryAgreementRepositoryTest {
    private final InMemoryAgreementRepository repository = new InMemoryAgreementRepository();

    @Test
    void persistsAndRehydratesAgreementWithTermsAndActivity() {
        CustomerAgreement agreement = approved("agr-1", "cust-1", "lane-1", "cmdty-1");

        repository.save(agreement);

        CustomerAgreement found = repository.findById(new AgreementId("agr-1")).orElseThrow();
        assertEquals("AGR-1", found.agreementNumber().value());
        assertEquals(1, found.terms().size());
        assertEquals(1, found.activity().size());
    }

    @Test
    void searchesAndFindsActiveCandidates() {
        repository.save(approved("agr-1", "cust-1", "lane-1", "cmdty-1"));
        repository.save(approved("agr-2", "cust-2", "lane-1", "cmdty-1"));

        List<CustomerAgreement> search = repository.search(new AgreementSearchQuery("cust-1", null, null,
                AgreementStatus.APPROVED, LocalDate.parse("2026-06-01"), false, 0, 25, "reader", "corr"));

        assertEquals(1, search.size());
        assertEquals("agr-1", search.get(0).id().value());
        assertEquals(1, repository.findActiveCandidates(new ReferenceId("cust-1"), LocalDate.parse("2026-06-01")).size());
        assertTrue(repository.findActiveCandidates(new ReferenceId("cust-1"), LocalDate.parse("2027-01-01")).isEmpty());
    }

    private CustomerAgreement approved(String id, String customerId, String tradeLaneId, String commodityId) {
        return new CustomerAgreement(new AgreementId(id), new AgreementNumber(id), new ReferenceId(customerId),
                new ReferenceId(tradeLaneId), new ReferenceId(commodityId),
                new ValidityWindow(LocalDate.parse("2026-01-01"), LocalDate.parse("2026-12-31")),
                AgreementStatus.APPROVED, 2, List.of(term()), List.of(new ActivityEntry("APPROVED", "user",
                Instant.parse("2026-07-08T00:00:00Z"), "ok")));
    }

    private ChargeTerm term() {
        return new ChargeTerm("term-1", new ReferenceId("charge-ocean"), ChargeBasis.TEU,
                new MoneyAmount(new BigDecimal("42.00"), new ReferenceId("usd")),
                new ValidityWindow(LocalDate.parse("2026-01-01"), LocalDate.parse("2026-12-31")), "");
    }
}

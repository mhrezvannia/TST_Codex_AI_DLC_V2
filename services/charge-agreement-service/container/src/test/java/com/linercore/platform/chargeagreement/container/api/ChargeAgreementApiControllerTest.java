package com.linercore.platform.chargeagreement.container.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.linercore.platform.chargeagreement.applicationservice.ChargeAgreementApplicationService;
import com.linercore.platform.chargeagreement.applicationservice.port.IdGenerator;
import com.linercore.platform.chargeagreement.container.api.ChargeAgreementApiController.AgreementRequest;
import com.linercore.platform.chargeagreement.container.api.ChargeAgreementApiController.ChargeTermRequest;
import com.linercore.platform.chargeagreement.container.api.ChargeAgreementApiController.StatusActionRequest;
import com.linercore.platform.chargeagreement.dataaccess.inmemory.InMemoryAgreementRepository;
import com.linercore.platform.chargeagreement.domain.model.AgreementStatus;
import com.linercore.platform.chargeagreement.domain.model.ChargeBasis;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.Test;

class ChargeAgreementApiControllerTest {
    private final ChargeAgreementApiController controller = new ChargeAgreementApiController(new ChargeAgreementApplicationService(
            new InMemoryAgreementRepository(),
            (subjectId, resource, action, correlationId) -> true,
            request -> List.of(),
            new SequentialIds(),
            Clock.fixed(Instant.parse("2026-07-08T00:00:00Z"), ZoneOffset.UTC)));

    @Test
    void apiCreatesUpdatesApprovesSearchesAndLooksUpActiveAgreement() {
        var created = controller.create(request(List.of()), "corr-1").getBody();
        var updated = controller.update(created.id(), created.version(), request(List.of(term())), "corr-2");
        var approved = controller.approve(updated.id(), updated.version(), new StatusActionRequest("approver", "approved"), "corr-3");

        assertEquals(AgreementStatus.APPROVED, approved.status());
        assertEquals(1, controller.search("cust-1", null, null, AgreementStatus.APPROVED, LocalDate.parse("2026-06-01"),
                false, 0, 25, "reader", "corr-4").items().size());
        assertTrue(controller.activeLookup("cust-1", "lane-1", null, null, "cmdty-1",
                LocalDate.parse("2026-06-01"), "reader", "corr-5").matched());
        assertFalse(controller.activeLookup("cust-1", "lane-1", null, null, "cmdty-1",
                LocalDate.parse("2027-06-01"), "reader", "corr-6").matched());
    }

    private AgreementRequest request(List<ChargeTermRequest> terms) {
        return new AgreementRequest("agr-001", "cust-1", "lane-1", "cmdty-1",
                LocalDate.parse("2026-01-01"), LocalDate.parse("2026-12-31"), terms, "manager", "change");
    }

    private ChargeTermRequest term() {
        return new ChargeTermRequest("term-1", "charge-ocean", ChargeBasis.TEU, new BigDecimal("42.00"),
                "usd", LocalDate.parse("2026-01-01"), LocalDate.parse("2026-12-31"), "base");
    }

    private static class SequentialIds implements IdGenerator {
        private int next = 1;

        public String nextId() {
            return "id-" + next++;
        }
    }
}

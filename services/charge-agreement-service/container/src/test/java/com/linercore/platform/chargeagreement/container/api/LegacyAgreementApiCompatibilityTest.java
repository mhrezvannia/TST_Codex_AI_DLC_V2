package com.linercore.platform.chargeagreement.container.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.linercore.platform.chargeagreement.applicationservice.ChargeAgreementApplicationService;
import com.linercore.platform.chargeagreement.applicationservice.port.AuthorizationPort;
import com.linercore.platform.chargeagreement.applicationservice.port.IdGenerator;
import com.linercore.platform.chargeagreement.container.api.ChargeAgreementApiController.AgreementRequest;
import com.linercore.platform.chargeagreement.dataaccess.inmemory.InMemoryAgreementRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

class LegacyAgreementApiCompatibilityTest {
    @Test
    void legacyGrammarIgnoresSpoofedActorAndHasNoLocalCorrelationDefault() {
        List<String> authorizedSubjects = new ArrayList<>();
        AuthorizationPort authorization = (subject, resource, action, correlation) -> {
            authorizedSubjects.add(subject);
            return true;
        };
        ChargeAgreementApiController controller = new ChargeAgreementApiController(
                new ChargeAgreementApplicationService(
                        new InMemoryAgreementRepository(),
                        authorization,
                        request -> List.of(),
                        new SequentialIds(),
                        Clock.fixed(Instant.parse("2026-07-28T00:00:00Z"), ZoneOffset.UTC)));
        AgreementRequest body = new AgreementRequest(
                "AGR-LEGACY-1", "customer-1", "lane-1", "commodity-1",
                LocalDate.parse("2026-08-01"), LocalDate.parse("2026-08-31"),
                List.of(), "attacker-controlled", "create");

        var created = controller.create(body, null).getBody();

        assertEquals(List.of("legacy-unverified"), authorizedSubjects);
        assertEquals("legacy-unverified", created.activity().getFirst().actor());
        assertNotEquals("local-correlation", created.activity().getFirst().reason());
    }

    @Test
    void legacyPathsRemainDeclaredAlongsideExplicitJsonMedia() throws Exception {
        String source = java.nio.file.Files.readString(java.nio.file.Path.of(
                "src/main/java/com/linercore/platform/chargeagreement/container/api/"
                        + "ChargeAgreementApiController.java"));
        for (String path : List.of(
                "\"/{id}/approve\"", "\"/{id}/suspend\"", "\"/{id}/expire\"",
                "\"/active-lookup\"")) {
            assertTrue(source.contains(path), path);
        }
        assertTrue(source.contains("MediaType.APPLICATION_JSON_VALUE"));
        assertTrue(source.contains("return \"legacy-unverified\""));
    }

    private static final class SequentialIds implements IdGenerator {
        private int value;

        @Override
        public String nextId() {
            return "legacy-" + ++value;
        }
    }
}

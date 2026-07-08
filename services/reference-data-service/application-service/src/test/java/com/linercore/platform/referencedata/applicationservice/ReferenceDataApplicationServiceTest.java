package com.linercore.platform.referencedata.applicationservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.linercore.platform.referencedata.applicationservice.command.ReferenceMutationCommand;
import com.linercore.platform.referencedata.applicationservice.port.AuthorizationClientPort;
import com.linercore.platform.referencedata.applicationservice.port.IdGenerator;
import com.linercore.platform.referencedata.domain.model.ReferenceRecord;
import com.linercore.platform.referencedata.domain.model.ReferenceSet;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Map;
import org.junit.jupiter.api.Test;

class ReferenceDataApplicationServiceTest {
    private final TestReferenceRepository references = new TestReferenceRepository();
    private final TestReferenceChangeRepository changes = new TestReferenceChangeRepository();
    private final ReferenceDataApplicationService service = new ReferenceDataApplicationService(
            references,
            changes,
            allowAll(),
            new SequentialIds(),
            Clock.fixed(Instant.parse("2026-07-01T00:00:00Z"), ZoneOffset.UTC));

    @Test
    void createsReferenceRecordAndChangeFact() {
        ReferenceRecord record = service.create(command(ReferenceSet.CURRENCY, "USD", "US Dollar", Map.of("minorUnit", "2")));

        assertEquals("USD", record.code().value());
        assertEquals(1, service.history(ReferenceSet.CURRENCY, record.id()).size());
    }

    @Test
    void rejectsDuplicateActiveCode() {
        service.create(command(ReferenceSet.CURRENCY, "USD", "US Dollar", Map.of()));

        assertThrows(IllegalArgumentException.class,
                () -> service.create(command(ReferenceSet.CURRENCY, "USD", "US Dollar duplicate", Map.of())));
    }

    @Test
    void validateOnlyDoesNotPersist() {
        service.validateOnly(command(ReferenceSet.CURRENCY, "USD", "US Dollar", Map.of()));

        assertEquals(0, service.list(ReferenceSet.CURRENCY, false, 0, 25).total());
    }

    @Test
    void authorizationDenialPreventsPersistence() {
        ReferenceDataApplicationService deniedService = new ReferenceDataApplicationService(
                references, changes, denyAll(), new SequentialIds(), Clock.systemUTC());

        assertThrows(SecurityException.class,
                () -> deniedService.create(command(ReferenceSet.CURRENCY, "EUR", "Euro", Map.of())));
    }

    private ReferenceMutationCommand command(ReferenceSet set, String code, String name, Map<String, String> attributes) {
        return new ReferenceMutationCommand(set, code, name, attributes, "reference-admin", "Reference Admin",
                "create", "test", "corr-1");
    }

    private AuthorizationClientPort allowAll() {
        return (subjectId, resource, action, correlationId) -> true;
    }

    private AuthorizationClientPort denyAll() {
        return (subjectId, resource, action, correlationId) -> false;
    }

    private static class SequentialIds implements IdGenerator {
        private int next = 1;

        public String nextId() {
            return "id-" + next++;
        }
    }
}

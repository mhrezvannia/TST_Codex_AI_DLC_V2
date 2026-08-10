package com.linercore.platform.referencedata.applicationservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.linercore.platform.referencedata.applicationservice.command.ReferenceMutationCommand;
import com.linercore.platform.referencedata.applicationservice.port.AuthorizationClientPort;
import com.linercore.platform.referencedata.applicationservice.port.IdGenerator;
import com.linercore.platform.referencedata.domain.model.ReferenceRecord;
import com.linercore.platform.referencedata.domain.model.ReferenceId;
import com.linercore.platform.referencedata.domain.model.ReferenceSet;
import com.linercore.platform.referencedata.domain.validation.ValidationResult;
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
    void updatesBusinessCodeWithoutBreakingActiveUniqueness() {
        ReferenceRecord created = service.create(command(ReferenceSet.CURRENCY, "USX", "US Dollar draft", Map.of()));

        ReferenceRecord updated = service.update(created.id(), created.version(),
                command(ReferenceSet.CURRENCY, "USD", "US Dollar", Map.of("minorUnit", "2")));

        assertEquals("USD", updated.code().value());
        assertEquals(2, updated.version());
    }

    @Test
    void validateOnlyDoesNotPersist() {
        service.validateOnly(command(ReferenceSet.CURRENCY, "USD", "US Dollar", Map.of()));

        assertEquals(0, service.list(ReferenceSet.CURRENCY, false, 0, 25).total());
    }

    @Test
    void validationFailsClosedForMissingRelatedReference() {
        ValidationResult result = service.validateOnly(command(ReferenceSet.TRADE_LANE, "ASIA-EUR", "Asia Europe",
                Map.of("originRegionId", "missing-origin", "destinationRegionId", "missing-destination")));

        assertEquals(false, result.valid());
        assertEquals(2, result.errors().size());
    }

    @Test
    void authorizationDenialPreventsPersistence() {
        ReferenceDataApplicationService deniedService = new ReferenceDataApplicationService(
                references, changes, denyAll(), new SequentialIds(), Clock.systemUTC());

        assertThrows(SecurityException.class,
                () -> deniedService.create(command(ReferenceSet.CURRENCY, "EUR", "Euro", Map.of())));
    }

    @Test
    void persistsVoyageOnlyWhenVesselAndLocationsAreActive() {
        service.update(new ReferenceId("location-origin"), 0,
                command(ReferenceSet.LOCATION, "USNYC", "New York", Map.of("locationType", "PORT", "parentCountryId", "country-us")));
        service.update(new ReferenceId("location-destination"), 0,
                command(ReferenceSet.LOCATION, "NLRTM", "Rotterdam", Map.of("locationType", "PORT", "parentCountryId", "country-nl")));
        service.update(new ReferenceId("vessel-1"), 0,
                command(ReferenceSet.VESSEL_VOYAGE, "9387425", "LinerCore Atlas", Map.of(
                        "recordType", "VESSEL", "vesselName", "LinerCore Atlas", "vesselIMONumber", "9387425")));

        ReferenceRecord voyage = service.update(new ReferenceId("voyage-1"), 0,
                command(ReferenceSet.VESSEL_VOYAGE, "LC001E", "LinerCore Atlas LC001E", Map.of(
                        "recordType", "VOYAGE",
                        "vesselId", "vessel-1",
                        "carrierVoyageNumber", "LC001E",
                        "originLocationId", "location-origin",
                        "destinationLocationId", "location-destination",
                        "scheduledDeparture", "2026-08-01T10:00:00Z",
                        "scheduledArrival", "2026-08-10T08:00:00Z")));

        assertEquals("LC001E", voyage.code().value());
        assertEquals(2, service.list(ReferenceSet.VESSEL_VOYAGE, false, 0, 25).total());
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

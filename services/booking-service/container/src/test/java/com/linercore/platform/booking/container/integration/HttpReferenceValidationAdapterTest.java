package com.linercore.platform.booking.container.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withResourceNotFound;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.linercore.platform.booking.applicationservice.port.BookingReferenceValidationRequest;
import com.linercore.platform.booking.applicationservice.port.ReferenceCheck;
import com.linercore.platform.booking.applicationservice.port.ReferenceProviderFailureCategory;
import com.linercore.platform.booking.applicationservice.port.ReferenceProviderUnavailable;
import com.linercore.platform.booking.applicationservice.port.ReferenceSet;
import com.linercore.platform.booking.domain.model.BookingId;
import com.linercore.platform.booking.domain.model.ReferenceValidationFieldOutcome;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

class HttpReferenceValidationAdapterTest {
    @Test
    void validatesEveryCanonicalFieldAndVoyageCoherence() {
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();
        HttpReferenceValidationAdapter adapter = new HttpReferenceValidationAdapter(restTemplate,
                "http://reference.test");

        expect(server, ReferenceSet.PARTY_CUSTOMER, "party-customer-local-carrier",
                record("party-customer-local-carrier", "PARTY_CUSTOMER", "LOCAL-CARRIER", "ACTIVE", "{}"), true);
        expect(server, ReferenceSet.LOCATION, "location-usnyc",
                record("location-usnyc", "LOCATION", "USNYC", "ACTIVE", "{}"), false);
        expect(server, ReferenceSet.LOCATION, "location-nlrot",
                record("location-nlrot", "LOCATION", "NLRTM", "ACTIVE", "{}"), false);
        expect(server, ReferenceSet.VESSEL_VOYAGE, "voyage-local-001",
                record("voyage-local-001", "VESSEL_VOYAGE", "LC001E", "ACTIVE",
                        "{\"recordType\":\"VOYAGE\",\"originLocationId\":\"location-usnyc\",\"destinationLocationId\":\"location-nlrot\"}"),
                false);
        expect(server, ReferenceSet.EQUIPMENT_TYPE, "equipment-type-45g1",
                record("equipment-type-45g1", "EQUIPMENT_TYPE", "45G1", "ACTIVE", "{}"), false);

        var result = adapter.validate(request(), "corr-1");

        assertEquals(5, result.fieldResults().size());
        assertEquals(List.of("customerId", "routing[0].loadUnLocode", "routing[0].dischargeUnLocode",
                        "routing[0].voyageId", "equipment[0].equipmentTypeCode"),
                result.fieldResults().stream().map(field -> field.fieldPath()).toList());
        assertEquals(0, result.fieldResults().stream()
                .filter(field -> field.outcome() != ReferenceValidationFieldOutcome.ACTIVE).count());
        server.verify();
    }

    @Test
    void mapsUnknownCodeToNotFoundAfterBoundedListLookup() {
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();
        HttpReferenceValidationAdapter adapter = new HttpReferenceValidationAdapter(restTemplate,
                "http://reference.test");
        server.expect(requestTo("http://reference.test/reference-sets/EQUIPMENT_TYPE/records/99ZZ"))
                .andRespond(withResourceNotFound());
        server.expect(requestTo("http://reference.test/reference-sets/EQUIPMENT_TYPE/records?includeInactive=true&page=0&size=50"))
                .andRespond(withSuccess("{\"records\":[],\"page\":0,\"size\":50,\"total\":0}",
                        MediaType.APPLICATION_JSON));
        var request = new BookingReferenceValidationRequest(new BookingId("booking-1"), 1, "fingerprint",
                List.of(new ReferenceCheck("equipment[0].equipmentTypeCode", ReferenceSet.EQUIPMENT_TYPE, "99ZZ")));

        var result = adapter.validate(request, "corr-2");

        assertEquals(ReferenceValidationFieldOutcome.NOT_FOUND, result.fieldResults().get(0).outcome());
        assertEquals("REFERENCE_NOT_FOUND", result.fieldResults().get(0).reasonCode());
    }

    @Test
    void mapsServerFailureToTypedUnavailableWithoutRawBody() {
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();
        HttpReferenceValidationAdapter adapter = new HttpReferenceValidationAdapter(restTemplate,
                "http://reference.test");
        server.expect(requestTo("http://reference.test/reference-sets/EQUIPMENT_TYPE/records/99ZZ"))
                .andRespond(withServerError());
        var request = new BookingReferenceValidationRequest(new BookingId("booking-1"), 1, "fingerprint",
                List.of(new ReferenceCheck("equipment[0].equipmentTypeCode", ReferenceSet.EQUIPMENT_TYPE, "99ZZ")));

        ReferenceProviderUnavailable unavailable = assertThrows(ReferenceProviderUnavailable.class,
                () -> adapter.validate(request, "corr-3"));

        assertEquals(ReferenceProviderFailureCategory.SERVER, unavailable.category());
        assertEquals("Reference Data is unavailable", unavailable.getMessage());
    }

    private static BookingReferenceValidationRequest request() {
        return new BookingReferenceValidationRequest(new BookingId("booking-1"), 1, "fingerprint", List.of(
                new ReferenceCheck("customerId", ReferenceSet.PARTY_CUSTOMER, "party-customer-local-carrier"),
                new ReferenceCheck("routing[0].loadUnLocode", ReferenceSet.LOCATION, "location-usnyc"),
                new ReferenceCheck("routing[0].dischargeUnLocode", ReferenceSet.LOCATION, "location-nlrot"),
                new ReferenceCheck("routing[0].voyageId", ReferenceSet.VESSEL_VOYAGE, "voyage-local-001"),
                new ReferenceCheck("equipment[0].equipmentTypeCode", ReferenceSet.EQUIPMENT_TYPE,
                        "equipment-type-45g1")));
    }

    private static void expect(
            MockRestServiceServer server,
            ReferenceSet set,
            String id,
            String response,
            boolean assertIdentity) {
        var expectation = server.expect(requestTo("http://reference.test/reference-sets/" + set.name()
                + "/records/" + id));
        if (assertIdentity) {
            expectation.andExpect(header("X-Correlation-Id", "corr-1"))
                    .andExpect(header("X-LinerCore-Service-Id", "booking-service"));
        }
        expectation.andRespond(withSuccess(response, MediaType.APPLICATION_JSON));
    }

    private static String record(String id, String set, String code, String status, String attributes) {
        return "{\"id\":{\"value\":\"" + id + "\"},\"set\":\"" + set
                + "\",\"code\":{\"value\":\"" + code + "\"},\"displayName\":\"Safe label\",\"status\":\""
                + status + "\",\"version\":1,\"attributes\":" + attributes + "}";
    }
}

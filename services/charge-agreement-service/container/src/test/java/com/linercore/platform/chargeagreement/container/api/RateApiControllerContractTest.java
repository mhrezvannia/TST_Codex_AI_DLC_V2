package com.linercore.platform.chargeagreement.container.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linercore.platform.chargeagreement.applicationservice.rate.RateApplicationException;
import com.linercore.platform.chargeagreement.container.api.RateApiController.ApiErrorResponse;
import java.util.List;
import org.junit.jupiter.api.Test;

class RateApiControllerContractTest {
    private final RateApiController controller = new RateApiController(null);

    @Test
    void mapsEveryTypedApplicationClassificationWithoutLeakingInternalDetails() {
        for (int status : List.of(400, 401, 403, 404, 409, 422, 503)) {
            RateApplicationException exception = new RateApplicationException(
                    status, "RATE_TEST_" + status, "safe message");

            var response = controller.rateFailure(exception);

            assertEquals(status, response.getStatusCode().value());
            assertEquals("RATE_TEST_" + status, response.getBody().code());
            assertEquals("safe message", response.getBody().message());
        }
    }

    @Test
    void malformedInputUsesStableSafeEnvelopeForInjectionShapedValues() {
        var response = controller.malformed(
                new IllegalArgumentException("rateId=' OR 1=1; schema=private_table"));

        assertEquals(400, response.getStatusCode().value());
        assertEquals(new ApiErrorResponse("RATE_REQUEST_INVALID", "Rate request is invalid", List.of()),
                response.getBody());
        assertFalse(response.getBody().message().contains("private_table"));
    }

    @Test
    void fieldErrorsSerializeWithOnlyThePublishedShape() throws Exception {
        RateApplicationException exception = new RateApplicationException(422, "RATE_REFERENCE_INVALID",
                "One or more references are invalid",
                List.of(new RateApplicationException.FieldError("currencyId", "inactive")));

        String json = new ObjectMapper().writeValueAsString(controller.rateFailure(exception).getBody());

        assertEquals(
                "{\"code\":\"RATE_REFERENCE_INVALID\",\"message\":\"One or more references are invalid\","
                        + "\"fields\":[{\"field\":\"currencyId\",\"reason\":\"inactive\"}]}",
                json);
    }
}

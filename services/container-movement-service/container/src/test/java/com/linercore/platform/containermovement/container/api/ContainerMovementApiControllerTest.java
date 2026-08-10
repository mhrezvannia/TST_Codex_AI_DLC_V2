package com.linercore.platform.containermovement.container.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linercore.platform.containermovement.applicationservice.MovementConflictException;
import com.linercore.platform.containermovement.domain.model.EquipmentEventTypeCode;
import com.linercore.platform.containermovement.domain.model.EventClassifierCode;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

class ContainerMovementApiControllerTest {
    @Test
    void serializesTypedMovementConflictEvidenceAsHttp409() {
        ContainerMovementApiController controller = new ContainerMovementApiController(null);
        MovementConflictException conflict = new MovementConflictException(
                "OUT_OF_SEQUENCE_MOVEMENT",
                "expected LOAD as next captured movement",
                "GATED_OUT",
                "LOAD",
                "corr-409");

        ResponseEntity<ContainerMovementApiController.MovementConflictResponse> response =
                controller.movementConflict(conflict);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("OUT_OF_SEQUENCE_MOVEMENT", response.getBody().code());
        assertEquals("GATED_OUT", response.getBody().currentLifecycle());
        assertEquals("LOAD", response.getBody().requiredNextMove());
        assertEquals("corr-409", response.getBody().correlationId());
    }

    @Test
    void exposesCanonicalPlannedMovementClassifierAndMoveCode() throws Exception {
        ContainerMovementApiController.ExpectedMovementResponse planned =
                new ContainerMovementApiController.ExpectedMovementResponse(
                        "1",
                        EventClassifierCode.PLN,
                        EquipmentEventTypeCode.LOAD,
                        "SGSIN");

        String json = new ObjectMapper().writeValueAsString(planned);

        assertTrue(json.contains("\"eventClassifierCode\":\"PLN\""));
        assertTrue(json.contains("\"moveCode\":\"LOAD\""));
        assertFalse(json.contains("expectedEventType"));
    }
}

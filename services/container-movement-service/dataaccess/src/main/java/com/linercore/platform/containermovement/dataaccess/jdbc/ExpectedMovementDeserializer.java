package com.linercore.platform.containermovement.dataaccess.jdbc;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import com.linercore.platform.containermovement.domain.model.EquipmentEventTypeCode;
import com.linercore.platform.containermovement.domain.model.EventClassifierCode;
import com.linercore.platform.containermovement.domain.model.ExpectedMovement;
import java.io.IOException;

final class ExpectedMovementDeserializer extends StdDeserializer<ExpectedMovement> {
    ExpectedMovementDeserializer() {
        super(ExpectedMovement.class);
    }

    @Override
    public ExpectedMovement deserialize(JsonParser parser, DeserializationContext context) throws IOException {
        JsonNode node = parser.getCodec().readTree(parser);
        String sequence = requiredText(node, "sequence", parser);
        String locationId = requiredText(node, "locationId", parser);
        boolean hasClassifier = node.hasNonNull("eventClassifierCode");
        boolean hasMoveCode = node.hasNonNull("moveCode");

        if (hasClassifier != hasMoveCode) {
            throw JsonMappingException.from(
                    parser,
                    "expected movement must contain both eventClassifierCode and moveCode");
        }

        try {
            ExpectedMovement canonical = hasClassifier
                    ? canonical(node, sequence, locationId)
                    : legacy(node, sequence, locationId, parser);
            validateConsistentLegacyAlias(node, canonical, parser);
            return canonical;
        } catch (IllegalArgumentException exception) {
            throw JsonMappingException.from(parser, "invalid expected movement snapshot", exception);
        }
    }

    private ExpectedMovement canonical(JsonNode node, String sequence, String locationId) {
        EventClassifierCode classifier =
                EventClassifierCode.valueOf(node.get("eventClassifierCode").asText());
        EquipmentEventTypeCode moveCode =
                EquipmentEventTypeCode.valueOf(node.get("moveCode").asText());
        return new ExpectedMovement(sequence, classifier, moveCode, locationId);
    }

    private ExpectedMovement legacy(
            JsonNode node,
            String sequence,
            String locationId,
            JsonParser parser) throws JsonMappingException {
        String legacyType = requiredText(node, "expectedEventType", parser);
        EquipmentEventTypeCode moveCode = switch (legacyType) {
            case "PLANNED_DEPARTURE" -> EquipmentEventTypeCode.LOAD;
            case "ESTIMATED_ARRIVAL" -> EquipmentEventTypeCode.DISC;
            default -> throw JsonMappingException.from(
                    parser,
                    "unsupported legacy expectedEventType: " + legacyType);
        };
        return new ExpectedMovement(sequence, EventClassifierCode.PLN, moveCode, locationId);
    }

    private void validateConsistentLegacyAlias(
            JsonNode node,
            ExpectedMovement canonical,
            JsonParser parser) throws JsonMappingException {
        if (!node.hasNonNull("expectedEventType")) {
            return;
        }
        EquipmentEventTypeCode aliasedMove = switch (node.get("expectedEventType").asText()) {
            case "PLANNED_DEPARTURE" -> EquipmentEventTypeCode.LOAD;
            case "ESTIMATED_ARRIVAL" -> EquipmentEventTypeCode.DISC;
            default -> throw JsonMappingException.from(
                    parser,
                    "unsupported legacy expectedEventType alias");
        };
        if (canonical.eventClassifierCode() != EventClassifierCode.PLN
                || canonical.moveCode() != aliasedMove) {
            throw JsonMappingException.from(
                    parser,
                    "legacy expectedEventType conflicts with canonical expected movement fields");
        }
    }

    private String requiredText(JsonNode node, String field, JsonParser parser) throws JsonMappingException {
        if (!node.hasNonNull(field) || node.get(field).asText().isBlank()) {
            throw JsonMappingException.from(parser, "expected movement " + field + " is required");
        }
        return node.get(field).asText();
    }
}

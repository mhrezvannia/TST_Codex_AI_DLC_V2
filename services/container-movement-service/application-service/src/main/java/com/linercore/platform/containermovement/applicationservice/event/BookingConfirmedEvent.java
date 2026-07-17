package com.linercore.platform.containermovement.applicationservice.event;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public record BookingConfirmedEvent(
        String eventId,
        String eventType,
        String source,
        Instant occurredAt,
        String correlationId,
        int dataSchemaVersion,
        String bookingId,
        int bookingRevision,
        List<RoutingLeg> routing,
        List<EquipmentAssignment> equipment) {
    public BookingConfirmedEvent {
        require(eventId, "event id is required");
        require(eventType, "event type is required");
        require(source, "source is required");
        require(correlationId, "correlation id is required");
        require(bookingId, "booking id is required");
        if (!"booking.confirmed".equals(eventType)) {
            throw new IllegalArgumentException("unsupported booking event type");
        }
        if (dataSchemaVersion != 1) {
            throw new IllegalArgumentException("unsupported booking confirmed data schema version");
        }
        if (bookingRevision < 1) {
            throw new IllegalArgumentException("booking revision must be positive");
        }
        if (occurredAt == null) {
            throw new IllegalArgumentException("occurred at is required");
        }
        routing = List.copyOf(routing == null ? List.of() : routing);
        equipment = List.copyOf(equipment == null ? List.of() : equipment);
        if (routing.isEmpty()) {
            throw new IllegalArgumentException("booking route is required");
        }
        for (int index = 0; index < routing.size(); index++) {
            if (routing.get(index).legSequence() != index + 1) {
                throw new IllegalArgumentException("routing leg sequence must be contiguous and 1-based");
            }
        }
        if (equipment.size() != 1 || equipment.get(0).quantity() != 1) {
            throw new IllegalArgumentException("W1 booking confirmed requires exactly one equipment assignment");
        }
        if (!equipment.get(0).validPhysicalEquipmentId()) {
            throw new IllegalArgumentException("W1 booking confirmed requires valid ISO 6346 equipment id");
        }
    }

    public BookingConfirmedEvent(
            String eventId,
            String eventType,
            String schemaVersion,
            String source,
            Instant occurredAt,
            String correlationId,
            String idempotencyKey,
            String bookingId,
            int bookingRevision,
            String pricingRef,
            String customerId,
            String originLocationId,
            String destinationLocationId,
            String containerId,
            String equipmentTypeId) {
        this(eventId, eventType, source, occurredAt, correlationId, 1, bookingId, bookingRevision,
                List.of(new RoutingLeg(1, originLocationId, destinationLocationId, "legacy-voyage")),
                List.of(new EquipmentAssignment(equipmentTypeId, 1, containerId)));
    }

    public static BookingConfirmedEvent fromPayload(Map<String, String> payload) {
        int routeCount = Integer.parseInt(payload.getOrDefault("data.routing.count", "0"));
        List<RoutingLeg> routing = new ArrayList<>();
        for (int index = 0; index < routeCount; index++) {
            routing.add(new RoutingLeg(
                    Integer.parseInt(payload.get("data.routing." + index + ".legSequence")),
                    payload.get("data.routing." + index + ".loadUnLocode"),
                    payload.get("data.routing." + index + ".dischargeUnLocode"),
                    payload.get("data.routing." + index + ".voyageId")));
        }
        int equipmentCount = Integer.parseInt(payload.getOrDefault("data.equipment.count", "0"));
        List<EquipmentAssignment> equipment = new ArrayList<>();
        for (int index = 0; index < equipmentCount; index++) {
            equipment.add(new EquipmentAssignment(
                    payload.get("data.equipment." + index + ".equipmentTypeCode"),
                    Integer.parseInt(payload.get("data.equipment." + index + ".quantity")),
                    payload.get("data.equipment." + index + ".equipmentId")));
        }
        return new BookingConfirmedEvent(
                payload.get("id"),
                payload.get("type"),
                payload.get("source"),
                Instant.parse(payload.get("time")),
                payload.get("correlationId"),
                Integer.parseInt(payload.get("dataSchemaVersion")),
                payload.get("data.bookingId"),
                Integer.parseInt(payload.get("data.bookingRevision")),
                routing,
                equipment);
    }

    public String idempotencyKey() {
        return eventId;
    }

    public List<String> routeLocationIds() {
        List<String> locations = new ArrayList<>();
        for (RoutingLeg leg : routing) {
            if (locations.isEmpty()) {
                locations.add(leg.loadUnLocode());
            }
            locations.add(leg.dischargeUnLocode());
        }
        return List.copyOf(locations);
    }

    public String journeyContainerId() {
        return equipment.get(0).equipmentId();
    }

    public record RoutingLeg(int legSequence, String loadUnLocode, String dischargeUnLocode, String voyageId) {
        public RoutingLeg {
            require(loadUnLocode, "load UN/LOCODE is required");
            require(dischargeUnLocode, "discharge UN/LOCODE is required");
            require(voyageId, "voyage id is required");
            loadUnLocode = loadUnLocode.trim().toUpperCase();
            dischargeUnLocode = dischargeUnLocode.trim().toUpperCase();
        }
    }

    public record EquipmentAssignment(String equipmentTypeCode, int quantity, String equipmentId) {
        public EquipmentAssignment {
            require(equipmentTypeCode, "equipment type code is required");
            equipmentTypeCode = equipmentTypeCode.trim().toUpperCase();
            equipmentId = equipmentId == null ? "" : equipmentId.trim().toUpperCase();
        }

        boolean validPhysicalEquipmentId() {
            return equipmentId.matches("[A-Z]{3}[UJZ][0-9]{7}") && iso6346CheckDigit(equipmentId) == equipmentId.charAt(10) - '0';
        }

        private static int iso6346CheckDigit(String value) {
            int sum = 0;
            for (int index = 0; index < 10; index++) {
                char character = value.charAt(index);
                int number = Character.isDigit(character) ? character - '0' : letterValue(character);
                sum += number << index;
            }
            return sum % 11 % 10;
        }

        private static int letterValue(char character) {
            int value = character - 'A' + 10;
            return value + (value - 1) / 10;
        }
    }

    private static void require(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
    }
}

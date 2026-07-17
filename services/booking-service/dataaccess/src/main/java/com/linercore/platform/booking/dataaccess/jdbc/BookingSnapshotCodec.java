package com.linercore.platform.booking.dataaccess.jdbc;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.linercore.platform.booking.domain.model.Booking;
import com.linercore.platform.booking.domain.model.BookingException;
import com.linercore.platform.booking.domain.model.BookingId;
import com.linercore.platform.booking.domain.model.BookingStatus;
import com.linercore.platform.booking.domain.model.DndTriggerCandidate;
import com.linercore.platform.booking.domain.model.LifecycleEvent;
import com.linercore.platform.booking.domain.model.PricingSnapshot;
import com.linercore.platform.booking.domain.model.EquipmentAssignment;
import com.linercore.platform.booking.domain.model.RoutingLeg;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

final class BookingSnapshotCodec {
    private final ObjectMapper mapper;

    BookingSnapshotCodec(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    String write(Booking booking) {
        try {
            return mapper.writeValueAsString(booking);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("cannot serialize booking snapshot", ex);
        }
    }

    Booking read(String snapshot) {
        try {
            JsonNode root = mapper.readTree(snapshot);
            if (root.has("routing") && root.has("equipment")) {
                return mapper.treeToValue(root, Booking.class);
            }
            LegacyBooking legacy = mapper.treeToValue(root, LegacyBooking.class);
            Map<String, String> attributes = new HashMap<>(legacy.attributes() == null ? Map.of() : legacy.attributes());
            put(attributes, "originLocationId", legacy.originLocationId());
            put(attributes, "destinationLocationId", legacy.destinationLocationId());
            put(attributes, "equipmentType", legacy.equipmentType());
            Booking canonical = canonicalLegacy(legacy, attributes);
            if (canonical != null) {
                return canonical;
            }
            return Booking.legacyIncomplete(legacy.id(), legacy.bookingNumber(), legacy.revision(), legacy.status(),
                    legacy.customerId(), legacy.pricingSnapshot(), legacy.exceptions(), legacy.dndTriggerCandidates(),
                    legacy.lifecycleEvents(), attributes);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("cannot deserialize booking snapshot", ex);
        }
    }

    private static Booking canonicalLegacy(LegacyBooking legacy, Map<String, String> attributes) {
        String voyageId = attributes.get("voyageId");
        String equipmentId = firstNonBlank(attributes.get("equipmentId"), attributes.get("containerId"));
        try {
            RoutingLeg leg = new RoutingLeg(
                    1, legacy.originLocationId(), legacy.destinationLocationId(), voyageId);
            EquipmentAssignment assignment = new EquipmentAssignment(legacy.equipmentType(), 1, equipmentId);
            Map<String, String> remaining = new HashMap<>(attributes);
            remaining.keySet().removeAll(Set.of(
                    "originLocationId", "destinationLocationId", "equipmentType", "voyageId", "equipmentId",
                    "containerId"));
            return new Booking(
                    legacy.id(), legacy.bookingNumber(), legacy.revision(), legacy.status(), legacy.customerId(),
                    List.of(leg), List.of(assignment), "USD", "FCL_DRY", false, false, false,
                    null, legacy.pricingSnapshot(), legacy.exceptions(), legacy.dndTriggerCandidates(),
                    legacy.lifecycleEvents(), remaining);
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

    private static String firstNonBlank(String first, String second) {
        return first != null && !first.isBlank() ? first : second;
    }

    private static void put(Map<String, String> attributes, String key, String value) {
        if (value != null && !value.isBlank()) {
            attributes.putIfAbsent(key, value);
        }
    }

    private record LegacyBooking(
            BookingId id,
            String bookingNumber,
            int revision,
            BookingStatus status,
            String customerId,
            String originLocationId,
            String destinationLocationId,
            String equipmentType,
            PricingSnapshot pricingSnapshot,
            List<BookingException> exceptions,
            List<DndTriggerCandidate> dndTriggerCandidates,
            List<LifecycleEvent> lifecycleEvents,
            Map<String, String> attributes) {
    }
}

package com.linercore.platform.booking.domain.outbox;

import com.linercore.platform.booking.domain.model.Booking;
import com.linercore.platform.booking.domain.model.EquipmentAssignment;
import com.linercore.platform.booking.domain.model.RoutingLeg;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HashMap;
import static java.util.Map.entry;
import java.util.Map;
import java.util.UUID;

public class BookingEventMapper {
    public static final String SCHEMA_VERSION = "1.0.0";
    private static final String EVENT_TYPE = "booking.confirmed";
    private static final int DATA_SCHEMA_VERSION = 1;
    private static final char UNIT_SEPARATOR = '\u001f';
    private static final UUID BOOKING_CONFIRMED_NAMESPACE =
            UUID.fromString("0d173f67-77ce-5af4-91be-6f29dc59c884");

    public BookingOutboxEvent confirmedEvent(String ignoredEventId, Booking booking, String correlationId, Instant now) {
        String eventId = deterministicEventId(booking);
        String deduplicationKey = booking.id().value() + ":" + booking.revision() + ":CONFIRMED";
        Map<String, String> payload = new HashMap<>(Map.ofEntries(
                entry("id", eventId),
                entry("source", "booking-service"),
                entry("type", EVENT_TYPE),
                entry("time", now.toString()),
                entry("correlationId", correlationId),
                entry("dataSchemaVersion", String.valueOf(DATA_SCHEMA_VERSION)),
                entry("data.bookingId", booking.id().value()),
                entry("data.bookingRevision", String.valueOf(booking.revision())),
                entry("data.routing.count", String.valueOf(booking.routing().size())),
                entry("data.equipment.count", String.valueOf(booking.equipment().size()))));
        for (int index = 0; index < booking.routing().size(); index++) {
            RoutingLeg leg = booking.routing().get(index);
            payload.put("data.routing." + index + ".legSequence", String.valueOf(leg.legSequence()));
            payload.put("data.routing." + index + ".loadUnLocode", canonical(leg.loadUnLocode(), "load UN/LOCODE"));
            payload.put("data.routing." + index + ".dischargeUnLocode",
                    canonical(leg.dischargeUnLocode(), "discharge UN/LOCODE"));
            payload.put("data.routing." + index + ".voyageId", rejectSeparator(leg.voyageId(), "voyage id"));
        }
        for (int index = 0; index < booking.equipment().size(); index++) {
            EquipmentAssignment equipment = booking.equipment().get(index);
            payload.put("data.equipment." + index + ".equipmentTypeCode",
                    rejectSeparator(equipment.equipmentTypeCode(), "equipment type code"));
            payload.put("data.equipment." + index + ".quantity", String.valueOf(equipment.quantity()));
            if (equipment.equipmentId() != null && !equipment.equipmentId().isBlank()) {
                payload.put("data.equipment." + index + ".equipmentId",
                        rejectSeparator(equipment.equipmentId(), "equipment id"));
            }
        }
        return new BookingOutboxEvent(eventId, EVENT_TYPE, SCHEMA_VERSION, booking.id().value(), booking.bookingNumber(),
                booking.revision(), EVENT_TYPE + "-value", "booking-service", deduplicationKey, correlationId, now,
                Map.copyOf(payload), OutboxStatus.PENDING, 0, null, null, null, null, null);
    }

    private static String deterministicEventId(Booking booking) {
        String name = EVENT_TYPE + UNIT_SEPARATOR + rejectSeparator(booking.id().value(), "booking id")
                + UNIT_SEPARATOR + booking.revision();
        return uuidV5(BOOKING_CONFIRMED_NAMESPACE, name).toString();
    }

    private static UUID uuidV5(UUID namespace, String name) {
        try {
            MessageDigest sha1 = MessageDigest.getInstance("SHA-1");
            ByteBuffer namespaceBytes = ByteBuffer.allocate(16);
            namespaceBytes.putLong(namespace.getMostSignificantBits());
            namespaceBytes.putLong(namespace.getLeastSignificantBits());
            sha1.update(namespaceBytes.array());
            byte[] bytes = sha1.digest(name.getBytes(StandardCharsets.UTF_8));
            bytes[6] &= 0x0f;
            bytes[6] |= 0x50;
            bytes[8] &= 0x3f;
            bytes[8] |= 0x80;
            ByteBuffer buffer = ByteBuffer.wrap(bytes, 0, 16);
            return new UUID(buffer.getLong(), buffer.getLong());
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-1 unavailable for UUIDv5", exception);
        }
    }

    private static String canonical(String value, String label) {
        return rejectSeparator(value, label).toUpperCase();
    }

    private static String rejectSeparator(String value, String label) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(label + " is required");
        }
        if (value.indexOf(UNIT_SEPARATOR) >= 0) {
            throw new IllegalArgumentException(label + " contains a forbidden separator");
        }
        return value.trim();
    }
}

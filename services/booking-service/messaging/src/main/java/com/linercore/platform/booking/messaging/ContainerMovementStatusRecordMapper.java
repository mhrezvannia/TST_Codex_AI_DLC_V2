package com.linercore.platform.booking.messaging;

import com.linercore.platform.booking.applicationservice.event.MovementStatusReceivedEvent;
import com.linercore.platform.booking.applicationservice.port.MovementLocation;
import java.time.Instant;
import org.apache.avro.generic.GenericRecord;

public class ContainerMovementStatusRecordMapper {
    public MovementStatusReceivedEvent map(GenericRecord record, String key) {
        GenericRecord data = record(record, "data");
        String bookingRef = string(data, "bookingRef");
        String containerRef = string(data, "containerRef");
        if (!key.equals(bookingRef + ":" + containerRef)) {
            throw new IllegalArgumentException("container movement status key mismatch");
        }
        return new MovementStatusReceivedEvent(
                string(record, "id"),
                string(record, "type"),
                string(record, "source"),
                Instant.parse(string(record, "time")),
                string(record, "correlationId"),
                (Integer) record.get("dataSchemaVersion"),
                bookingRef,
                containerRef,
                nullable(data, "movementId"),
                string(data, "moveCode"),
                string(data, "eventClassifierCode"),
                Instant.parse(string(data, "occurredDateTime")),
                Instant.parse(string(data, "receivedDateTime")),
                string(data, "derivedStatus"),
                string(data, "emptyIndicatorCode"),
                (Boolean) data.get("transshipment"),
                location(data));
    }

    private MovementLocation location(GenericRecord data) {
        Object value = data.get("location");
        if (!(value instanceof GenericRecord location)) {
            return null;
        }
        return new MovementLocation(
                nullable(location, "unLocationCode"),
                nullable(location, "facilityCode"),
                nullable(location, "facilityTypeCode"));
    }

    private GenericRecord record(GenericRecord record, String field) {
        Object value = record.get(field);
        if (!(value instanceof GenericRecord child)) {
            throw new IllegalArgumentException("missing record field " + field);
        }
        return child;
    }

    private String string(GenericRecord record, String field) {
        Object value = record.get(field);
        if (value == null || value.toString().isBlank()) {
            throw new IllegalArgumentException("missing field " + field);
        }
        return value.toString();
    }

    private String nullable(GenericRecord record, String field) {
        Object value = record.get(field);
        return value == null || value.toString().isBlank() ? null : value.toString();
    }
}

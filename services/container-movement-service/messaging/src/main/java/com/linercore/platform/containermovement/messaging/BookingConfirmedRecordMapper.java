package com.linercore.platform.containermovement.messaging;

import com.linercore.platform.containermovement.applicationservice.event.BookingConfirmedEvent;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.apache.avro.generic.GenericRecord;

public class BookingConfirmedRecordMapper {
    public BookingConfirmedEvent toEvent(GenericRecord record) {
        if (!"booking.confirmed".contentEquals(record.get("type").toString())) {
            throw new IllegalArgumentException("unsupported booking event type");
        }
        GenericRecord data = (GenericRecord) record.get("data");
        return new BookingConfirmedEvent(
                string(record, "id"),
                string(record, "type"),
                string(record, "source"),
                Instant.parse(string(record, "time")),
                string(record, "correlationId"),
                (Integer) record.get("dataSchemaVersion"),
                string(data, "bookingId"),
                (Integer) data.get("bookingRevision"),
                routing(data),
                equipment(data));
    }

    private List<BookingConfirmedEvent.RoutingLeg> routing(GenericRecord data) {
        List<BookingConfirmedEvent.RoutingLeg> legs = new ArrayList<>();
        for (Object item : (Iterable<?>) data.get("routing")) {
            GenericRecord leg = (GenericRecord) item;
            legs.add(new BookingConfirmedEvent.RoutingLeg(
                    (Integer) leg.get("legSequence"),
                    string(leg, "loadUnLocode"),
                    string(leg, "dischargeUnLocode"),
                    string(leg, "voyageId")));
        }
        return List.copyOf(legs);
    }

    private List<BookingConfirmedEvent.EquipmentAssignment> equipment(GenericRecord data) {
        List<BookingConfirmedEvent.EquipmentAssignment> assignments = new ArrayList<>();
        for (Object item : (Iterable<?>) data.get("equipment")) {
            GenericRecord equipment = (GenericRecord) item;
            Object equipmentId = equipment.get("equipmentId");
            assignments.add(new BookingConfirmedEvent.EquipmentAssignment(
                    string(equipment, "equipmentTypeCode"),
                    (Integer) equipment.get("quantity"),
                    equipmentId == null ? null : equipmentId.toString()));
        }
        return List.copyOf(assignments);
    }

    private String string(GenericRecord record, String field) {
        Object value = record.get(field);
        if (value == null || value.toString().isBlank()) {
            throw new IllegalArgumentException(field + " is required");
        }
        return value.toString();
    }
}

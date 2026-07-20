package com.linercore.platform.containermovement.messaging;

import com.linercore.platform.containermovement.applicationservice.ContainerMovementApplicationService;
import org.apache.avro.generic.GenericRecord;
import org.springframework.context.annotation.Profile;
import org.springframework.kafka.annotation.KafkaListener;

@Profile("kafka")
public class KafkaBookingConfirmedListener {
    private final ContainerMovementApplicationService service;
    private final BookingConfirmedRecordMapper mapper;

    public KafkaBookingConfirmedListener(
            ContainerMovementApplicationService service,
            BookingConfirmedRecordMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @KafkaListener(
            topics = "${container-movement.booking-confirmed.topic:booking.events}",
            groupId = "${container-movement.booking-confirmed.group-id:container-movement-booking-confirmed-v1}")
    public void onMessage(GenericRecord record) {
        service.consumeBookingConfirmed(mapper.toEvent(record));
    }
}

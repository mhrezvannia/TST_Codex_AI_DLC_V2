package com.linercore.platform.booking.messaging;

import com.linercore.platform.booking.applicationservice.BookingApplicationService;
import org.apache.avro.generic.GenericRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;

public class KafkaContainerMovementStatusListener {
    private final BookingApplicationService service;
    private final ContainerMovementStatusRecordMapper mapper;

    public KafkaContainerMovementStatusListener(
            BookingApplicationService service,
            ContainerMovementStatusRecordMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @KafkaListener(
            topics = "${booking.container-movement-status.topic:containermovement.status}",
            groupId = "${booking.container-movement-status.group-id:booking-container-movement-status-v1}")
    public void onStatus(
            @Payload GenericRecord record,
            @Header(KafkaHeaders.RECEIVED_KEY) String key) {
        service.consumeMovementStatus(mapper.map(record, key));
    }
}

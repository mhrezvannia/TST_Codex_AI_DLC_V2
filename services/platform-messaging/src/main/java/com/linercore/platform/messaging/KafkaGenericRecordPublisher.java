package com.linercore.platform.messaging;

import java.time.Clock;
import java.time.Instant;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import org.apache.avro.generic.GenericRecord;
import org.apache.kafka.clients.producer.RecordMetadata;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;

/**
 * Transport half of the outbox relay: sends an already-built Avro {@link GenericRecord} to a topic
 * and reports the real broker coordinates. Service-specific event-to-record mapping stays in each
 * service; this class is schema-agnostic and shared.
 */
public class KafkaGenericRecordPublisher {
    private final KafkaTemplate<String, GenericRecord> kafka;
    private final Clock clock;
    private final long timeoutSeconds;

    public KafkaGenericRecordPublisher(KafkaTemplate<String, GenericRecord> kafka, Clock clock) {
        this(kafka, clock, 10);
    }

    public KafkaGenericRecordPublisher(KafkaTemplate<String, GenericRecord> kafka, Clock clock, long timeoutSeconds) {
        this.kafka = kafka;
        this.clock = clock;
        this.timeoutSeconds = timeoutSeconds;
    }

    public BrokerMetadata publish(String topic, String key, GenericRecord record) {
        try {
            SendResult<String, GenericRecord> result = kafka.send(topic, key, record).get(timeoutSeconds, TimeUnit.SECONDS);
            RecordMetadata metadata = result.getRecordMetadata();
            return new BrokerMetadata(metadata.topic(), metadata.partition(), metadata.offset(), Instant.now(clock));
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new EventPublicationException("KAFKA_PUBLISH_INTERRUPTED", ex.getMessage(), true);
        } catch (ExecutionException | TimeoutException ex) {
            throw new EventPublicationException("KAFKA_PUBLISH_FAILED", rootMessage(ex), true);
        }
    }

    private String rootMessage(Exception ex) {
        Throwable cause = ex.getCause();
        return cause == null || cause.getMessage() == null ? ex.getMessage() : cause.getMessage();
    }
}

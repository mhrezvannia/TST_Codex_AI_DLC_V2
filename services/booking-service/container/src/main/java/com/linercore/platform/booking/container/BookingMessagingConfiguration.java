package com.linercore.platform.booking.container;

import com.linercore.platform.booking.applicationservice.BookingApplicationService;
import com.linercore.platform.booking.applicationservice.port.BookingEventPublisherPort;
import com.linercore.platform.booking.applicationservice.port.SchemaRegistryPort;
import com.linercore.platform.booking.applicationservice.query.PublishBatchResult;
import com.linercore.platform.booking.messaging.ConfluentSchemaRegistryAdapter;
import com.linercore.platform.booking.messaging.KafkaBookingEventPublisher;
import com.linercore.platform.booking.messaging.LocalNoopBookingEventPublisher;
import com.linercore.platform.booking.messaging.LocalNoopSchemaRegistryAdapter;
import com.linercore.platform.messaging.AvroProducerConfig;
import com.linercore.platform.messaging.AvroSchemaRepository;
import com.linercore.platform.messaging.ConfluentSchemaRegistrar;
import com.linercore.platform.messaging.KafkaGenericRecordPublisher;
import com.linercore.platform.messaging.RelayBatchResult;
import com.linercore.platform.messaging.ScheduledOutboxRelay;
import io.confluent.kafka.schemaregistry.client.CachedSchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import java.nio.file.Path;
import java.time.Clock;
import org.apache.avro.generic.GenericRecord;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;

@Configuration
public class BookingMessagingConfiguration {
    @Bean
    @Profile("kafka")
    AvroSchemaRepository bookingEventSchemas(
            @Value("${booking.messaging.schema-classpath-base:avro}") String classpathBase,
            @Value("${booking.messaging.schema-file-base:contracts/avro}") String fileBase) {
        return new AvroSchemaRepository(classpathBase, Path.of(fileBase));
    }

    @Bean
    @Profile("kafka")
    SchemaRegistryClient bookingSchemaRegistryClient(
            @Value("${booking.schema-registry.url}") String schemaRegistryUrl) {
        return new CachedSchemaRegistryClient(schemaRegistryUrl, 100);
    }

    @Bean
    @Profile("kafka")
    ProducerFactory<String, GenericRecord> bookingEventProducerFactory(
            @Value("${booking.kafka.bootstrap-servers}") String bootstrapServers,
            @Value("${booking.schema-registry.url}") String schemaRegistryUrl,
            @Value("${booking.kafka.client-id:booking-service}") String clientId) {
        return new DefaultKafkaProducerFactory<>(
                AvroProducerConfig.avroProducerProps(bootstrapServers, schemaRegistryUrl, clientId));
    }

    @Bean
    @Profile("kafka")
    KafkaTemplate<String, GenericRecord> bookingEventKafkaTemplate(
            ProducerFactory<String, GenericRecord> bookingEventProducerFactory) {
        return new KafkaTemplate<>(bookingEventProducerFactory);
    }

    @Bean
    @Profile("kafka")
    KafkaGenericRecordPublisher bookingGenericRecordPublisher(
            KafkaTemplate<String, GenericRecord> bookingEventKafkaTemplate) {
        return new KafkaGenericRecordPublisher(bookingEventKafkaTemplate, Clock.systemUTC());
    }

    @Bean
    @Profile("kafka")
    BookingEventPublisherPort bookingEventPublisher(
            KafkaGenericRecordPublisher bookingGenericRecordPublisher,
            AvroSchemaRepository bookingEventSchemas,
            @Value("${booking.kafka.topic:booking.events}") String topic) {
        return new KafkaBookingEventPublisher(bookingGenericRecordPublisher, bookingEventSchemas, topic);
    }

    @Bean
    @Profile("kafka")
    SchemaRegistryPort bookingSchemaRegistry(
            SchemaRegistryClient bookingSchemaRegistryClient,
            AvroSchemaRepository bookingEventSchemas) {
        return new ConfluentSchemaRegistryAdapter(
                new ConfluentSchemaRegistrar(bookingSchemaRegistryClient), bookingEventSchemas);
    }

    @Bean
    @Profile("local-noop")
    BookingEventPublisherPort localNoopBookingEventPublisher() {
        return new LocalNoopBookingEventPublisher();
    }

    @Bean
    @Profile("local-noop")
    SchemaRegistryPort localNoopBookingSchemaRegistry() {
        return new LocalNoopSchemaRegistryAdapter();
    }

    @Bean
    @ConditionalOnProperty(prefix = "booking.outbox-relay", name = "enabled",
            havingValue = "true", matchIfMissing = true)
    ScheduledOutboxRelay bookingOutboxRelay(
            BookingApplicationService service,
            @Value("${booking.outbox-relay.worker-id:booking-relay}") String workerId,
            @Value("${booking.outbox-relay.batch-size:50}") int batchSize) {
        return new ScheduledOutboxRelay("booking", (worker, size) -> {
            PublishBatchResult result = service.publishOutboxBatch(worker, size);
            return new RelayBatchResult(result.claimed(), result.published(),
                    result.retryableFailures(), result.permanentFailures());
        }, workerId, batchSize);
    }
}

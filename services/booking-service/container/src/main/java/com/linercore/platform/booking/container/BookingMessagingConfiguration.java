package com.linercore.platform.booking.container;

import com.linercore.platform.booking.applicationservice.BookingApplicationService;
import com.linercore.platform.booking.applicationservice.port.BookingEventPublisherPort;
import com.linercore.platform.booking.applicationservice.port.SchemaRegistryPort;
import com.linercore.platform.booking.applicationservice.query.PublishBatchResult;
import com.linercore.platform.booking.messaging.ConfluentSchemaRegistryAdapter;
import com.linercore.platform.booking.messaging.ContainerMovementStatusRecordMapper;
import com.linercore.platform.booking.messaging.KafkaBookingEventPublisher;
import com.linercore.platform.booking.messaging.KafkaContainerMovementStatusListener;
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
import io.confluent.kafka.serializers.KafkaAvroDeserializer;
import io.confluent.kafka.serializers.KafkaAvroDeserializerConfig;
import java.nio.file.Path;
import java.time.Clock;
import java.util.HashMap;
import java.util.Map;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.avro.generic.GenericRecord;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;

@Configuration
@EnableKafka
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
    ConsumerFactory<String, GenericRecord> bookingMovementStatusConsumerFactory(
            @Value("${booking.kafka.bootstrap-servers}") String bootstrapServers,
            @Value("${booking.schema-registry.url}") String schemaRegistryUrl,
            @Value("${booking.container-movement-status.group-id:booking-container-movement-status-v1}") String groupId) {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, KafkaAvroDeserializer.class);
        props.put(KafkaAvroDeserializerConfig.SCHEMA_REGISTRY_URL_CONFIG, schemaRegistryUrl);
        props.put(KafkaAvroDeserializerConfig.SPECIFIC_AVRO_READER_CONFIG, false);
        return new DefaultKafkaConsumerFactory<>(props);
    }

    @Bean
    @Profile("kafka")
    ConcurrentKafkaListenerContainerFactory<String, GenericRecord> kafkaListenerContainerFactory(
            ConsumerFactory<String, GenericRecord> bookingMovementStatusConsumerFactory) {
        ConcurrentKafkaListenerContainerFactory<String, GenericRecord> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(bookingMovementStatusConsumerFactory);
        factory.setConcurrency(3);
        return factory;
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
    @Profile("kafka")
    ContainerMovementStatusRecordMapper containerMovementStatusRecordMapper() {
        return new ContainerMovementStatusRecordMapper();
    }

    @Bean
    @Profile("kafka")
    KafkaContainerMovementStatusListener containerMovementStatusListener(
            BookingApplicationService service,
            ContainerMovementStatusRecordMapper mapper) {
        return new KafkaContainerMovementStatusListener(service, mapper);
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

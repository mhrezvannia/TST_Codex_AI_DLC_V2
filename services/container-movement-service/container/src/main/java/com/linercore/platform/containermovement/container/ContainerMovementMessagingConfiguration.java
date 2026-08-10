package com.linercore.platform.containermovement.container;

import com.linercore.platform.containermovement.applicationservice.ContainerMovementApplicationService;
import com.linercore.platform.containermovement.applicationservice.port.MovementEventPublisherPort;
import com.linercore.platform.containermovement.applicationservice.port.SchemaRegistryPort;
import com.linercore.platform.containermovement.applicationservice.query.PublishBatchResult;
import com.linercore.platform.containermovement.messaging.ConfluentSchemaRegistryAdapter;
import com.linercore.platform.containermovement.messaging.BookingConfirmedRecordMapper;
import com.linercore.platform.containermovement.messaging.KafkaBookingConfirmedListener;
import com.linercore.platform.containermovement.messaging.KafkaContainerMovementEventPublisher;
import com.linercore.platform.containermovement.messaging.LocalNoopMovementEventPublisher;
import com.linercore.platform.containermovement.messaging.LocalNoopSchemaRegistryAdapter;
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
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;

@Configuration
@EnableKafka
public class ContainerMovementMessagingConfiguration {
    @Bean
    @Profile("kafka")
    AvroSchemaRepository movementEventSchemas(
            @Value("${container-movement.messaging.schema-classpath-base:avro}") String classpathBase,
            @Value("${container-movement.messaging.schema-file-base:contracts/avro}") String fileBase) {
        return new AvroSchemaRepository(classpathBase, Path.of(fileBase));
    }

    @Bean
    @Profile("kafka")
    SchemaRegistryClient movementSchemaRegistryClient(
            @Value("${container-movement.schema-registry.url}") String schemaRegistryUrl) {
        return new CachedSchemaRegistryClient(schemaRegistryUrl, 100);
    }

    @Bean
    @Profile("kafka")
    ProducerFactory<String, GenericRecord> movementEventProducerFactory(
            @Value("${container-movement.kafka.bootstrap-servers}") String bootstrapServers,
            @Value("${container-movement.schema-registry.url}") String schemaRegistryUrl,
            @Value("${container-movement.kafka.client-id:container-movement-service}") String clientId) {
        return new DefaultKafkaProducerFactory<>(
                AvroProducerConfig.avroProducerProps(bootstrapServers, schemaRegistryUrl, clientId));
    }

    @Bean
    @Profile("kafka")
    KafkaTemplate<String, GenericRecord> movementEventKafkaTemplate(
            ProducerFactory<String, GenericRecord> movementEventProducerFactory) {
        return new KafkaTemplate<>(movementEventProducerFactory);
    }

    @Bean
    @Profile("kafka")
    KafkaGenericRecordPublisher movementGenericRecordPublisher(
            KafkaTemplate<String, GenericRecord> movementEventKafkaTemplate) {
        return new KafkaGenericRecordPublisher(movementEventKafkaTemplate, Clock.systemUTC());
    }

    @Bean
    @Profile("kafka")
    MovementEventPublisherPort movementEventPublisher(
            KafkaGenericRecordPublisher movementGenericRecordPublisher,
            AvroSchemaRepository movementEventSchemas,
            @Value("${container-movement.kafka.topic:containermovement.status}") String topic) {
        return new KafkaContainerMovementEventPublisher(movementGenericRecordPublisher, movementEventSchemas, topic);
    }

    @Bean
    @Profile("kafka")
    SchemaRegistryPort movementSchemaRegistry(
            SchemaRegistryClient movementSchemaRegistryClient,
            AvroSchemaRepository movementEventSchemas) {
        return new ConfluentSchemaRegistryAdapter(
                new ConfluentSchemaRegistrar(movementSchemaRegistryClient), movementEventSchemas);
    }

    @Bean
    @Profile("kafka")
    BookingConfirmedRecordMapper bookingConfirmedRecordMapper() {
        return new BookingConfirmedRecordMapper();
    }

    @Bean
    @Profile("kafka")
    KafkaBookingConfirmedListener bookingConfirmedListener(
            ContainerMovementApplicationService service,
            BookingConfirmedRecordMapper bookingConfirmedRecordMapper) {
        return new KafkaBookingConfirmedListener(service, bookingConfirmedRecordMapper);
    }

    @Bean
    @Profile("local-noop")
    MovementEventPublisherPort localNoopMovementEventPublisher() {
        return new LocalNoopMovementEventPublisher();
    }

    @Bean
    @Profile("local-noop")
    SchemaRegistryPort localNoopMovementSchemaRegistry() {
        return new LocalNoopSchemaRegistryAdapter();
    }

    @Bean
    @ConditionalOnProperty(prefix = "container-movement.outbox-relay", name = "enabled",
            havingValue = "true", matchIfMissing = true)
    ScheduledOutboxRelay movementOutboxRelay(
            ContainerMovementApplicationService service,
            @Value("${container-movement.outbox-relay.worker-id:container-movement-relay}") String workerId,
            @Value("${container-movement.outbox-relay.batch-size:50}") int batchSize) {
        return new ScheduledOutboxRelay("container-movement", (worker, size) -> {
            PublishBatchResult result = service.publishOutboxBatch(worker, size);
            return new RelayBatchResult(result.claimed(), result.published(),
                    result.retryableFailures(), result.permanentFailures());
        }, workerId, batchSize);
    }
}

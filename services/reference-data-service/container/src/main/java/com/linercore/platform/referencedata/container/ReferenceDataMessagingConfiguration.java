package com.linercore.platform.referencedata.container;

import com.linercore.platform.messaging.AvroProducerConfig;
import com.linercore.platform.messaging.AvroSchemaRepository;
import com.linercore.platform.messaging.ConfluentSchemaRegistrar;
import com.linercore.platform.messaging.KafkaGenericRecordPublisher;
import com.linercore.platform.messaging.RelayBatchResult;
import com.linercore.platform.messaging.ScheduledOutboxRelay;
import com.linercore.platform.referencedata.applicationservice.ReferenceDataApplicationService;
import com.linercore.platform.referencedata.applicationservice.port.ReferenceEventPublisherPort;
import com.linercore.platform.referencedata.applicationservice.port.SchemaRegistryPort;
import com.linercore.platform.referencedata.applicationservice.query.PublishBatchResult;
import com.linercore.platform.referencedata.messaging.ConfluentSchemaRegistryAdapter;
import com.linercore.platform.referencedata.messaging.KafkaReferenceEventPublisher;
import com.linercore.platform.referencedata.messaging.LocalNoopReferenceEventPublisher;
import com.linercore.platform.referencedata.messaging.LocalNoopSchemaRegistryAdapter;
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

/**
 * Wires reference-data eventing on top of the shared platform-messaging module: schema loading,
 * the generic Kafka publisher, schema registration, no-op adapters, and the scheduled outbox relay
 * all come from {@code com.linercore.platform.messaging}; only the reference-data-specific adapters
 * and topic/config values live here.
 */
@Configuration
public class ReferenceDataMessagingConfiguration {

    @Bean
    @Profile("kafka")
    AvroSchemaRepository referenceEventSchemas(
            @Value("${reference-data.messaging.schema-classpath-base:avro}") String classpathBase,
            @Value("${reference-data.messaging.schema-file-base:contracts/avro}") String fileBase) {
        return new AvroSchemaRepository(classpathBase, Path.of(fileBase));
    }

    @Bean
    @Profile("kafka")
    SchemaRegistryClient schemaRegistryClient(@Value("${reference-data.schema-registry.url}") String schemaRegistryUrl) {
        return new CachedSchemaRegistryClient(schemaRegistryUrl, 100);
    }

    @Bean
    @Profile("kafka")
    ProducerFactory<String, GenericRecord> referenceEventProducerFactory(
            @Value("${reference-data.kafka.bootstrap-servers}") String bootstrapServers,
            @Value("${reference-data.schema-registry.url}") String schemaRegistryUrl,
            @Value("${reference-data.kafka.client-id:reference-data-service}") String clientId) {
        return new DefaultKafkaProducerFactory<>(
                AvroProducerConfig.avroProducerProps(bootstrapServers, schemaRegistryUrl, clientId));
    }

    @Bean
    @Profile("kafka")
    KafkaTemplate<String, GenericRecord> referenceEventKafkaTemplate(
            ProducerFactory<String, GenericRecord> referenceEventProducerFactory) {
        return new KafkaTemplate<>(referenceEventProducerFactory);
    }

    @Bean
    @Profile("kafka")
    KafkaGenericRecordPublisher referenceEventGenericPublisher(
            KafkaTemplate<String, GenericRecord> referenceEventKafkaTemplate) {
        return new KafkaGenericRecordPublisher(referenceEventKafkaTemplate, Clock.systemUTC());
    }

    @Bean
    @Profile("kafka")
    ReferenceEventPublisherPort referenceEventPublisherPort(
            KafkaGenericRecordPublisher referenceEventGenericPublisher,
            AvroSchemaRepository referenceEventSchemas,
            @Value("${reference-data.kafka.topic:referencedata.events}") String topic) {
        return new KafkaReferenceEventPublisher(referenceEventGenericPublisher, referenceEventSchemas, topic);
    }

    @Bean
    @Profile("kafka")
    SchemaRegistryPort schemaRegistryPort(
            SchemaRegistryClient schemaRegistryClient,
            AvroSchemaRepository referenceEventSchemas) {
        return new ConfluentSchemaRegistryAdapter(new ConfluentSchemaRegistrar(schemaRegistryClient), referenceEventSchemas);
    }

    @Bean
    @Profile("local-noop")
    ReferenceEventPublisherPort localNoopReferenceEventPublisherPort() {
        return new LocalNoopReferenceEventPublisher();
    }

    @Bean
    @Profile("local-noop")
    SchemaRegistryPort localNoopSchemaRegistryPort() {
        return new LocalNoopSchemaRegistryAdapter();
    }

    @Bean
    @ConditionalOnProperty(prefix = "reference-data.outbox-relay", name = "enabled", havingValue = "true", matchIfMissing = true)
    ScheduledOutboxRelay referenceDataOutboxRelay(
            ReferenceDataApplicationService service,
            @Value("${reference-data.outbox-relay.worker-id:reference-data-relay}") String workerId,
            @Value("${reference-data.outbox-relay.batch-size:50}") int batchSize) {
        return new ScheduledOutboxRelay("reference-data", (worker, size) -> {
            PublishBatchResult result = service.publishOutboxBatch(worker, size);
            return new RelayBatchResult(result.claimed(), result.published(),
                    result.retryableFailures(), result.permanentFailures());
        }, workerId, batchSize);
    }
}

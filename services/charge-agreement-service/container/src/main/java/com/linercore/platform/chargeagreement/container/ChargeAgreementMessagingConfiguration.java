package com.linercore.platform.chargeagreement.container;

import com.linercore.platform.chargeagreement.applicationservice.ChargeAgreementApplicationService;
import com.linercore.platform.chargeagreement.applicationservice.port.AgreementEventPublisherPort;
import com.linercore.platform.chargeagreement.applicationservice.port.SchemaRegistryPort;
import com.linercore.platform.chargeagreement.applicationservice.query.PublishBatchResult;
import com.linercore.platform.chargeagreement.messaging.ConfluentSchemaRegistryAdapter;
import com.linercore.platform.chargeagreement.messaging.KafkaAgreementEventPublisher;
import com.linercore.platform.chargeagreement.messaging.LocalNoopAgreementEventPublisher;
import com.linercore.platform.chargeagreement.messaging.LocalNoopSchemaRegistryAdapter;
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
public class ChargeAgreementMessagingConfiguration {
    @Bean
    @Profile("kafka")
    AvroSchemaRepository agreementEventSchemas(
            @Value("${charge-agreement.messaging.schema-classpath-base:avro}") String classpathBase,
            @Value("${charge-agreement.messaging.schema-file-base:contracts/avro}") String fileBase) {
        return new AvroSchemaRepository(classpathBase, Path.of(fileBase));
    }

    @Bean
    @Profile("kafka")
    SchemaRegistryClient agreementSchemaRegistryClient(
            @Value("${charge-agreement.schema-registry.url}") String schemaRegistryUrl) {
        return new CachedSchemaRegistryClient(schemaRegistryUrl, 100);
    }

    @Bean
    @Profile("kafka")
    ProducerFactory<String, GenericRecord> agreementEventProducerFactory(
            @Value("${charge-agreement.kafka.bootstrap-servers}") String bootstrapServers,
            @Value("${charge-agreement.schema-registry.url}") String schemaRegistryUrl,
            @Value("${charge-agreement.kafka.client-id:charge-agreement-service}") String clientId) {
        return new DefaultKafkaProducerFactory<>(
                AvroProducerConfig.avroProducerProps(bootstrapServers, schemaRegistryUrl, clientId));
    }

    @Bean
    @Profile("kafka")
    KafkaTemplate<String, GenericRecord> agreementEventKafkaTemplate(
            ProducerFactory<String, GenericRecord> agreementEventProducerFactory) {
        return new KafkaTemplate<>(agreementEventProducerFactory);
    }

    @Bean
    @Profile("kafka")
    KafkaGenericRecordPublisher agreementGenericRecordPublisher(
            KafkaTemplate<String, GenericRecord> agreementEventKafkaTemplate) {
        return new KafkaGenericRecordPublisher(agreementEventKafkaTemplate, Clock.systemUTC());
    }

    @Bean
    @Profile("kafka")
    AgreementEventPublisherPort agreementEventPublisher(
            KafkaGenericRecordPublisher agreementGenericRecordPublisher,
            AvroSchemaRepository agreementEventSchemas,
            @Value("${charge-agreement.kafka.topic:charge-agreement.events}") String topic) {
        return new KafkaAgreementEventPublisher(agreementGenericRecordPublisher, agreementEventSchemas, topic);
    }

    @Bean
    @Profile("kafka")
    SchemaRegistryPort agreementSchemaRegistry(
            SchemaRegistryClient agreementSchemaRegistryClient,
            AvroSchemaRepository agreementEventSchemas) {
        return new ConfluentSchemaRegistryAdapter(
                new ConfluentSchemaRegistrar(agreementSchemaRegistryClient), agreementEventSchemas);
    }

    @Bean
    @Profile("local-noop")
    AgreementEventPublisherPort localNoopAgreementEventPublisher() {
        return new LocalNoopAgreementEventPublisher();
    }

    @Bean
    @Profile("local-noop")
    SchemaRegistryPort localNoopAgreementSchemaRegistry() {
        return new LocalNoopSchemaRegistryAdapter();
    }

    @Bean
    @ConditionalOnProperty(prefix = "charge-agreement.outbox-relay", name = "enabled",
            havingValue = "true", matchIfMissing = true)
    ScheduledOutboxRelay agreementOutboxRelay(
            ChargeAgreementApplicationService service,
            @Value("${charge-agreement.outbox-relay.worker-id:charge-agreement-relay}") String workerId,
            @Value("${charge-agreement.outbox-relay.batch-size:50}") int batchSize) {
        return new ScheduledOutboxRelay("charge-agreement", (worker, size) -> {
            PublishBatchResult result = service.publishOutboxBatch(worker, size);
            return new RelayBatchResult(result.claimed(), result.published(),
                    result.retryableFailures(), result.permanentFailures());
        }, workerId, batchSize);
    }
}

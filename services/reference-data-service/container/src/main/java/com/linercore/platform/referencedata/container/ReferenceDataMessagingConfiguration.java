package com.linercore.platform.referencedata.container;

import com.linercore.platform.referencedata.applicationservice.port.ReferenceEventPublisherPort;
import com.linercore.platform.referencedata.applicationservice.port.SchemaRegistryPort;
import com.linercore.platform.referencedata.messaging.AvroSchemaRepository;
import com.linercore.platform.referencedata.messaging.ConfluentSchemaRegistryAdapter;
import com.linercore.platform.referencedata.messaging.KafkaReferenceEventPublisher;
import com.linercore.platform.referencedata.messaging.LocalNoopReferenceEventPublisher;
import com.linercore.platform.referencedata.messaging.LocalNoopSchemaRegistryAdapter;
import io.confluent.kafka.serializers.KafkaAvroSerializer;
import io.confluent.kafka.schemaregistry.client.CachedSchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.serializers.AbstractKafkaSchemaSerDeConfig;
import java.nio.file.Path;
import java.time.Clock;
import java.util.HashMap;
import java.util.Map;
import org.apache.avro.generic.GenericRecord;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;

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
        Map<String, Object> config = new HashMap<>();
        config.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        config.put(ProducerConfig.CLIENT_ID_CONFIG, clientId);
        config.put(ProducerConfig.ACKS_CONFIG, "all");
        config.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        config.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, KafkaAvroSerializer.class);
        config.put(AbstractKafkaSchemaSerDeConfig.SCHEMA_REGISTRY_URL_CONFIG, schemaRegistryUrl);
        return new DefaultKafkaProducerFactory<>(config);
    }

    @Bean
    @Profile("kafka")
    KafkaTemplate<String, GenericRecord> referenceEventKafkaTemplate(
            ProducerFactory<String, GenericRecord> referenceEventProducerFactory) {
        return new KafkaTemplate<>(referenceEventProducerFactory);
    }

    @Bean
    @Profile("kafka")
    ReferenceEventPublisherPort referenceEventPublisherPort(
            KafkaTemplate<String, GenericRecord> referenceEventKafkaTemplate,
            AvroSchemaRepository referenceEventSchemas,
            @Value("${reference-data.kafka.topic:referencedata.events}") String topic) {
        return new KafkaReferenceEventPublisher(referenceEventKafkaTemplate, referenceEventSchemas, topic,
                Clock.systemUTC());
    }

    @Bean
    @Profile("kafka")
    SchemaRegistryPort schemaRegistryPort(
            SchemaRegistryClient schemaRegistryClient,
            AvroSchemaRepository referenceEventSchemas) {
        return new ConfluentSchemaRegistryAdapter(schemaRegistryClient, referenceEventSchemas);
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
}

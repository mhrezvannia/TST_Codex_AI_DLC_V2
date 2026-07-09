package com.linercore.platform.referencedata.applicationservice;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.linercore.platform.referencedata.applicationservice.command.ReferenceMutationCommand;
import com.linercore.platform.referencedata.applicationservice.port.AuthorizationClientPort;
import com.linercore.platform.referencedata.applicationservice.port.EventPublicationException;
import com.linercore.platform.referencedata.applicationservice.port.IdGenerator;
import com.linercore.platform.referencedata.applicationservice.query.OutboxStatusQuery;
import com.linercore.platform.referencedata.applicationservice.query.PublishBatchResult;
import com.linercore.platform.referencedata.domain.model.ReferenceSet;
import com.linercore.platform.referencedata.domain.outbox.BrokerMetadata;
import com.linercore.platform.referencedata.domain.outbox.OutboxEvent;
import com.linercore.platform.referencedata.domain.outbox.OutboxStatus;
import com.linercore.platform.referencedata.domain.outbox.ReferenceEventEnvelope;
import com.linercore.platform.referencedata.domain.outbox.SchemaSubject;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class ReferenceEventOutboxApplicationServiceTest {
    private final TestOutboxRepository outbox = new TestOutboxRepository();
    private final ReferenceDataApplicationService service = new ReferenceDataApplicationService(
            new TestReferenceRepository(),
            new TestReferenceChangeRepository(),
            allowAll(),
            new SequentialIds(),
            Clock.fixed(Instant.parse("2026-07-01T00:00:00Z"), ZoneOffset.UTC),
            outbox,
            this::publish,
            this::register);

    @Test
    void enqueuesPendingEventWhenReferenceChanges() {
        service.create(command(ReferenceSet.CURRENCY, "USD", "US Dollar", Map.of("minorUnit", "2")));

        assertEquals(1, service.outboxStatuses(new OutboxStatusQuery(null, null, ReferenceSet.CURRENCY, OutboxStatus.PENDING, null, null, 10)).size());
        OutboxEvent event = service.claimOutboxBatch("inspector", 1).get(0);
        assertEquals("reference-data-service", event.payload().get("producerIdentity"));
        assertEquals("referencedata.currency.changed-value", event.payload().get("schemaSubject"));
        assertEquals("corr-1", event.payload().get("correlationId"));
    }

    @Test
    void claimExcludesAlreadyClaimedEvents() {
        service.create(command(ReferenceSet.CURRENCY, "USD", "US Dollar", Map.of()));

        List<OutboxEvent> firstClaim = service.claimOutboxBatch("worker-a", 10);
        List<OutboxEvent> secondClaim = service.claimOutboxBatch("worker-b", 10);

        assertEquals(1, firstClaim.size());
        assertEquals(0, secondClaim.size());
        assertEquals(OutboxStatus.IN_PROGRESS, firstClaim.get(0).status());
    }

    @Test
    void publishesClaimedEventAndProjectsStatus() {
        service.create(command(ReferenceSet.CURRENCY, "USD", "US Dollar", Map.of()));

        PublishBatchResult result = service.publishOutboxBatch("worker-a", 10);

        assertEquals(1, result.published());
        assertEquals(1, service.outboxStatuses(new OutboxStatusQuery(null, null, ReferenceSet.CURRENCY, OutboxStatus.PUBLISHED, null, null, 10)).size());
    }

    @Test
    void classifiesRetryablePublisherFailure() {
        ReferenceDataApplicationService failingService = serviceWithPublisherFailure(true);
        failingService.create(command(ReferenceSet.CURRENCY, "USD", "US Dollar", Map.of()));

        PublishBatchResult result = failingService.publishOutboxBatch("worker-a", 10);

        assertEquals(1, result.retryableFailures());
        assertEquals(1, failingService.outboxStatuses(new OutboxStatusQuery(null, null, ReferenceSet.CURRENCY, OutboxStatus.RETRYABLE, null, null, 10)).size());
    }

    @Test
    void classifiesPermanentPublisherFailure() {
        ReferenceDataApplicationService failingService = serviceWithPublisherFailure(false);
        failingService.create(command(ReferenceSet.CURRENCY, "USD", "US Dollar", Map.of()));

        PublishBatchResult result = failingService.publishOutboxBatch("worker-a", 10);

        assertEquals(1, result.permanentFailures());
        assertEquals(1, failingService.outboxStatuses(new OutboxStatusQuery(null, null, ReferenceSet.CURRENCY, OutboxStatus.FAILED_PERMANENT, null, null, 10)).size());
    }

    private ReferenceMutationCommand command(ReferenceSet set, String code, String name, Map<String, String> attributes) {
        return new ReferenceMutationCommand(set, code, name, attributes, "reference-admin", "Reference Admin",
                "create", "test", "corr-1");
    }

    private AuthorizationClientPort allowAll() {
        return (subjectId, resource, action, correlationId) -> true;
    }

    private ReferenceDataApplicationService serviceWithPublisherFailure(boolean retryable) {
        return new ReferenceDataApplicationService(
                new TestReferenceRepository(),
                new TestReferenceChangeRepository(),
                allowAll(),
                new SequentialIds(),
                Clock.fixed(Instant.parse("2026-07-01T00:00:00Z"), ZoneOffset.UTC),
                new TestOutboxRepository(),
                (envelope, payload) -> {
                    throw new EventPublicationException("PUBLISH_FAILED", "publisher failed", retryable);
                },
                this::register);
    }

    private BrokerMetadata publish(ReferenceEventEnvelope envelope, Map<String, String> payload) {
        return new BrokerMetadata("referencedata.events", 0, 1, Instant.parse("2026-07-01T00:00:01Z"));
    }

    private SchemaSubject register(String eventType, String schemaVersion) {
        return new SchemaSubject(eventType + "-value", eventType, schemaVersion, "BACKWARD");
    }

    private static class SequentialIds implements IdGenerator {
        private int next = 1;

        public String nextId() {
            return "id-" + next++;
        }
    }
}

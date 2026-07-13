package com.linercore.platform.referencedata.applicationservice;

import com.linercore.platform.referencedata.applicationservice.command.ReferenceMutationCommand;
import com.linercore.platform.referencedata.applicationservice.port.AuthorizationClientPort;
import com.linercore.platform.referencedata.applicationservice.port.EventPublicationException;
import com.linercore.platform.referencedata.applicationservice.port.IdGenerator;
import com.linercore.platform.referencedata.applicationservice.port.OutboxRepository;
import com.linercore.platform.referencedata.applicationservice.port.ReferenceChangeRepository;
import com.linercore.platform.referencedata.applicationservice.port.ReferenceEventPublisherPort;
import com.linercore.platform.referencedata.applicationservice.port.ReferenceRepository;
import com.linercore.platform.referencedata.applicationservice.port.SchemaRegistryPort;
import com.linercore.platform.referencedata.applicationservice.query.OutboxStatusQuery;
import com.linercore.platform.referencedata.applicationservice.query.PublishBatchResult;
import com.linercore.platform.referencedata.applicationservice.query.ReferencePage;
import com.linercore.platform.referencedata.domain.HealthDocument;
import com.linercore.platform.referencedata.domain.model.AuditActor;
import com.linercore.platform.referencedata.domain.model.ReferenceChange;
import com.linercore.platform.referencedata.domain.model.ReferenceCode;
import com.linercore.platform.referencedata.domain.model.ReferenceId;
import com.linercore.platform.referencedata.domain.model.ReferenceOperation;
import com.linercore.platform.referencedata.domain.model.ReferenceRecord;
import com.linercore.platform.referencedata.domain.model.ReferenceSet;
import com.linercore.platform.referencedata.domain.model.ReferenceStatus;
import com.linercore.platform.referencedata.domain.outbox.BrokerMetadata;
import com.linercore.platform.referencedata.domain.outbox.EventPublicationStatusView;
import com.linercore.platform.referencedata.domain.outbox.OutboxEvent;
import com.linercore.platform.referencedata.domain.outbox.ReferenceChangedFact;
import com.linercore.platform.referencedata.domain.outbox.ReferenceEventMapper;
import com.linercore.platform.referencedata.domain.validation.ReferenceValidator;
import com.linercore.platform.referencedata.domain.validation.ValidationResult;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.transaction.annotation.Transactional;

public class ReferenceDataApplicationService {
    private final ReferenceRepository references;
    private final ReferenceChangeRepository changes;
    private final AuthorizationClientPort authorization;
    private final IdGenerator ids;
    private final Clock clock;
    private final OutboxRepository outbox;
    private final ReferenceEventPublisherPort publisher;
    private final SchemaRegistryPort schemaRegistry;
    private final ReferenceValidator validator = new ReferenceValidator();
    private final ReferenceEventMapper eventMapper = new ReferenceEventMapper();

    public ReferenceDataApplicationService(
            ReferenceRepository references,
            ReferenceChangeRepository changes,
            AuthorizationClientPort authorization,
            IdGenerator ids,
            Clock clock) {
        this(references, changes, authorization, ids, clock, null, null, null);
    }

    public ReferenceDataApplicationService(
            ReferenceRepository references,
            ReferenceChangeRepository changes,
            AuthorizationClientPort authorization,
            IdGenerator ids,
            Clock clock,
            OutboxRepository outbox,
            ReferenceEventPublisherPort publisher,
            SchemaRegistryPort schemaRegistry) {
        this.references = references;
        this.changes = changes;
        this.authorization = authorization;
        this.ids = ids;
        this.clock = clock;
        this.outbox = outbox;
        this.publisher = publisher;
        this.schemaRegistry = schemaRegistry;
    }

    public HealthDocument health() {
        return HealthDocument.up("reference-data-service");
    }

    @Transactional
    public ReferenceRecord create(ReferenceMutationCommand command) {
        return createWithId(new ReferenceId(ids.nextId()), command);
    }

    private ReferenceRecord createWithId(ReferenceId id, ReferenceMutationCommand command) {
        requireMutationPermission(command);
        AuditActor actor = new AuditActor(command.actorSubjectId(), command.actorDisplayName());
        ReferenceRecord record = new ReferenceRecord(id, command.set(), new ReferenceCode(command.code()),
                command.displayName(), ReferenceStatus.ACTIVE, 1, actor, now(), actor, now(), null, null,
                command.reason(), command.attributes());
        validateOrThrow(record);
        references.rejectDuplicateActiveCode(record.set(), record.code());
        ReferenceRecord saved = references.save(record);
        appendChange(saved, ReferenceOperation.CREATED, null, command).ifPresent(change -> enqueueOutbox(saved, ReferenceOperation.CREATED, change, command));
        return saved;
    }

    @Transactional
    public ReferenceRecord update(ReferenceId id, long expectedVersion, ReferenceMutationCommand command) {
        requireMutationPermission(command);
        Optional<ReferenceRecord> existingRecord = references.findById(command.set(), id);
        if (existingRecord.isEmpty() && expectedVersion == 0) {
            return createWithId(id, command);
        }
        ReferenceRecord existing = existingRecord.orElseThrow();
        if (existing.version() != expectedVersion) {
            throw new IllegalStateException("stale reference version");
        }
        ReferenceRecord updated = existing.withUpdate(command.displayName(), command.attributes(),
                new AuditActor(command.actorSubjectId(), command.actorDisplayName()), now(), command.reason());
        validateOrThrow(updated);
        ReferenceRecord saved = references.save(updated);
        appendChange(saved, ReferenceOperation.UPDATED, existing, command).ifPresent(change -> enqueueOutbox(saved, ReferenceOperation.UPDATED, change, command));
        return saved;
    }

    @Transactional
    public ReferenceRecord deactivate(ReferenceSet set, ReferenceId id, String reason, String actorSubjectId, String correlationId) {
        ReferenceMutationCommand command = ReferenceMutationCommand.statusCommand(set, actorSubjectId, reason, correlationId);
        requireMutationPermission(command);
        ReferenceRecord existing = references.findById(set, id).orElseThrow();
        ReferenceRecord saved = references.save(existing.withStatus(ReferenceStatus.INACTIVE,
                new AuditActor(actorSubjectId, actorSubjectId), now(), reason));
        appendChange(saved, ReferenceOperation.DEACTIVATED, existing, command).ifPresent(change -> enqueueOutbox(saved, ReferenceOperation.DEACTIVATED, change, command));
        return saved;
    }

    public ValidationResult validateOnly(ReferenceMutationCommand command) {
        AuditActor actor = new AuditActor(command.actorSubjectId(), command.actorDisplayName());
        ReferenceRecord candidate = new ReferenceRecord(new ReferenceId("validation-only"), command.set(), new ReferenceCode(command.code()),
                command.displayName(), ReferenceStatus.ACTIVE, 1, actor, now(), actor, now(), null, null,
                command.reason(), command.attributes());
        return validator.validate(candidate, references.activeRecordsById(ReferenceSet.REGION));
    }

    public ReferencePage list(ReferenceSet set, boolean includeInactive, int page, int size) {
        int boundedSize = Math.max(1, Math.min(size, 100));
        List<ReferenceRecord> sorted = references.findBySet(set, includeInactive).stream()
                .sorted(Comparator.comparing(record -> record.displayName().toLowerCase()))
                .toList();
        int from = Math.min(page * boundedSize, sorted.size());
        int to = Math.min(from + boundedSize, sorted.size());
        return new ReferencePage(sorted.subList(from, to), page, boundedSize, sorted.size());
    }

    public ReferenceRecord detail(ReferenceSet set, ReferenceId id) {
        return references.findById(set, id).orElseThrow();
    }

    public List<ReferenceChange> history(ReferenceSet set, ReferenceId id) {
        return changes.findByRecord(set, id);
    }

    public List<OutboxEvent> claimOutboxBatch(String workerId, int batchSize) {
        requireOutbox();
        if (workerId == null || workerId.isBlank()) {
            throw new IllegalArgumentException("worker id is required");
        }
        return outbox.claimAvailable(workerId, now(), Math.max(1, Math.min(batchSize, 100)));
    }

    @Transactional
    public PublishBatchResult publishOutboxBatch(String workerId, int batchSize) {
        requireOutbox();
        requirePublisher();
        List<OutboxEvent> claimed = claimOutboxBatch(workerId, batchSize);
        int published = 0;
        int retryable = 0;
        int permanent = 0;
        for (OutboxEvent event : claimed) {
            try {
                schemaRegistry.ensureRegistered(event.eventType(), event.schemaVersion());
                BrokerMetadata metadata = publisher.publish(eventMapper.envelope(event), event.payload());
                outbox.save(event.published(metadata, now()));
                published++;
            } catch (EventPublicationException ex) {
                outbox.save(ex.retryable()
                        ? event.retryable(ex.code(), ex.getMessage(), now().plus(Duration.ofMinutes(5)))
                        : event.failedPermanent(ex.code(), ex.getMessage()));
                if (ex.retryable()) {
                    retryable++;
                } else {
                    permanent++;
                }
            } catch (RuntimeException ex) {
                outbox.save(event.retryable("PUBLISHER_UNAVAILABLE", ex.getMessage(), now().plus(Duration.ofMinutes(5))));
                retryable++;
            }
        }
        return new PublishBatchResult(claimed.size(), published, retryable, permanent);
    }

    public List<EventPublicationStatusView> outboxStatuses(OutboxStatusQuery query) {
        requireOutbox();
        return outbox.findStatuses(query);
    }

    private void requireMutationPermission(ReferenceMutationCommand command) {
        if (!authorization.allowed(command.actorSubjectId(), "reference-data", command.operation(), command.correlationId())) {
            throw new SecurityException("reference mutation denied");
        }
    }

    private void validateOrThrow(ReferenceRecord record) {
        ValidationResult result = validator.validate(record, references.activeRecordsById(ReferenceSet.REGION));
        if (!result.valid()) {
            throw new IllegalArgumentException(String.join(",", result.errors()));
        }
    }

    private Optional<ReferenceChange> appendChange(ReferenceRecord after, ReferenceOperation operation, ReferenceRecord before, ReferenceMutationCommand command) {
        ReferenceChange change = new ReferenceChange(ids.nextId(), after.set(), after.id(), operation,
                before == null ? null : before.toString(), after.toString(),
                new AuditActor(command.actorSubjectId(), command.actorDisplayName()), now(), command.reason(), command.correlationId());
        changes.append(change);
        return Optional.of(change);
    }

    private Instant now() {
        return Instant.now(clock);
    }

    private void enqueueOutbox(ReferenceRecord record, ReferenceOperation operation, ReferenceChange change, ReferenceMutationCommand command) {
        if (outbox == null) {
            return;
        }
        Map<String, String> payload = Map.of(
                "id", record.id().value(),
                "code", record.code().value(),
                "displayName", record.displayName(),
                "status", record.status().name(),
                "version", String.valueOf(record.version()));
        ReferenceChangedFact fact = new ReferenceChangedFact(change.changeId(), record.set(), record.id().value(),
                record.code().value(), operation, command.attributes(), payload, change.changedAt(), command.correlationId());
        outbox.enqueue(eventMapper.toOutboxEvent(ids.nextId(), fact));
    }

    private void requireOutbox() {
        if (outbox == null) {
            throw new IllegalStateException("outbox repository is not configured");
        }
    }

    private void requirePublisher() {
        if (publisher == null || schemaRegistry == null) {
            throw new IllegalStateException("event publisher is not configured");
        }
    }
}

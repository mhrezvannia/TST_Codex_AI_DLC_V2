package com.linercore.platform.referencedata.applicationservice;

import com.linercore.platform.referencedata.applicationservice.port.ReferenceChangeRepository;
import com.linercore.platform.referencedata.applicationservice.port.OutboxRepository;
import com.linercore.platform.referencedata.applicationservice.port.ReferenceRepository;
import com.linercore.platform.referencedata.applicationservice.query.OutboxStatusQuery;
import com.linercore.platform.referencedata.domain.model.ReferenceChange;
import com.linercore.platform.referencedata.domain.model.ReferenceCode;
import com.linercore.platform.referencedata.domain.model.ReferenceId;
import com.linercore.platform.referencedata.domain.model.ReferenceRecord;
import com.linercore.platform.referencedata.domain.model.ReferenceSet;
import com.linercore.platform.referencedata.domain.model.ReferenceStatus;
import com.linercore.platform.referencedata.domain.outbox.EventPublicationStatusView;
import com.linercore.platform.referencedata.domain.outbox.OutboxEvent;
import com.linercore.platform.referencedata.domain.outbox.OutboxStatus;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;

class TestReferenceRepository implements ReferenceRepository {
    private final Map<String, ReferenceRecord> records = new LinkedHashMap<>();

    public ReferenceRecord save(ReferenceRecord record) {
        records.put(key(record.set(), record.id()), record);
        return record;
    }

    public Optional<ReferenceRecord> findById(ReferenceSet set, ReferenceId id) {
        return Optional.ofNullable(records.get(key(set, id)));
    }

    public List<ReferenceRecord> findBySet(ReferenceSet set, boolean includeInactive) {
        return records.values().stream()
                .filter(record -> record.set() == set)
                .filter(record -> includeInactive || record.status() == ReferenceStatus.ACTIVE)
                .toList();
    }

    public Map<String, ReferenceRecord> activeRecordsById(ReferenceSet set) {
        return records.values().stream()
                .filter(record -> record.set() == set)
                .filter(record -> record.status() == ReferenceStatus.ACTIVE)
                .collect(java.util.stream.Collectors.toMap(record -> record.id().value(), record -> record));
    }

    public void rejectDuplicateActiveCode(ReferenceSet set, ReferenceCode code) {
        boolean duplicate = records.values().stream()
                .filter(record -> record.set() == set)
                .filter(record -> record.status() == ReferenceStatus.ACTIVE)
                .anyMatch(record -> record.code().equals(code));
        if (duplicate) {
            throw new IllegalArgumentException("duplicate active reference code");
        }
    }

    private String key(ReferenceSet set, ReferenceId id) {
        return set.name() + ":" + id.value();
    }
}

class TestReferenceChangeRepository implements ReferenceChangeRepository {
    private final CopyOnWriteArrayList<ReferenceChange> changes = new CopyOnWriteArrayList<>();

    public void append(ReferenceChange change) {
        changes.add(change);
    }

    public List<ReferenceChange> findByRecord(ReferenceSet set, ReferenceId id) {
        return changes.stream()
                .filter(change -> change.referenceSet() == set)
                .filter(change -> change.recordId().equals(id))
                .toList();
    }
}

class TestOutboxRepository implements OutboxRepository {
    private final Map<String, OutboxEvent> events = new LinkedHashMap<>();

    public synchronized void enqueue(OutboxEvent event) {
        events.putIfAbsent(event.eventId(), event);
    }

    public synchronized List<OutboxEvent> claimAvailable(String workerId, Instant now, int batchSize) {
        java.util.ArrayList<OutboxEvent> claimed = new java.util.ArrayList<>();
        for (OutboxEvent event : events.values()) {
            if (claimed.size() >= batchSize) {
                break;
            }
            if (event.status() == OutboxStatus.PENDING
                    || (event.status() == OutboxStatus.RETRYABLE && (event.nextAttemptAt() == null || !event.nextAttemptAt().isAfter(now)))) {
                OutboxEvent next = event.claim(workerId, now);
                events.put(next.eventId(), next);
                claimed.add(next);
            }
        }
        return List.copyOf(claimed);
    }

    public synchronized void save(OutboxEvent event) {
        events.put(event.eventId(), event);
    }

    public synchronized Optional<OutboxEvent> findByEventId(String eventId) {
        return Optional.ofNullable(events.get(eventId));
    }

    public synchronized List<EventPublicationStatusView> findStatuses(OutboxStatusQuery query) {
        return events.values().stream()
                .filter(event -> query.referenceSet() == null || event.referenceSet() == query.referenceSet())
                .filter(event -> query.status() == null || event.status() == query.status())
                .map(event -> new EventPublicationStatusView(event.eventId(), event.entityId(), event.referenceSet(), event.operation().name(),
                        event.status(), event.attemptCount(), event.claimedAt(), null, null, event.lastErrorCode(), event.correlationId()))
                .toList();
    }
}

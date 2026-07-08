package com.linercore.platform.referencedata.dataaccess.inmemory;

import com.linercore.platform.referencedata.applicationservice.port.ReferenceRepository;
import com.linercore.platform.referencedata.domain.model.ReferenceCode;
import com.linercore.platform.referencedata.domain.model.ReferenceId;
import com.linercore.platform.referencedata.domain.model.ReferenceRecord;
import com.linercore.platform.referencedata.domain.model.ReferenceSet;
import com.linercore.platform.referencedata.domain.model.ReferenceStatus;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

public class InMemoryReferenceRepository implements ReferenceRepository {
    private final Map<String, ReferenceRecord> records = new ConcurrentHashMap<>();

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
                .collect(Collectors.toMap(record -> record.id().value(), record -> record));
    }

    public void rejectDuplicateActiveCode(ReferenceSet set, ReferenceCode code) {
        boolean exists = records.values().stream()
                .filter(record -> record.set() == set)
                .filter(record -> record.status() == ReferenceStatus.ACTIVE)
                .anyMatch(record -> record.code().equals(code));
        if (exists) {
            throw new IllegalArgumentException("duplicate active business key");
        }
    }

    private String key(ReferenceSet set, ReferenceId id) {
        return set.name() + ":" + id.value();
    }
}

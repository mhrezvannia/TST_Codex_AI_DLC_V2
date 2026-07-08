package com.linercore.platform.referencedata.dataaccess.inmemory;

import com.linercore.platform.referencedata.applicationservice.port.ReferenceChangeRepository;
import com.linercore.platform.referencedata.domain.model.ReferenceChange;
import com.linercore.platform.referencedata.domain.model.ReferenceId;
import com.linercore.platform.referencedata.domain.model.ReferenceSet;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public class InMemoryReferenceChangeRepository implements ReferenceChangeRepository {
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

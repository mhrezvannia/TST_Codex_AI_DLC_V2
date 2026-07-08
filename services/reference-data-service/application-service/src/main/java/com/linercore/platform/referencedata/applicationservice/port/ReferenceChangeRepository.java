package com.linercore.platform.referencedata.applicationservice.port;

import com.linercore.platform.referencedata.domain.model.ReferenceChange;
import com.linercore.platform.referencedata.domain.model.ReferenceId;
import com.linercore.platform.referencedata.domain.model.ReferenceSet;
import java.util.List;

public interface ReferenceChangeRepository {
    void append(ReferenceChange change);

    List<ReferenceChange> findByRecord(ReferenceSet set, ReferenceId id);
}

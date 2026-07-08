package com.linercore.platform.referencedata.applicationservice.port;

import com.linercore.platform.referencedata.domain.model.ReferenceCode;
import com.linercore.platform.referencedata.domain.model.ReferenceId;
import com.linercore.platform.referencedata.domain.model.ReferenceRecord;
import com.linercore.platform.referencedata.domain.model.ReferenceSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface ReferenceRepository {
    ReferenceRecord save(ReferenceRecord record);

    Optional<ReferenceRecord> findById(ReferenceSet set, ReferenceId id);

    List<ReferenceRecord> findBySet(ReferenceSet set, boolean includeInactive);

    Map<String, ReferenceRecord> activeRecordsById(ReferenceSet set);

    void rejectDuplicateActiveCode(ReferenceSet set, ReferenceCode code);
}

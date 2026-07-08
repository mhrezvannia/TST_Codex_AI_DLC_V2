package com.linercore.platform.referencedata.applicationservice.query;

import com.linercore.platform.referencedata.domain.model.ReferenceRecord;
import java.util.List;

public record ReferencePage(List<ReferenceRecord> records, int page, int size, int total) {
}

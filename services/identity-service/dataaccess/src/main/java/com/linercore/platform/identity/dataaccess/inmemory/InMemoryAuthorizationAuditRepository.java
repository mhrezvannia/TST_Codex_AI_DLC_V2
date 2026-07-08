package com.linercore.platform.identity.dataaccess.inmemory;

import com.linercore.platform.identity.applicationservice.port.AuthorizationAuditRepository;
import com.linercore.platform.identity.domain.model.AuthorizationAuditRecord;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public class InMemoryAuthorizationAuditRepository implements AuthorizationAuditRepository {
    private final CopyOnWriteArrayList<AuthorizationAuditRecord> records = new CopyOnWriteArrayList<>();

    public void append(AuthorizationAuditRecord record) {
        records.add(record);
    }

    public List<AuthorizationAuditRecord> all() {
        return new ArrayList<>(records);
    }
}

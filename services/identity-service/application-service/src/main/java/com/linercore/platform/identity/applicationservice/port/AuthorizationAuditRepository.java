package com.linercore.platform.identity.applicationservice.port;

import com.linercore.platform.identity.domain.model.AuthorizationAuditRecord;

public interface AuthorizationAuditRepository {
    void append(AuthorizationAuditRecord record);
}

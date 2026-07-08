package com.linercore.platform.referencedata.application.identity;

import com.linercore.platform.referencedata.applicationservice.port.AuthorizationClientPort;

public class IdentityAuthorizationClient implements AuthorizationClientPort {
    public boolean allowed(String subjectId, String resource, String action, String correlationId) {
        return subjectId != null && !subjectId.isBlank() && !subjectId.startsWith("denied");
    }
}

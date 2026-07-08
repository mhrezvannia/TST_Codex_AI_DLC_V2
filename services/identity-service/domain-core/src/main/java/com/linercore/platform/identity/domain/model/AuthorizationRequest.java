package com.linercore.platform.identity.domain.model;

import java.util.Map;

public record AuthorizationRequest(
        String requestId,
        String correlationId,
        String subjectTokenReference,
        String resource,
        String action,
        String scope,
        Map<String, String> context) {
}

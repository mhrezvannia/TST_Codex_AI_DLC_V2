package com.linercore.platform.identity.domain.model;

import java.time.Instant;
import java.util.UUID;

public record AuthorizationDecision(
        String decisionId,
        String subjectId,
        DecisionResult result,
        ReasonCode reasonCode,
        String resource,
        String action,
        String scope,
        Instant evaluatedAt,
        String policyVersion,
        String correlationId) {
    public static AuthorizationDecision allow(AuthenticatedSubject subject, AuthorizationRequest request, String policyVersion, Instant now) {
        return new AuthorizationDecision(UUID.randomUUID().toString(), subject.subjectId(), DecisionResult.ALLOW, ReasonCode.ALLOW,
                request.resource(), request.action(), request.scope(), now, policyVersion, request.correlationId());
    }

    public static AuthorizationDecision deny(String subjectId, AuthorizationRequest request, ReasonCode reasonCode, String policyVersion, Instant now) {
        return new AuthorizationDecision(UUID.randomUUID().toString(), subjectId, DecisionResult.DENY, reasonCode,
                request == null ? null : request.resource(),
                request == null ? null : request.action(),
                request == null ? null : request.scope(),
                now,
                policyVersion,
                request == null ? null : request.correlationId());
    }
}

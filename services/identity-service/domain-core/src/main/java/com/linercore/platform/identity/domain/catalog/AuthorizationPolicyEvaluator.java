package com.linercore.platform.identity.domain.catalog;

import com.linercore.platform.identity.domain.model.AuthenticatedSubject;
import com.linercore.platform.identity.domain.model.AuthorizationDecision;
import com.linercore.platform.identity.domain.model.AuthorizationRequest;
import com.linercore.platform.identity.domain.model.Permission;
import com.linercore.platform.identity.domain.model.ReasonCode;
import com.linercore.platform.identity.domain.model.RoleAssignment;
import java.time.Clock;
import java.time.Instant;
import java.util.List;

public class AuthorizationPolicyEvaluator {
    private final MvpAuthorizationCatalog catalog;
    private final Clock clock;

    public AuthorizationPolicyEvaluator(MvpAuthorizationCatalog catalog, Clock clock) {
        this.catalog = catalog;
        this.clock = clock;
    }

    public AuthorizationDecision evaluate(
            AuthenticatedSubject subject,
            List<RoleAssignment> assignments,
            AuthorizationRequest request) {
        if (subject == null) {
            return AuthorizationDecision.deny(null, request, ReasonCode.DENY_UNKNOWN_SUBJECT, MvpAuthorizationCatalog.POLICY_VERSION, now());
        }
        if (request == null || request.resource() == null || request.resource().isBlank()
                || request.action() == null || request.action().isBlank()) {
            return AuthorizationDecision.deny(subject.subjectId(), request, ReasonCode.DENY_INVALID_TOKEN, MvpAuthorizationCatalog.POLICY_VERSION, now());
        }

        List<RoleAssignment> safeAssignments = assignments == null ? List.of() : assignments;
        boolean allowed = safeAssignments.stream()
                .filter(RoleAssignment::active)
                .filter(assignment -> subject.subjectId().equals(assignment.subjectId()))
                .flatMap(assignment -> catalog.grantsForRole(assignment.roleId()).stream())
                .filter(grant -> grant.activeAt(now()))
                .map(grant -> catalog.permissionById(grant.permissionId()))
                .flatMap(optional -> optional.stream())
                .anyMatch(permission -> matches(permission, request));

        if (allowed) {
            return AuthorizationDecision.allow(subject, request, MvpAuthorizationCatalog.POLICY_VERSION, now());
        }
        return AuthorizationDecision.deny(subject.subjectId(), request, ReasonCode.DENY_NO_PERMISSION, MvpAuthorizationCatalog.POLICY_VERSION, now());
    }

    private boolean matches(Permission permission, AuthorizationRequest request) {
        return permission.matches(request.resource(), request.action(), request.scope());
    }

    private Instant now() {
        return Instant.now(clock);
    }
}

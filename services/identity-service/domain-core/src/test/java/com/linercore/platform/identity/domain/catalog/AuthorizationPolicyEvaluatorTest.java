package com.linercore.platform.identity.domain.catalog;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.linercore.platform.identity.domain.model.AssignmentStatus;
import com.linercore.platform.identity.domain.model.AuthenticatedSubject;
import com.linercore.platform.identity.domain.model.AuthorizationRequest;
import com.linercore.platform.identity.domain.model.DecisionResult;
import com.linercore.platform.identity.domain.model.ReasonCode;
import com.linercore.platform.identity.domain.model.RoleAssignment;
import com.linercore.platform.identity.domain.model.RoleCode;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class AuthorizationPolicyEvaluatorTest {
    private final MvpAuthorizationCatalog catalog = new MvpAuthorizationCatalog();
    private final AuthorizationPolicyEvaluator evaluator = new AuthorizationPolicyEvaluator(
            catalog,
            Clock.fixed(Instant.parse("2026-07-01T00:00:00Z"), ZoneOffset.UTC));

    @Test
    void referenceAdminCanCreateReferenceData() {
        AuthenticatedSubject subject = subject("alice");
        RoleAssignment assignment = assignment("alice", RoleCode.REFERENCE_ADMIN);

        assertEquals(DecisionResult.ALLOW, evaluator.evaluate(subject, List.of(assignment), request("create")).result());
    }

    @Test
    void defaultUserWithoutAssignmentIsDenied() {
        AuthenticatedSubject subject = subject("bob");

        assertEquals(ReasonCode.DENY_NO_PERMISSION, evaluator.evaluate(subject, List.of(), request("create")).reasonCode());
    }

    @Test
    void revokedAssignmentDoesNotGrantPermission() {
        AuthenticatedSubject subject = subject("alice");
        RoleAssignment assignment = new RoleAssignment("assign-1", "alice", roleId(RoleCode.REFERENCE_ADMIN),
                AssignmentStatus.REVOKED, "sec", Instant.EPOCH, "sec", Instant.EPOCH, "test", 2);

        assertEquals(DecisionResult.DENY, evaluator.evaluate(subject, List.of(assignment), request("create")).result());
    }

    private AuthenticatedSubject subject(String id) {
        return new AuthenticatedSubject(id, id, id, id + "@example.test", "keycloak", "carrier", "v1");
    }

    private RoleAssignment assignment(String subjectId, RoleCode roleCode) {
        return new RoleAssignment("assign-" + subjectId, subjectId, roleId(roleCode), AssignmentStatus.ACTIVE,
                "security-admin", Instant.EPOCH, null, null, "test", 1);
    }

    private String roleId(RoleCode roleCode) {
        return catalog.roleByCode(roleCode).orElseThrow().roleId();
    }

    private AuthorizationRequest request(String action) {
        return new AuthorizationRequest("req-1", "corr-1", "token-ref", "reference-data", action, null, Map.of());
    }
}

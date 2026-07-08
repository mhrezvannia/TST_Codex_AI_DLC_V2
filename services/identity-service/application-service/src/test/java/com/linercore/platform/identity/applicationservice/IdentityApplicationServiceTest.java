package com.linercore.platform.identity.applicationservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import com.linercore.platform.identity.applicationservice.command.AssignRoleCommand;
import com.linercore.platform.identity.applicationservice.port.AuthorizationAuditRepository;
import com.linercore.platform.identity.applicationservice.port.IdGenerator;
import com.linercore.platform.identity.applicationservice.port.RoleAssignmentRepository;
import com.linercore.platform.identity.applicationservice.port.SubjectResolverPort;
import com.linercore.platform.identity.domain.catalog.MvpAuthorizationCatalog;
import com.linercore.platform.identity.domain.model.AssignmentStatus;
import com.linercore.platform.identity.domain.model.AuthenticatedSubject;
import com.linercore.platform.identity.domain.model.AuthorizationAuditRecord;
import com.linercore.platform.identity.domain.model.AuthorizationDecision;
import com.linercore.platform.identity.domain.model.AuthorizationRequest;
import com.linercore.platform.identity.domain.model.DecisionResult;
import com.linercore.platform.identity.domain.model.ReasonCode;
import com.linercore.platform.identity.domain.model.RoleAssignment;
import com.linercore.platform.identity.domain.model.RoleCode;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class IdentityApplicationServiceTest {
    private final FakeSubjects subjects = new FakeSubjects();
    private final FakeAssignments assignments = new FakeAssignments();
    private final FakeAudit audit = new FakeAudit();
    private final IdentityApplicationService service = new IdentityApplicationService(
            subjects,
            assignments,
            audit,
            new SequentialIds(),
            Clock.fixed(Instant.parse("2026-07-01T00:00:00Z"), ZoneOffset.UTC));

    @Test
    void deniesUnknownSubjectFailClosed() {
        AuthorizationDecision decision = service.authorize(request("invalid-user", "reference-data", "read"));

        assertEquals(DecisionResult.DENY, decision.result());
        assertEquals(ReasonCode.DENY_UNKNOWN_SUBJECT, decision.reasonCode());
        assertFalse(audit.records.isEmpty());
    }

    @Test
    void deniesDefaultUserWithoutAdministrativeAssignment() {
        subjects.add("user");

        AuthorizationDecision decision = service.authorize(request("user", "reference-data", "create"));

        assertEquals(ReasonCode.DENY_NO_PERMISSION, decision.reasonCode());
    }

    @Test
    void allowsReferenceAdminToCreateReferenceData() {
        subjects.add("admin");
        assignments.save(active("admin", RoleCode.REFERENCE_ADMIN));

        AuthorizationDecision decision = service.authorize(request("admin", "reference-data", "create"));

        assertEquals(DecisionResult.ALLOW, decision.result());
    }

    @Test
    void securityAdminCanAssignRoleAndAuditIt() {
        subjects.add("security");
        assignments.save(active("security", RoleCode.SECURITY_ADMIN));

        AuthorizationDecision decision = service.assignRole(new AssignRoleCommand("security", "target",
                "reference-admin", "approved access", 0, "corr-1"));

        assertEquals(DecisionResult.ALLOW, decision.result());
        assertEquals(1, assignments.findActiveBySubjectId("target").size());
        assertEquals("ROLE_ASSIGNED", audit.records.getLast().eventType());
    }

    private AuthorizationRequest request(String token, String resource, String action) {
        return new AuthorizationRequest("req-1", "corr-1", token, resource, action, null, Map.of());
    }

    private RoleAssignment active(String subject, RoleCode roleCode) {
        MvpAuthorizationCatalog catalog = new MvpAuthorizationCatalog();
        String roleId = catalog.roleByCode(roleCode).orElseThrow().roleId();
        return new RoleAssignment("assign-" + subject, subject, roleId, AssignmentStatus.ACTIVE,
                "security", Instant.EPOCH, null, null, "test", 1);
    }

    private static class FakeSubjects implements SubjectResolverPort {
        private final List<String> known = new ArrayList<>();

        void add(String subjectId) {
            known.add(subjectId);
        }

        public Optional<AuthenticatedSubject> resolve(String tokenReference) {
            return known.contains(tokenReference)
                    ? Optional.of(new AuthenticatedSubject(tokenReference, tokenReference, tokenReference,
                    tokenReference + "@example.test", "keycloak", "carrier", "v1"))
                    : Optional.empty();
        }
    }

    private static class FakeAssignments implements RoleAssignmentRepository {
        private final List<RoleAssignment> records = new ArrayList<>();

        public List<RoleAssignment> findActiveBySubjectId(String subjectId) {
            return records.stream()
                    .filter(RoleAssignment::active)
                    .filter(record -> record.subjectId().equals(subjectId))
                    .toList();
        }

        public Optional<RoleAssignment> findBySubjectAndRole(String subjectId, String roleId) {
            return records.stream()
                    .filter(record -> record.subjectId().equals(subjectId))
                    .filter(record -> record.roleId().equals(roleId))
                    .findFirst();
        }

        public RoleAssignment save(RoleAssignment assignment) {
            findBySubjectAndRole(assignment.subjectId(), assignment.roleId()).ifPresent(records::remove);
            records.add(assignment);
            return assignment;
        }
    }

    private static class FakeAudit implements AuthorizationAuditRepository {
        private final List<AuthorizationAuditRecord> records = new ArrayList<>();

        public void append(AuthorizationAuditRecord record) {
            records.add(record);
        }
    }

    private static class SequentialIds implements IdGenerator {
        private int next = 1;

        public String nextId() {
            return "id-" + next++;
        }
    }
}

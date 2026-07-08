package com.linercore.platform.identity.applicationservice;

import com.linercore.platform.identity.applicationservice.command.AssignRoleCommand;
import com.linercore.platform.identity.applicationservice.port.AuthorizationAuditRepository;
import com.linercore.platform.identity.applicationservice.port.IdGenerator;
import com.linercore.platform.identity.applicationservice.port.RoleAssignmentRepository;
import com.linercore.platform.identity.applicationservice.port.SubjectResolverPort;
import com.linercore.platform.identity.domain.HealthDocument;
import com.linercore.platform.identity.domain.catalog.AuthorizationPolicyEvaluator;
import com.linercore.platform.identity.domain.catalog.MvpAuthorizationCatalog;
import com.linercore.platform.identity.domain.model.AssignmentStatus;
import com.linercore.platform.identity.domain.model.AuthenticatedSubject;
import com.linercore.platform.identity.domain.model.AuthorizationAuditRecord;
import com.linercore.platform.identity.domain.model.AuthorizationDecision;
import com.linercore.platform.identity.domain.model.AuthorizationRequest;
import com.linercore.platform.identity.domain.model.DecisionResult;
import com.linercore.platform.identity.domain.model.EffectivePermissionsView;
import com.linercore.platform.identity.domain.model.Permission;
import com.linercore.platform.identity.domain.model.ReasonCode;
import com.linercore.platform.identity.domain.model.Role;
import com.linercore.platform.identity.domain.model.RoleAssignment;
import com.linercore.platform.identity.domain.model.RoleCode;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

public class IdentityApplicationService {
    private final SubjectResolverPort subjectResolver;
    private final RoleAssignmentRepository assignments;
    private final AuthorizationAuditRepository audit;
    private final IdGenerator ids;
    private final MvpAuthorizationCatalog catalog;
    private final AuthorizationPolicyEvaluator evaluator;
    private final Clock clock;

    public IdentityApplicationService(
            SubjectResolverPort subjectResolver,
            RoleAssignmentRepository assignments,
            AuthorizationAuditRepository audit,
            IdGenerator ids,
            Clock clock) {
        this.subjectResolver = subjectResolver;
        this.assignments = assignments;
        this.audit = audit;
        this.ids = ids;
        this.clock = clock;
        this.catalog = new MvpAuthorizationCatalog();
        this.evaluator = new AuthorizationPolicyEvaluator(catalog, clock);
    }

    public HealthDocument health() {
        return HealthDocument.up("identity-service");
    }

    public AuthorizationDecision authorize(AuthorizationRequest request) {
        Optional<AuthenticatedSubject> subject = subjectResolver.resolve(request.subjectTokenReference());
        if (subject.isEmpty()) {
            AuthorizationDecision decision = AuthorizationDecision.deny(null, request, ReasonCode.DENY_UNKNOWN_SUBJECT,
                    MvpAuthorizationCatalog.POLICY_VERSION, Instant.now(clock));
            appendDecisionAudit(decision);
            return decision;
        }

        List<RoleAssignment> activeAssignments = assignments.findActiveBySubjectId(subject.get().subjectId());
        AuthorizationDecision decision = evaluator.evaluate(subject.get(), activeAssignments, request);
        if (decision.result() == DecisionResult.DENY) {
            appendDecisionAudit(decision);
        }
        return decision;
    }

    public EffectivePermissionsView effectivePermissions(String tokenReference) {
        AuthenticatedSubject subject = subjectResolver.resolve(tokenReference)
                .orElseThrow(() -> new IllegalArgumentException("unknown subject"));
        List<RoleAssignment> activeAssignments = assignments.findActiveBySubjectId(subject.subjectId());
        List<Role> roles = activeAssignments.stream()
                .flatMap(assignment -> catalog.roleById(assignment.roleId()).stream())
                .toList();
        List<Permission> permissions = roles.stream()
                .flatMap(role -> catalog.grantsForRole(role.roleId()).stream())
                .flatMap(grant -> catalog.permissionById(grant.permissionId()).stream())
                .distinct()
                .toList();
        return new EffectivePermissionsView(subject, roles, permissions, MvpAuthorizationCatalog.POLICY_VERSION, Instant.now(clock));
    }

    public AuthorizationDecision assignRole(AssignRoleCommand command) {
        AuthenticatedSubject actor = subjectResolver.resolve(command.actorTokenReference())
                .orElse(null);
        AuthorizationRequest authz = new AuthorizationRequest(ids.nextId(), command.correlationId(), command.actorTokenReference(),
                "identity-roles", "assign", null, java.util.Map.of("operation", "assign-role"));
        AuthorizationDecision actorDecision = authorize(authz);
        if (actorDecision.result() == DecisionResult.DENY) {
            return actorDecision;
        }

        Role role = catalog.roleByCode(parseRoleCode(command.roleCode()))
                .orElseThrow(() -> new IllegalArgumentException("unknown role"));
        RoleAssignment existing = assignments.findBySubjectAndRole(command.targetSubjectId(), role.roleId()).orElse(null);
        if (existing != null && existing.version() != command.expectedVersion()) {
            return AuthorizationDecision.deny(actor == null ? null : actor.subjectId(), authz, ReasonCode.DENY_STALE_ASSIGNMENT,
                    MvpAuthorizationCatalog.POLICY_VERSION, Instant.now(clock));
        }

        RoleAssignment saved = assignments.save(new RoleAssignment(
                existing == null ? ids.nextId() : existing.assignmentId(),
                command.targetSubjectId(),
                role.roleId(),
                AssignmentStatus.ACTIVE,
                actor == null ? null : actor.subjectId(),
                Instant.now(clock),
                null,
                null,
                command.reason(),
                existing == null ? 1 : existing.version() + 1));
        audit.append(new AuthorizationAuditRecord(ids.nextId(), "ROLE_ASSIGNED", actor == null ? null : actor.subjectId(),
                command.targetSubjectId(), "identity-roles", "assign", existing == null ? null : existing.toString(),
                saved.toString(), command.reason(), "SUCCESS", Instant.now(clock), command.correlationId()));
        return AuthorizationDecision.allow(actor, authz, MvpAuthorizationCatalog.POLICY_VERSION, Instant.now(clock));
    }

    public List<Role> roleCatalog() {
        return catalog.roles();
    }

    private RoleCode parseRoleCode(String roleCode) {
        String normalized = roleCode.toUpperCase(Locale.ROOT).replace('-', '_');
        return RoleCode.valueOf(normalized);
    }

    private void appendDecisionAudit(AuthorizationDecision decision) {
        audit.append(new AuthorizationAuditRecord(ids.nextId(), "AUTHORIZATION_DECISION", decision.subjectId(), decision.subjectId(),
                decision.resource(), decision.action(), null, null, decision.reasonCode().name(), decision.result().name(),
                decision.evaluatedAt(), decision.correlationId()));
    }
}

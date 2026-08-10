package com.linercore.platform.identity.domain.catalog;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

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
    void bookingDeskCanRunMountedBookingLifecycle() {
        AuthenticatedSubject subject = subject("local.booking.user");
        RoleAssignment assignment = assignment("local.booking.user", RoleCode.BOOKING_DESK);

        assertEquals(DecisionResult.ALLOW,
                evaluator.evaluate(subject, List.of(assignment), request("booking", "read")).result());
        assertEquals(DecisionResult.ALLOW,
                evaluator.evaluate(subject, List.of(assignment), request("booking", "create")).result());
        assertEquals(DecisionResult.ALLOW,
                evaluator.evaluate(subject, List.of(assignment), request("booking", "validate")).result());
        assertEquals(DecisionResult.ALLOW,
                evaluator.evaluate(subject, List.of(assignment), request("booking", "request-pricing")).result());
        assertEquals(DecisionResult.ALLOW,
                evaluator.evaluate(subject, List.of(assignment), request("booking", "confirm")).result());
        assertEquals(DecisionResult.ALLOW,
                evaluator.evaluate(subject, List.of(assignment), request("booking", "amend")).result());
        assertEquals(DecisionResult.ALLOW,
                evaluator.evaluate(subject, List.of(assignment), request("booking", "reconfirm")).result());
    }

    @Test
    void referenceAdminDoesNotGainBookingPermissions() {
        AuthenticatedSubject subject = subject("local.reference.admin");
        RoleAssignment assignment = assignment("local.reference.admin", RoleCode.REFERENCE_ADMIN);

        assertEquals(DecisionResult.DENY,
                evaluator.evaluate(subject, List.of(assignment), request("booking", "create")).result());
        assertEquals(DecisionResult.DENY,
                evaluator.evaluate(subject, List.of(assignment), request("booking", "confirm")).result());
    }

    @Test
    void superuserReceivesEveryCatalogPermission() {
        AuthenticatedSubject subject = subject("local.superuser");
        RoleAssignment assignment = assignment("local.superuser", RoleCode.SUPERUSER);

        catalog.permissions().forEach(permission -> assertEquals(
                DecisionResult.ALLOW,
                evaluator.evaluate(
                        subject,
                        List.of(assignment),
                        request(permission.resource(), permission.action().value()))
                        .result(),
                () -> "superuser denied " + permission.resource() + ":" + permission.action().value()));
    }

    @Test
    void pricingCanAdministerRatesAndFinanceReadCannotMutate() {
        AuthenticatedSubject analyst = subject("pricing-analyst");
        RoleAssignment pricing = assignment("pricing-analyst", RoleCode.PRICING);
        for (String action : List.of("read", "create", "update", "approve", "create-successor")) {
            assertEquals(DecisionResult.ALLOW,
                    evaluator.evaluate(analyst, List.of(pricing), request("charge-rates", action)).result());
        }

        AuthenticatedSubject reader = subject("finance-reader");
        RoleAssignment finance = assignment("finance-reader", RoleCode.FINANCE_READ);
        assertEquals(DecisionResult.ALLOW,
                evaluator.evaluate(reader, List.of(finance), request("charge-rates", "read")).result());
        assertEquals(DecisionResult.DENY,
                evaluator.evaluate(reader, List.of(finance), request("charge-rates", "approve")).result());
    }

    @Test
    void pricingCanAdministerAgreementsAndFinanceRemainsReadOnly() {
        AuthenticatedSubject analyst = subject("pricing-analyst");
        RoleAssignment pricing = assignment("pricing-analyst", RoleCode.PRICING);
        for (String action : List.of(
                "read", "create", "update", "approve", "create-successor", "suspend", "expire")) {
            assertEquals(DecisionResult.ALLOW,
                    evaluator.evaluate(analyst, List.of(pricing), request("charge-agreements", action)).result());
        }
        assertEquals(DecisionResult.ALLOW,
                evaluator.evaluate(analyst, List.of(pricing), request("charge-manual-cases", "read")).result());

        AuthenticatedSubject reader = subject("finance-reader");
        RoleAssignment finance = assignment("finance-reader", RoleCode.FINANCE_READ);
        assertEquals(DecisionResult.ALLOW,
                evaluator.evaluate(reader, List.of(finance), request("charge-agreements", "read")).result());
        for (String action : List.of("create", "update", "approve", "create-successor", "suspend", "expire")) {
            assertEquals(DecisionResult.DENY,
                    evaluator.evaluate(reader, List.of(finance), request("charge-agreements", action)).result());
        }
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

    @Test
    void assignmentForAnotherSubjectDoesNotGrantPermission() {
        AuthenticatedSubject subject = subject("alice");
        RoleAssignment assignment = assignment("mallory", RoleCode.REFERENCE_ADMIN);

        assertEquals(ReasonCode.DENY_NO_PERMISSION, evaluator.evaluate(subject, List.of(assignment), request("create")).reasonCode());
    }

    @Test
    void invalidRequestFailsClosedWithCorrelationSafeDecision() {
        AuthenticatedSubject subject = subject("alice");

        assertEquals(ReasonCode.DENY_INVALID_TOKEN, evaluator.evaluate(subject, List.of(assignment("alice", RoleCode.REFERENCE_ADMIN)),
                new AuthorizationRequest("req-1", "corr-1", "token-ref", "", "create", null, Map.of())).reasonCode());
    }

    @Test
    void serviceSubjectUsesExplicitServiceMarker() {
        AuthenticatedSubject subject = AuthenticatedSubject.service("svc-reference-data", "Reference Data Service", "keycloak", "carrier");

        assertEquals("svc-reference-data", subject.subjectId());
        assertNull(subject.email());
        assertTrue(subject.serviceSubject());
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

    private AuthorizationRequest request(String resource, String action) {
        return new AuthorizationRequest("req-1", "corr-1", "token-ref", resource, action, null, Map.of());
    }
}

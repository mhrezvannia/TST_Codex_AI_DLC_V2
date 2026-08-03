package com.linercore.platform.identity.domain.catalog;

import com.linercore.platform.identity.domain.model.Permission;
import com.linercore.platform.identity.domain.model.PermissionAction;
import com.linercore.platform.identity.domain.model.Role;
import com.linercore.platform.identity.domain.model.RoleCode;
import com.linercore.platform.identity.domain.model.RolePermission;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class MvpAuthorizationCatalog {
    public static final String POLICY_VERSION = "mvp-2026-08-02";
    private final List<Role> roles;
    private final List<Permission> permissions;
    private final List<RolePermission> grants;

    public MvpAuthorizationCatalog() {
        this.roles = List.of(
                role("role-superuser", RoleCode.SUPERUSER, "Superuser"),
                role("role-pricing", RoleCode.PRICING, "Pricing"),
                role("role-sales", RoleCode.SALES, "Sales"),
                role("role-booking-desk", RoleCode.BOOKING_DESK, "Booking Desk"),
                role("role-equipment-control", RoleCode.EQUIPMENT_CONTROL, "Equipment Control"),
                role("role-customer-service", RoleCode.CUSTOMER_SERVICE, "Customer Service"),
                role("role-finance-read", RoleCode.FINANCE_READ, "Finance Read"),
                role("role-reference-admin", RoleCode.REFERENCE_ADMIN, "Reference Admin"),
                role("role-platform-operator", RoleCode.PLATFORM_OPERATOR, "Platform Operator"),
                role("role-security-admin", RoleCode.SECURITY_ADMIN, "Security Admin")
        );
        this.permissions = List.of(
                permission("perm-reference-read", "reference-data", PermissionAction.READ),
                permission("perm-reference-create", "reference-data", PermissionAction.CREATE),
                permission("perm-reference-update", "reference-data", PermissionAction.UPDATE),
                permission("perm-reference-deactivate", "reference-data", PermissionAction.DEACTIVATE),
                permission("perm-reference-reactivate", "reference-data", PermissionAction.REACTIVATE),
                permission("perm-booking-read", "booking", PermissionAction.READ),
                permission("perm-booking-create", "booking", PermissionAction.CREATE),
                permission("perm-booking-validate", "booking", PermissionAction.VALIDATE),
                permission("perm-booking-request-pricing", "booking", PermissionAction.REQUEST_PRICING),
                permission("perm-booking-confirm", "booking", PermissionAction.CONFIRM),
                permission("perm-booking-amend", "booking", PermissionAction.AMEND),
                permission("perm-booking-reconfirm", "booking", PermissionAction.RECONFIRM),
                permission("perm-charge-rates-read", "charge-rates", PermissionAction.READ),
                permission("perm-charge-rates-create", "charge-rates", PermissionAction.CREATE),
                permission("perm-charge-rates-update", "charge-rates", PermissionAction.UPDATE),
                permission("perm-charge-rates-approve", "charge-rates", PermissionAction.APPROVE),
                permission("perm-charge-rates-create-successor", "charge-rates", PermissionAction.CREATE_SUCCESSOR),
                permission("perm-charge-agreements-read", "charge-agreements", PermissionAction.READ),
                permission("perm-charge-agreements-create", "charge-agreements", PermissionAction.CREATE),
                permission("perm-charge-agreements-update", "charge-agreements", PermissionAction.UPDATE),
                permission("perm-charge-agreements-approve", "charge-agreements", PermissionAction.APPROVE),
                permission("perm-charge-agreements-create-successor",
                        "charge-agreements", PermissionAction.CREATE_SUCCESSOR),
                permission("perm-charge-agreements-suspend", "charge-agreements", PermissionAction.SUSPEND),
                permission("perm-charge-agreements-expire", "charge-agreements", PermissionAction.EXPIRE),
                permission("perm-charge-manual-cases-read", "charge-manual-cases", PermissionAction.READ),
                permission("perm-contract-read", "reference-contracts", PermissionAction.READ),
                permission("perm-identity-role-read", "identity-roles", PermissionAction.READ),
                permission("perm-identity-role-assign", "identity-roles", PermissionAction.ASSIGN),
                permission("perm-identity-role-revoke", "identity-roles", PermissionAction.REVOKE),
                permission("perm-identity-audit-read", "identity-audit", PermissionAction.READ),
                permission("perm-platform-status-read", "platform-status", PermissionAction.READ)
        );
        this.grants = grants();
    }

    public List<Role> roles() {
        return roles;
    }

    public List<Permission> permissions() {
        return permissions;
    }

    public List<RolePermission> grantsForRole(String roleId) {
        return grants.stream().filter(grant -> grant.roleId().equals(roleId)).toList();
    }

    public Optional<Role> roleById(String roleId) {
        return roles.stream().filter(role -> role.roleId().equals(roleId)).findFirst();
    }

    public Optional<Role> roleByCode(RoleCode roleCode) {
        return roles.stream().filter(role -> role.code() == roleCode).findFirst();
    }

    public Optional<Permission> permissionById(String permissionId) {
        return permissions.stream().filter(permission -> permission.permissionId().equals(permissionId)).findFirst();
    }

    private Role role(String id, RoleCode code, String name) {
        return new Role(id, code, name, name + " MVP role", true, true);
    }

    private Permission permission(String id, String resource, PermissionAction action) {
        return new Permission(id, resource, action, null, "Confidential");
    }

    private List<RolePermission> grants() {
        Map<RoleCode, List<String>> roleGrantIds = Map.of(
                RoleCode.SUPERUSER, permissions.stream().map(Permission::permissionId).toList(),
                RoleCode.REFERENCE_ADMIN, List.of("perm-reference-read", "perm-reference-create", "perm-reference-update",
                        "perm-reference-deactivate", "perm-reference-reactivate", "perm-contract-read"),
                RoleCode.SECURITY_ADMIN, List.of("perm-identity-role-read", "perm-identity-role-assign",
                        "perm-identity-role-revoke", "perm-identity-audit-read", "perm-platform-status-read"),
                RoleCode.PLATFORM_OPERATOR, List.of("perm-platform-status-read", "perm-identity-audit-read", "perm-contract-read"),
                RoleCode.PRICING, List.of("perm-reference-read", "perm-contract-read",
                        "perm-charge-rates-read", "perm-charge-rates-create", "perm-charge-rates-update",
                        "perm-charge-rates-approve", "perm-charge-rates-create-successor",
                        "perm-charge-agreements-read", "perm-charge-agreements-create",
                        "perm-charge-agreements-update", "perm-charge-agreements-approve",
                        "perm-charge-agreements-create-successor", "perm-charge-agreements-suspend",
                        "perm-charge-agreements-expire", "perm-charge-manual-cases-read"),
                RoleCode.SALES, List.of("perm-reference-read"),
                RoleCode.BOOKING_DESK, List.of("perm-reference-read", "perm-booking-read", "perm-booking-create",
                        "perm-booking-validate", "perm-booking-request-pricing", "perm-booking-confirm",
                        "perm-booking-amend", "perm-booking-reconfirm"),
                RoleCode.EQUIPMENT_CONTROL, List.of("perm-reference-read"),
                RoleCode.CUSTOMER_SERVICE, List.of("perm-reference-read"),
                RoleCode.FINANCE_READ, List.of(
                        "perm-reference-read", "perm-charge-rates-read", "perm-charge-agreements-read")
        );

        Instant epoch = Instant.EPOCH;
        return roles.stream()
                .flatMap(role -> roleGrantIds.getOrDefault(role.code(), List.of()).stream()
                        .map(permissionId -> new RolePermission(role.roleId(), permissionId, epoch, null, POLICY_VERSION)))
                .toList();
    }
}

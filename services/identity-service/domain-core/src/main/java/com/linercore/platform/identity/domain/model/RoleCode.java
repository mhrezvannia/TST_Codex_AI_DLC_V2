package com.linercore.platform.identity.domain.model;

public enum RoleCode {
    SUPERUSER("superuser"),
    PRICING("pricing"),
    SALES("sales"),
    BOOKING_DESK("booking-desk"),
    EQUIPMENT_CONTROL("equipment-control"),
    CUSTOMER_SERVICE("customer-service"),
    FINANCE_READ("finance-read"),
    REFERENCE_ADMIN("reference-admin"),
    PLATFORM_OPERATOR("platform-operator"),
    SECURITY_ADMIN("security-admin");

    private final String code;

    RoleCode(String code) {
        this.code = code;
    }

    public String code() {
        return code;
    }
}

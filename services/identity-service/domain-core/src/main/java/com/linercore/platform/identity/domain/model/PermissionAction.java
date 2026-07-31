package com.linercore.platform.identity.domain.model;

public enum PermissionAction {
    READ("read"),
    CREATE("create"),
    VALIDATE("validate"),
    REQUEST_PRICING("request-pricing"),
    CONFIRM("confirm"),
    UPDATE("update"),
    APPROVE("approve"),
    CREATE_SUCCESSOR("create-successor"),
    SUSPEND("suspend"),
    EXPIRE("expire"),
    DEACTIVATE("deactivate"),
    REACTIVATE("reactivate"),
    ASSIGN("assign"),
    REVOKE("revoke");

    private final String value;

    PermissionAction(String value) {
        this.value = value;
    }

    public String value() {
        return value;
    }
}

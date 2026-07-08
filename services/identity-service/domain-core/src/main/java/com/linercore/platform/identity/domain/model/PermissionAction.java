package com.linercore.platform.identity.domain.model;

public enum PermissionAction {
    READ("read"),
    CREATE("create"),
    UPDATE("update"),
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

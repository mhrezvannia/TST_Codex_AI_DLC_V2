package com.linercore.platform.chargeagreement.container.security;

public enum ChargeSubjectAssertionFailure {
    INVALID_SUBJECT_ASSERTION(401, "INVALID_SUBJECT_ASSERTION"),
    SUBJECT_ASSERTION_CAPACITY_EXHAUSTED(503, "SUBJECT_ASSERTION_CAPACITY_EXHAUSTED");

    private final int status;
    private final String code;

    ChargeSubjectAssertionFailure(int status, String code) {
        this.status = status;
        this.code = code;
    }

    public int status() {
        return status;
    }

    public String code() {
        return code;
    }
}

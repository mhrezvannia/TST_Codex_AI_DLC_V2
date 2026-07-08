package com.linercore.platform.identity.domain.model;

public enum ReasonCode {
    ALLOW,
    DENY_NO_PERMISSION,
    DENY_UNKNOWN_SUBJECT,
    DENY_INVALID_TOKEN,
    DENY_DEPENDENCY_UNAVAILABLE,
    DENY_STALE_ASSIGNMENT,
    DENY_CONFLICT
}

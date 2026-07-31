package com.linercore.platform.chargeagreement.container.security;

public record ChargeSubjectAssertionResult(
        boolean valid,
        Claims claims,
        ChargeSubjectAssertionFailure failure) {

    public static ChargeSubjectAssertionResult valid(Claims claims) {
        return new ChargeSubjectAssertionResult(true, claims, null);
    }

    public static ChargeSubjectAssertionResult invalid(ChargeSubjectAssertionFailure failure) {
        return new ChargeSubjectAssertionResult(false, null, failure);
    }

    public record Claims(
            String issuer,
            String kid,
            String subject,
            String method,
            String path,
            String correlationId,
            long issuedAt,
            long expiresAt,
            String nonce) {
    }
}

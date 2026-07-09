package com.linercore.platform.chargeagreement.domain.model;

public record ChargeTerm(
        String id,
        ReferenceId chargeCodeId,
        ChargeBasis basis,
        MoneyAmount amount,
        ValidityWindow validity,
        String notes) {
    public ChargeTerm {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("charge term id is required");
        }
        if (chargeCodeId == null) {
            throw new IllegalArgumentException("charge code id is required");
        }
        if (basis == null) {
            throw new IllegalArgumentException("charge basis is required");
        }
        if (amount == null) {
            throw new IllegalArgumentException("charge amount is required");
        }
        if (validity == null) {
            throw new IllegalArgumentException("charge term validity is required");
        }
        notes = notes == null ? "" : notes;
    }
}

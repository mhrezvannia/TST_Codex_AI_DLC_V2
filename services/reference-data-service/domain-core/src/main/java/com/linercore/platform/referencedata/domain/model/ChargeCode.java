package com.linercore.platform.referencedata.domain.model;

public record ChargeCode(ReferenceRecord record, String chargeFamily) {
    public ChargeCode {
        if (record.set() != ReferenceSet.CHARGE_CODE) {
            throw new IllegalArgumentException("charge code must belong to charge-code reference set");
        }
        if (!record.code().value().matches("[A-Z0-9]{3,8}")) {
            throw new IllegalArgumentException("charge code must contain 3-8 uppercase letters or digits");
        }
        if (chargeFamily == null || chargeFamily.isBlank()) {
            throw new IllegalArgumentException("chargeFamily is required");
        }
    }

    public static ChargeCode from(ReferenceRecord record) {
        return new ChargeCode(record, record.attributes().get("chargeFamily"));
    }
}

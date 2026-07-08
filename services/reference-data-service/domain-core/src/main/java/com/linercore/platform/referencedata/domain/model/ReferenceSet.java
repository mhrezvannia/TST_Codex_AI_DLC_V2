package com.linercore.platform.referencedata.domain.model;

public enum ReferenceSet {
    PARTY_CUSTOMER("party-customer"),
    LOCATION("location"),
    REGION("region"),
    VOYAGE("voyage"),
    CURRENCY("currency"),
    CHARGE_CODE("charge-code"),
    EQUIPMENT_TYPE("equipment-type"),
    COMMODITY("commodity"),
    TRADE_LANE("trade-lane");

    private final String path;

    ReferenceSet(String path) {
        this.path = path;
    }

    public String path() {
        return path;
    }
}

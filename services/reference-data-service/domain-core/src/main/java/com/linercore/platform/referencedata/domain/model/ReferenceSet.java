package com.linercore.platform.referencedata.domain.model;

import java.util.Arrays;

public enum ReferenceSet {
    PARTY_CUSTOMER("party-customer"),
    LOCATION("location"),
    REGION("region"),
    VESSEL_VOYAGE("vessel-voyage", "voyage"),
    CURRENCY("currency"),
    CHARGE_CODE("charge-code"),
    EQUIPMENT_TYPE("equipment-type"),
    COMMODITY("commodity"),
    TRADE_LANE("trade-lane");

    private final String path;
    private final String eventPath;

    ReferenceSet(String path) {
        this(path, path);
    }

    ReferenceSet(String path, String eventPath) {
        this.path = path;
        this.eventPath = eventPath;
    }

    public String path() {
        return path;
    }

    public String eventPath() {
        return eventPath;
    }

    public static ReferenceSet fromExternalValue(String value) {
        return Arrays.stream(values())
                .filter(set -> set.name().equalsIgnoreCase(value) || set.path.equalsIgnoreCase(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("unknown reference set: " + value));
    }
}

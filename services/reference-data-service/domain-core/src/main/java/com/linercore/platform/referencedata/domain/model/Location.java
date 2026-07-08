package com.linercore.platform.referencedata.domain.model;

public record Location(ReferenceRecord record, LocationType locationType, ReferenceId parentCountryId, String unLocode) {
    public enum LocationType {
        COUNTRY,
        PORT
    }
}

package com.linercore.platform.referencedata.domain.model;

public record TradeLane(ReferenceRecord record, ReferenceId originRegionId, ReferenceId destinationRegionId, String description) {
}

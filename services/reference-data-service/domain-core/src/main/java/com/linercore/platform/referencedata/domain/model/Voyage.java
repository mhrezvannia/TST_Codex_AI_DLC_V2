package com.linercore.platform.referencedata.domain.model;

import java.time.Instant;

public record Voyage(ReferenceRecord record, String vesselNameOrCode, Instant scheduledDeparture, Instant scheduledArrival, Integer nominalCapacity) {
}

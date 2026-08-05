package com.linercore.platform.containermovement.applicationservice.query;

import com.linercore.platform.containermovement.domain.model.ContainerJourney;
import java.time.Instant;

public record JourneyReadResult(
        ContainerJourney journey,
        Freshness freshness,
        Instant dataUpdatedAt,
        boolean captureEnabled,
        CaptureDisabledReason captureDisabledReason,
        Dependency dependency,
        Instant checkedAt) {

    public enum Freshness {
        FRESH,
        LAST_KNOWN,
        UNAVAILABLE
    }

    public enum CaptureDisabledReason {
        CAPTURE_NOT_AUTHORIZED,
        CAPABILITY_UNAVAILABLE,
        REFERENCE_DATA_LAST_KNOWN,
        REFERENCE_DATA_UNAVAILABLE
    }

    public enum Dependency {
        NONE,
        IDENTITY,
        REFERENCE_DATA
    }
}

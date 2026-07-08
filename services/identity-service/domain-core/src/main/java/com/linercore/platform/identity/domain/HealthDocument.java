package com.linercore.platform.identity.domain;

import java.time.Instant;

public record HealthDocument(String service, String status, Instant timestamp) {
    public static HealthDocument up(String service) {
        return new HealthDocument(service, "UP", Instant.now());
    }
}

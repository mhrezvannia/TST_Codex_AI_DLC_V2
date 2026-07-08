package com.linercore.platform.referencedata.domain;

import java.time.Instant;
import java.util.Map;

public record ErrorEnvelope(
        String code,
        String message,
        String correlationId,
        Instant timestamp,
        Map<String, Object> details) {
}

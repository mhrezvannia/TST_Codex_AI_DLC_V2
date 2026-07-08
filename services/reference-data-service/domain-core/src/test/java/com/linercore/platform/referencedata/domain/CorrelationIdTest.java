package com.linercore.platform.referencedata.domain;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import org.junit.jupiter.api.Test;

class CorrelationIdTest {
    @Test
    void usesExistingCorrelationId() {
        assertEquals("corr-1", CorrelationId.existingOrNew("corr-1").value());
    }

    @Test
    void createsMissingCorrelationId() {
        assertFalse(CorrelationId.existingOrNew(null).value().isBlank());
    }
}

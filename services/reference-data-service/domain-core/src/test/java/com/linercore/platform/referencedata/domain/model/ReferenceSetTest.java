package com.linercore.platform.referencedata.domain.model;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class ReferenceSetTest {
    @Test
    void resolvesCanonicalPathAndEnumIdentifier() {
        assertEquals(ReferenceSet.VESSEL_VOYAGE, ReferenceSet.fromExternalValue("vessel-voyage"));
        assertEquals(ReferenceSet.VESSEL_VOYAGE, ReferenceSet.fromExternalValue("VESSEL_VOYAGE"));
        assertEquals("voyage", ReferenceSet.VESSEL_VOYAGE.eventPath());
    }
}

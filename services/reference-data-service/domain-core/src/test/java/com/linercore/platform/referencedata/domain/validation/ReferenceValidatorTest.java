package com.linercore.platform.referencedata.domain.validation;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.linercore.platform.referencedata.domain.model.AuditActor;
import com.linercore.platform.referencedata.domain.model.ReferenceCode;
import com.linercore.platform.referencedata.domain.model.ReferenceId;
import com.linercore.platform.referencedata.domain.model.ReferenceRecord;
import com.linercore.platform.referencedata.domain.model.ReferenceSet;
import com.linercore.platform.referencedata.domain.model.ReferenceStatus;
import java.time.Instant;
import java.util.Map;
import org.junit.jupiter.api.Test;

class ReferenceValidatorTest {
    private final ReferenceValidator validator = new ReferenceValidator();

    @Test
    void rejectsOrphanPort() {
        ReferenceRecord port = record(ReferenceSet.LOCATION, Map.of("locationType", "PORT"));
        assertFalse(validator.validate(port, Map.of()).valid());
    }

    @Test
    void acceptsTradeLaneWithActiveRegions() {
        ReferenceRecord lane = record(ReferenceSet.TRADE_LANE, Map.of("originRegionId", "r1", "destinationRegionId", "r2"));
        assertTrue(validator.validate(lane, Map.of("r1", region("r1"), "r2", region("r2"))).valid());
    }

    private ReferenceRecord region(String id) {
        return record(id, ReferenceSet.REGION, Map.of());
    }

    private ReferenceRecord record(ReferenceSet set, Map<String, String> attributes) {
        return record("id-1", set, attributes);
    }

    private ReferenceRecord record(String id, ReferenceSet set, Map<String, String> attributes) {
        AuditActor actor = new AuditActor("tester", "Tester");
        return new ReferenceRecord(new ReferenceId(id), set, new ReferenceCode(id), "Name", ReferenceStatus.ACTIVE,
                1, actor, Instant.EPOCH, actor, Instant.EPOCH, null, null, null, attributes);
    }
}

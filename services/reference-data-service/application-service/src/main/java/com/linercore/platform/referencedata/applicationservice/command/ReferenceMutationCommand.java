package com.linercore.platform.referencedata.applicationservice.command;

import com.linercore.platform.referencedata.domain.model.ReferenceSet;
import java.util.Map;

public record ReferenceMutationCommand(
        ReferenceSet set,
        String code,
        String displayName,
        Map<String, String> attributes,
        String actorSubjectId,
        String actorDisplayName,
        String operation,
        String reason,
        String correlationId) {
    public static ReferenceMutationCommand statusCommand(ReferenceSet set, String actorSubjectId, String reason, String correlationId) {
        return new ReferenceMutationCommand(set, "status", "status", Map.of(), actorSubjectId, actorSubjectId,
                "deactivate", reason, correlationId);
    }
}

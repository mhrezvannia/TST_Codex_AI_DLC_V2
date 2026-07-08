package com.linercore.platform.referencedata.domain.outbox;

import java.util.Map;

public record ReferenceEventPayload(String id, String code, String displayName, String status, long version, Map<String, String> changedFields) {
}

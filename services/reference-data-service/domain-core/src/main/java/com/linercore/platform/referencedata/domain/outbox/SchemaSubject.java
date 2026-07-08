package com.linercore.platform.referencedata.domain.outbox;

public record SchemaSubject(String subjectName, String eventType, String schemaVersion, String compatibilityMode) {
}

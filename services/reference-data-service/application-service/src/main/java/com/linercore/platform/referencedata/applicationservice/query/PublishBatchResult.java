package com.linercore.platform.referencedata.applicationservice.query;

public record PublishBatchResult(int claimed, int published, int retryableFailures, int permanentFailures) {
}

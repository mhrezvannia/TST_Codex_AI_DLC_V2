package com.linercore.platform.containermovement.applicationservice.query;

public record PublishBatchResult(int claimed, int published, int retryableFailures, int permanentFailures) {
}

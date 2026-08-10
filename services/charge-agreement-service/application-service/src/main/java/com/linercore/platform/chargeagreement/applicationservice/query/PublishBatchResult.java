package com.linercore.platform.chargeagreement.applicationservice.query;

public record PublishBatchResult(int claimed, int published, int retryableFailures, int permanentFailures) {
}

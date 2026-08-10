package com.linercore.platform.booking.applicationservice.query;

public record PublishBatchResult(int claimed, int published, int retryableFailures, int permanentFailures) {
}

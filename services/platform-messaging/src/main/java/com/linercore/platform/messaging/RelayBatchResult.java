package com.linercore.platform.messaging;

/** Outcome of draining one outbox batch. */
public record RelayBatchResult(int claimed, int published, int retryableFailures, int permanentFailures) {
}

package com.linercore.platform.messaging;

/**
 * A service's outbox-draining operation: claim a batch, publish each event, mark rows
 * published/retryable/permanent. Usually a method reference to the application service's
 * {@code publishOutboxBatch}, adapted to {@link RelayBatchResult}.
 */
@FunctionalInterface
public interface OutboxRelay {
    RelayBatchResult publishBatch(String workerId, int batchSize);
}

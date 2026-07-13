package com.linercore.platform.messaging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;

/**
 * Drives an {@link OutboxRelay} on a fixed schedule. Register one bean per service (with
 * {@code @EnableScheduling} active) — this replaces the per-service hand-written relay workers.
 */
public class ScheduledOutboxRelay {
    private static final Logger LOGGER = LoggerFactory.getLogger(ScheduledOutboxRelay.class);

    private final String serviceName;
    private final OutboxRelay relay;
    private final String workerId;
    private final int batchSize;

    public ScheduledOutboxRelay(String serviceName, OutboxRelay relay, String workerId, int batchSize) {
        this.serviceName = serviceName;
        this.relay = relay;
        this.workerId = workerId;
        this.batchSize = batchSize;
    }

    @Scheduled(fixedDelayString = "${platform.outbox-relay.fixed-delay-ms:5000}")
    public void publishEvents() {
        RelayBatchResult result = relay.publishBatch(workerId, batchSize);
        if (result.claimed() > 0) {
            LOGGER.info("{} outbox relay claimed={} published={} retryable={} permanent={}",
                    serviceName, result.claimed(), result.published(),
                    result.retryableFailures(), result.permanentFailures());
        }
    }
}

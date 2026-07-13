package com.linercore.platform.referencedata.container;

import com.linercore.platform.referencedata.applicationservice.ReferenceDataApplicationService;
import com.linercore.platform.referencedata.applicationservice.query.PublishBatchResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "reference-data.outbox-relay", name = "enabled", havingValue = "true", matchIfMissing = true)
public class ReferenceDataOutboxRelayWorker {
    private static final Logger LOGGER = LoggerFactory.getLogger(ReferenceDataOutboxRelayWorker.class);

    private final ReferenceDataApplicationService service;
    private final String workerId;
    private final int batchSize;

    public ReferenceDataOutboxRelayWorker(
            ReferenceDataApplicationService service,
            @Value("${reference-data.outbox-relay.worker-id:reference-data-relay}") String workerId,
            @Value("${reference-data.outbox-relay.batch-size:50}") int batchSize) {
        this.service = service;
        this.workerId = workerId;
        this.batchSize = batchSize;
    }

    @Scheduled(fixedDelayString = "${reference-data.outbox-relay.fixed-delay-ms:5000}")
    public void publishEvents() {
        PublishBatchResult result = service.publishOutboxBatch(workerId, batchSize);
        if (result.claimed() > 0) {
            LOGGER.info("reference data outbox relay claimed={} published={} retryable={} permanent={}",
                    result.claimed(), result.published(), result.retryableFailures(), result.permanentFailures());
        }
    }
}

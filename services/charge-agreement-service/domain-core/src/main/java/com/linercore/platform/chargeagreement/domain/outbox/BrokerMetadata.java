package com.linercore.platform.chargeagreement.domain.outbox;

import java.time.Instant;

public record BrokerMetadata(String topic, int partition, long offset, Instant publishedAt) {
}

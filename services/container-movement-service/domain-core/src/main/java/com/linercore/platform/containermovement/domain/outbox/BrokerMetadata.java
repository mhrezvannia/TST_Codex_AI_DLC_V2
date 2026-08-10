package com.linercore.platform.containermovement.domain.outbox;

import java.time.Instant;

public record BrokerMetadata(String topic, int partition, long offset, Instant publishedAt) {
}

package com.linercore.platform.booking.domain.outbox;

import java.time.Instant;

public record BrokerMetadata(String topic, int partition, long offset, Instant publishedAt) {
}

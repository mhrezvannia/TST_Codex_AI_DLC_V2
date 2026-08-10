package com.linercore.platform.messaging;

import java.time.Instant;

/** Real broker coordinates returned after a successful publish. */
public record BrokerMetadata(String topic, int partition, long offset, Instant publishedAt) {
}

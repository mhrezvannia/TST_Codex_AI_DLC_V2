package com.linercore.platform.chargeagreement.container.security;

import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Process-local single-use protection for the short-lived U02 assertion.
 *
 * <p>Restart clears this map, leaving at most the assertion's 35-second signed
 * lifetime and skew window. Multi-instance deployment requires shared replay
 * authority and is intentionally not claimed by this local-only implementation.
 */
public final class ChargeSubjectAssertionReplayCache {
    public enum ClaimResult {
        CLAIMED,
        DUPLICATE,
        CAPACITY_EXHAUSTED
    }

    private final int capacity;
    private final Map<String, Long> expiresAtByKey = new LinkedHashMap<>();

    public ChargeSubjectAssertionReplayCache(int capacity) {
        if (capacity < 1 || capacity > 65_536) {
            throw new IllegalArgumentException("Replay capacity is invalid");
        }
        this.capacity = capacity;
    }

    public synchronized ClaimResult claim(String kid, String nonce, long expiresAt, long nowEpochSecond) {
        cleanup(nowEpochSecond);
        String key = kid + ":" + nonce;
        if (expiresAtByKey.containsKey(key)) {
            return ClaimResult.DUPLICATE;
        }
        if (expiresAtByKey.size() >= capacity) {
            return ClaimResult.CAPACITY_EXHAUSTED;
        }
        expiresAtByKey.put(key, expiresAt + 5);
        return ClaimResult.CLAIMED;
    }

    public synchronized int occupancy(long nowEpochSecond) {
        cleanup(nowEpochSecond);
        return expiresAtByKey.size();
    }

    private void cleanup(long nowEpochSecond) {
        // Work is bounded by the configured capacity (4096 in Wave A).
        Iterator<Map.Entry<String, Long>> iterator = expiresAtByKey.entrySet().iterator();
        while (iterator.hasNext()) {
            if (iterator.next().getValue() < nowEpochSecond) {
                iterator.remove();
            }
        }
    }
}

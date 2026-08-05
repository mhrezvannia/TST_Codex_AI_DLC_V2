package com.linercore.platform.messaging;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.core.env.Environment;

/** Fails fast if a {@link LocalNoopMarker} messaging adapter is active outside the {@code local} profile. */
public final class NoopMessagingGuard {
    private NoopMessagingGuard() {
    }

    public static void assertNoopAllowed(Environment environment, boolean noopActive) {
        if (!noopActive) {
            return;
        }
        if (environment.getProperty("messaging.require-real", Boolean.class, false)) {
            throw new IllegalStateException(
                    "real messaging is required; local-noop messaging adapters are not allowed");
        }
        Set<String> profiles = Arrays.stream(environment.getActiveProfiles()).collect(Collectors.toSet());
        if (!profiles.contains("local")) {
            throw new IllegalStateException(
                    "local-noop messaging adapters are only allowed with the 'local' profile");
        }
    }
}

package com.linercore.platform.booking.container;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class BookingLocalAuthorizationTest {
    private final BookingLocalAuthorization authorization = new BookingLocalAuthorization();

    @Test
    void grantsOnlyMappedSubjectActions() {
        assertTrue(authorization.allowed("local-user", "booking", "create", "corr-1"));
        assertTrue(authorization.allowed("local-seed", "booking", "read", "corr-1"));
        assertTrue(authorization.allowed(
                "container-movement-service", "booking", "consume-movement-status", "corr-1"));

        assertFalse(authorization.allowed("local-seed", "booking", "confirm", "corr-1"));
        assertFalse(authorization.allowed("unknown", "booking", "read", "corr-1"));
        assertFalse(authorization.allowed("local-user", "pricing", "create", "corr-1"));
        assertFalse(authorization.allowed("local-user", "booking", "create", " "));
    }
}

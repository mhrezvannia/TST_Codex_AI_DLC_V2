package com.linercore.platform.booking.applicationservice.port;

public enum ReferenceProviderFailureCategory {
    TIMEOUT,
    THROTTLED,
    CONNECTION,
    SERVER,
    CONTRACT,
    OVERLOADED
}

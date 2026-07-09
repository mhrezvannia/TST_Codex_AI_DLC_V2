package com.linercore.platform.booking.applicationservice.port;

import com.linercore.platform.booking.domain.model.Booking;

public interface PricingPort {
    String requestPricing(Booking booking, String idempotencyKey, String correlationId);
}

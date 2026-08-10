package com.linercore.platform.booking.applicationservice.port;

import com.linercore.platform.booking.domain.model.Booking;

public interface PricingPort {
    PricingRequestResult requestPricing(Booking booking, String idempotencyKey, String correlationId);
}

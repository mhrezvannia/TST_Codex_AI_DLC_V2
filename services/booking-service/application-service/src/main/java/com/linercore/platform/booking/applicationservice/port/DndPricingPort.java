package com.linercore.platform.booking.applicationservice.port;

import com.linercore.platform.booking.domain.model.Booking;

public interface DndPricingPort {
    DndPricingResult requestDndPricing(Booking booking, String idempotencyKey, String correlationId);
}

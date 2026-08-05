package com.linercore.platform.booking.applicationservice.port;

import com.linercore.platform.booking.domain.model.BookingId;
import com.linercore.platform.booking.domain.model.PricingHistoryPage;

public interface PricingHistoryPort {
    PricingHistoryPage findHistory(BookingId bookingId, String cursor, int limit);
}

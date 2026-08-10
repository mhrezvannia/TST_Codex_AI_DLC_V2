package com.linercore.platform.booking.applicationservice.port;

import com.linercore.platform.booking.domain.model.BookingId;
import com.linercore.platform.booking.domain.model.PricingSnapshot;

public interface PricingSnapshotRepository extends PricingHistoryPort {
    void append(BookingId bookingId, PricingSnapshot snapshot);
}

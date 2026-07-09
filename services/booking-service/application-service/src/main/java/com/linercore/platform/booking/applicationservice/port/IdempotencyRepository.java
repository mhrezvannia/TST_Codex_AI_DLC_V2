package com.linercore.platform.booking.applicationservice.port;

import com.linercore.platform.booking.domain.model.BookingId;
import java.util.Optional;

public interface IdempotencyRepository {
    Optional<BookingId> findBookingId(String idempotencyKey);

    void remember(String idempotencyKey, BookingId bookingId);
}

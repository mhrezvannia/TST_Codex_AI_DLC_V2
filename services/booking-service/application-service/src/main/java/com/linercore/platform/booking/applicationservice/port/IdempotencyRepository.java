package com.linercore.platform.booking.applicationservice.port;

import com.linercore.platform.booking.domain.model.BookingId;
import java.util.Optional;

public interface IdempotencyRepository {
    Optional<BookingId> findBookingId(String idempotencyKey);

    void remember(String idempotencyKey, BookingId bookingId);

    default Optional<IdempotencyReceipt> findReceipt(String idempotencyKey) {
        return findBookingId(idempotencyKey)
                .map(bookingId -> new IdempotencyReceipt(idempotencyKey, "CREATE", "LEGACY_UNKNOWN", bookingId,
                        "COMPLETED", null));
    }

    default boolean claim(String idempotencyKey, String operation, String requestHash, BookingId bookingId) {
        if (findBookingId(idempotencyKey).isPresent()) {
            return false;
        }
        remember(idempotencyKey, bookingId);
        return true;
    }

    default void complete(String idempotencyKey, int responseRevision) {
    }
}

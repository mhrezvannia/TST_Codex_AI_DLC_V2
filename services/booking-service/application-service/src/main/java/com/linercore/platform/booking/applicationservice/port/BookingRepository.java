package com.linercore.platform.booking.applicationservice.port;

import com.linercore.platform.booking.domain.model.Booking;
import com.linercore.platform.booking.domain.model.BookingId;
import com.linercore.platform.booking.domain.model.BookingStatus;
import java.util.List;
import java.util.Optional;

public interface BookingRepository {
    Booking save(Booking booking);

    Optional<Booking> findById(BookingId id);

    default Optional<Booking> findByIdForUpdate(BookingId id) {
        return findById(id);
    }

    default List<Booking> findRecent(int limit) {
        return List.of();
    }

    default List<Booking> findPage(String search, BookingStatus status, int page, int size) {
        return findRecent(size);
    }
}

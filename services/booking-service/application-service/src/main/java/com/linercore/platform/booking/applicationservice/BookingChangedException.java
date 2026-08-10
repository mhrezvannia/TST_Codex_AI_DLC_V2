package com.linercore.platform.booking.applicationservice;

public final class BookingChangedException extends RuntimeException {
    public BookingChangedException() {
        super("Booking changed during reference validation");
    }
}

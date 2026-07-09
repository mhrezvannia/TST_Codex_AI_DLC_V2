package com.linercore.platform.booking.domain.model;

public record BookingId(String value) {
    public BookingId {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("booking id is required");
        }
    }
}

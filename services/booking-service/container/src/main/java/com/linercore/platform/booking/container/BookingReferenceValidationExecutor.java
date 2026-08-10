package com.linercore.platform.booking.container;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

public final class BookingReferenceValidationExecutor extends ThreadPoolExecutor {
    public BookingReferenceValidationExecutor() {
        this(new AtomicInteger());
    }

    private BookingReferenceValidationExecutor(AtomicInteger sequence) {
        super(10, 10, 0L, TimeUnit.MILLISECONDS, new ArrayBlockingQueue<>(20), task -> {
            Thread thread = new Thread(task, "booking-reference-validation-" + sequence.incrementAndGet());
            thread.setDaemon(false);
            return thread;
        }, new AbortPolicy());
    }

    public void shutdownGracefully() {
        shutdown();
        try {
            if (!awaitTermination(2, TimeUnit.SECONDS)) {
                shutdownNow();
            }
        } catch (InterruptedException exception) {
            shutdownNow();
            Thread.currentThread().interrupt();
        }
    }
}

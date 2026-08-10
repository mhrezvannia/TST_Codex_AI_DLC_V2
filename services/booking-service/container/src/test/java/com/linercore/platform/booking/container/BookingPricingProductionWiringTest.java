package com.linercore.platform.booking.container;

import static org.junit.jupiter.api.Assertions.assertInstanceOf;

import com.linercore.platform.booking.applicationservice.port.AuthorizationPort;
import com.linercore.platform.booking.applicationservice.port.BookingRepository;
import com.linercore.platform.booking.applicationservice.port.PricingOperationReceiptPort;
import com.linercore.platform.booking.applicationservice.port.PricingSnapshotRepository;
import com.linercore.platform.booking.applicationservice.pricing.BookingPricingCaptureService;
import com.linercore.platform.booking.applicationservice.pricing.BookingPricingCompletionService;
import com.linercore.platform.booking.applicationservice.pricing.ChargePricingPortAdapter;
import java.util.concurrent.Semaphore;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestTemplate;

class BookingPricingProductionWiringTest {
    private final BookingServiceConfiguration configuration = new BookingServiceConfiguration();

    @Test
    void productionPortIsTheTypedChargeAdapter() {
        assertInstanceOf(
                ChargePricingPortAdapter.class,
                configuration.bookingPricingPort(
                        new RestTemplate(),
                        new Semaphore(10, true),
                        "http://charge",
                        "booking-service",
                        "trusted-token"));
    }

    @Test
    void productionCaptureAndCompletionUseDedicatedTransactionalBeans() {
        BookingRepository bookings = org.mockito.Mockito.mock(BookingRepository.class);
        AuthorizationPort authorization = org.mockito.Mockito.mock(AuthorizationPort.class);
        PricingOperationReceiptPort receipts =
                org.mockito.Mockito.mock(PricingOperationReceiptPort.class);
        PricingSnapshotRepository snapshots =
                org.mockito.Mockito.mock(PricingSnapshotRepository.class);

        assertInstanceOf(
                BookingPricingCaptureService.class,
                configuration.bookingPricingCaptureService(bookings, authorization, receipts));
        assertInstanceOf(
                BookingPricingCompletionService.class,
                configuration.bookingPricingCompletionService(bookings, receipts, snapshots));
    }
}

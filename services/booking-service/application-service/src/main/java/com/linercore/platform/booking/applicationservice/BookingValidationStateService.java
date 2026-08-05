package com.linercore.platform.booking.applicationservice;

import com.linercore.platform.booking.applicationservice.port.AuditRepository;
import com.linercore.platform.booking.applicationservice.port.BookingReferenceValidationRequest;
import com.linercore.platform.booking.applicationservice.port.BookingRepository;
import com.linercore.platform.booking.applicationservice.port.ReferenceCheck;
import com.linercore.platform.booking.applicationservice.port.ReferenceSet;
import com.linercore.platform.booking.applicationservice.port.ReferenceValidationResult;
import com.linercore.platform.booking.domain.model.Booking;
import com.linercore.platform.booking.domain.model.BookingId;
import com.linercore.platform.booking.domain.model.BookingStatus;
import com.linercore.platform.booking.domain.model.ReferenceValidationOutcome;
import java.time.Clock;
import java.util.ArrayList;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;

public class BookingValidationStateService {
    private final BookingRepository bookings;
    private final AuditRepository audit;
    private final Clock clock;

    public BookingValidationStateService(BookingRepository bookings, AuditRepository audit, Clock clock) {
        this.bookings = bookings;
        this.audit = audit;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public BookingReferenceValidationRequest capture(BookingId id) {
        Booking booking = bookings.findById(id).orElseThrow();
        if (booking.legacyIncomplete()) {
            throw new IllegalStateException("legacy booking requires route and equipment correction");
        }
        if (booking.status() != BookingStatus.DRAFT
                && booking.status() != BookingStatus.VALIDATION_BLOCKED
                && booking.status() != BookingStatus.VALIDATED) {
            throw new IllegalStateException("booking status " + booking.status() + " does not allow validation");
        }
        List<ReferenceCheck> checks = new ArrayList<>();
        checks.add(new ReferenceCheck("customerId", ReferenceSet.PARTY_CUSTOMER, booking.customerId()));
        for (int index = 0; index < booking.routing().size(); index++) {
            var leg = booking.routing().get(index);
            checks.add(new ReferenceCheck("routing[" + index + "].loadUnLocode", ReferenceSet.LOCATION,
                    leg.loadUnLocode()));
            checks.add(new ReferenceCheck("routing[" + index + "].dischargeUnLocode", ReferenceSet.LOCATION,
                    leg.dischargeUnLocode()));
            checks.add(new ReferenceCheck("routing[" + index + "].voyageId", ReferenceSet.VESSEL_VOYAGE,
                    leg.voyageId()));
        }
        for (int index = 0; index < booking.equipment().size(); index++) {
            checks.add(new ReferenceCheck("equipment[" + index + "].equipmentTypeCode", ReferenceSet.EQUIPMENT_TYPE,
                    booking.equipment().get(index).equipmentTypeCode()));
        }
        return new BookingReferenceValidationRequest(id, booking.revision(), booking.referenceFingerprint(), checks);
    }

    @Transactional
    public Booking apply(
            BookingReferenceValidationRequest request,
            ReferenceValidationResult result,
            String actorSubjectId) {
        Booking booking = bookings.findByIdForUpdate(request.bookingId()).orElseThrow();
        if (booking.revision() != request.bookingRevision()
                || !booking.referenceFingerprint().equals(request.referenceFingerprint())
                || result.bookingRevision() != request.bookingRevision()
                || !result.referenceFingerprint().equals(request.referenceFingerprint())) {
            throw new BookingChangedException();
        }
        Booking next;
        try {
            next = booking.applyReferenceValidation(result.toSnapshot(), actorSubjectId, clock.instant());
        } catch (IllegalStateException exception) {
            if ("BOOKING_CHANGED".equals(exception.getMessage())) {
                throw new BookingChangedException();
            }
            throw exception;
        }
        if (next == booking) {
            return booking;
        }
        bookings.save(next);
        boolean valid = next.referenceValidationSnapshot().outcome() == ReferenceValidationOutcome.VALID;
        audit.append(valid ? "BOOKING_VALIDATED" : "BOOKING_VALIDATION_BLOCKED", booking.id().value(),
                actorSubjectId, valid ? "SUCCESS" : "DENY", valid ? null : "REFERENCE_VALIDATION_BLOCKED",
                result.correlationId());
        return next;
    }

    @Transactional
    public void recordUnavailable(BookingId id, String actorSubjectId, String correlationId, String reasonCode) {
        audit.append("BOOKING_VALIDATION_UNAVAILABLE", id.value(), actorSubjectId, "ERROR", reasonCode,
                correlationId);
    }
}

package com.linercore.platform.chargeagreement.domain.model;

import java.time.LocalDate;
import java.util.Map;
import java.util.Objects;

public record PricingRequest(
        String bookingRef,
        String tradeLane,
        String pol,
        String pod,
        String equipmentType,
        String partyId,
        String commodityCode,
        boolean reeferIndicator,
        boolean dgIndicator,
        PricingDates dates,
        PricingQuantities quantities,
        String correlationId) {
    public PricingRequest(
            String requestId,
            ReferenceId customerId,
            ReferenceId tradeLaneId,
            ReferenceId commodityId,
            LocalDate effectiveDate,
            Map<ChargeBasis, Integer> quantities,
            String correlationId) {
        this(requestId, tradeLaneId.value(), "USNYC", "NLRTM", "22G1", customerId.value(), commodityId.value(), false, false,
                new PricingDates(effectiveDate, effectiveDate),
                new PricingQuantities(
                        quantities == null ? 1 : quantities.getOrDefault(ChargeBasis.CONTAINER, 1),
                        quantities == null ? 1 : quantities.getOrDefault(ChargeBasis.TEU, 1),
                        0),
                correlationId);
    }

    public PricingRequest {
        bookingRef = required(bookingRef, "booking ref", 96);
        tradeLane = required(tradeLane, "trade lane", 128);
        pol = required(pol, "POL", 32);
        pod = required(pod, "POD", 32);
        equipmentType = required(equipmentType, "equipment type", 64);
        partyId = required(partyId, "party id", 128);
        commodityCode = required(commodityCode, "commodity code", 128);
        if (dates == null) {
            throw new IllegalArgumentException("pricing dates are required");
        }
        if (quantities == null) {
            throw new IllegalArgumentException("pricing quantities are required");
        }
        correlationId = required(correlationId, "correlation id", 128);
    }

    public String pricingRequestId() {
        return bookingRef + ":" + quantities.amendmentSeq();
    }

    /**
     * Retained for the legacy pricing administration seam. New provider code
     * uses {@link #pricingRequestId()} explicitly.
     */
    public String requestId() {
        return pricingRequestId();
    }

    public ReferenceId customerId() {
        return new ReferenceId(partyId);
    }

    public ReferenceId tradeLaneId() {
        return new ReferenceId(tradeLane);
    }

    public ReferenceId commodityId() {
        return new ReferenceId(commodityCode);
    }

    public LocalDate effectiveDate() {
        return dates.effectiveDate();
    }

    public LocalDate requestedDepartureDate() {
        return dates.requestedDepartureDate();
    }

    public int quantityFor(ChargeBasis basis) {
        return switch (basis) {
            case CONTAINER, SHIPMENT, BL -> quantities.equipmentQuantity();
            case TEU -> quantities.teu();
        };
    }

    private static String required(String value, String label, int maxLength) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(label + " is required");
        }
        String normalized = value.trim();
        if (normalized.length() > maxLength) {
            throw new IllegalArgumentException(label + " must not exceed " + maxLength + " characters");
        }
        return normalized;
    }

    public record PricingDates(LocalDate effectiveDate, LocalDate requestedDepartureDate) {
        public PricingDates {
            Objects.requireNonNull(effectiveDate, "effective date is required");
            Objects.requireNonNull(requestedDepartureDate, "requested departure date is required");
            if (!effectiveDate.equals(requestedDepartureDate)) {
                throw new IllegalArgumentException("effective date must equal requested departure date");
            }
        }
    }

    public record PricingQuantities(int equipmentQuantity, int teu, int amendmentSeq) {
        public PricingQuantities {
            if (equipmentQuantity < 1 || teu < 1) {
                throw new IllegalArgumentException("pricing quantities must be positive");
            }
            if (amendmentSeq < 0) {
                throw new IllegalArgumentException("amendment sequence must be non-negative");
            }
        }
    }
}

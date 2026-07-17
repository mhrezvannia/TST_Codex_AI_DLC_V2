package com.linercore.platform.chargeagreement.domain.model;

import java.time.LocalDate;
import java.util.Map;

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
        bookingRef = required(bookingRef, "booking ref");
        tradeLane = required(tradeLane, "trade lane");
        pol = required(pol, "POL");
        pod = required(pod, "POD");
        equipmentType = required(equipmentType, "equipment type");
        partyId = required(partyId, "party id");
        commodityCode = required(commodityCode, "commodity code");
        if (dates == null) {
            throw new IllegalArgumentException("pricing dates are required");
        }
        if (quantities == null) {
            throw new IllegalArgumentException("pricing quantities are required");
        }
        correlationId = required(correlationId, "correlation id");
    }

    public String requestId() {
        return bookingRef + ":" + quantities.amendmentSeq();
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

    public int quantityFor(ChargeBasis basis) {
        return switch (basis) {
            case CONTAINER, SHIPMENT, BL -> quantities.equipmentQuantity();
            case TEU -> quantities.teu();
        };
    }

    private static String required(String value, String label) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(label + " is required");
        }
        return value.trim();
    }

    public record PricingDates(LocalDate effectiveDate, LocalDate requestedDepartureDate) {
        public PricingDates {
            if (effectiveDate == null || requestedDepartureDate == null) {
                throw new IllegalArgumentException("effective and requested departure dates are required");
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

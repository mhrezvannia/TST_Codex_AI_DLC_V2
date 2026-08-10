package com.linercore.platform.booking.domain.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record BookingPricingSnapshot(
        int schemaVersion,
        String pricingRequestId,
        String bookingRef,
        int amendmentSeq,
        int bookingRevision,
        String inputFingerprint,
        LocalDate requestedDepartureDate,
        String pricingBasis,
        String pricingRef,
        String agreementVersionId,
        List<PricingLineSnapshot> lines,
        List<String> applicableDndRuleTypes,
        BigDecimal total,
        String currency,
        Instant pricedAt,
        String correlationId,
        Instant createdAt) {
    public BookingPricingSnapshot {
        if (schemaVersion != 2) {
            throw new IllegalArgumentException("typed pricing snapshot schema version must be 2");
        }
        pricingRequestId = required(pricingRequestId, "pricing request id");
        bookingRef = required(bookingRef, "booking ref");
        if (amendmentSeq < 0 || bookingRevision < 0) {
            throw new IllegalArgumentException("pricing sequence and booking revision must be non-negative");
        }
        if (inputFingerprint == null || !inputFingerprint.matches("[0-9a-f]{64}")) {
            throw new IllegalArgumentException("pricing input fingerprint must be lowercase SHA-256");
        }
        if (requestedDepartureDate == null) {
            throw new IllegalArgumentException("requested departure date is required");
        }
        pricingBasis = required(pricingBasis, "pricing basis");
        if (!pricingBasis.equals("AGREEMENT") && !pricingBasis.equals("TARIFF")) {
            throw new IllegalArgumentException("pricing basis must be AGREEMENT or TARIFF");
        }
        pricingRef = required(pricingRef, "pricing ref");
        if (pricingBasis.equals("AGREEMENT")) {
            agreementVersionId = required(agreementVersionId, "agreement version id");
        } else if (agreementVersionId != null) {
            throw new IllegalArgumentException("tariff pricing cannot carry agreement version id");
        }
        lines = List.copyOf(lines == null ? List.of() : lines);
        if (lines.size() != 3
                || !"BASE".equals(lines.get(0).rateCategory())
                || !"SURCHARGE".equals(lines.get(1).rateCategory())
                || !"LOCAL".equals(lines.get(2).rateCategory())) {
            throw new IllegalArgumentException("typed pricing requires BASE, SURCHARGE, LOCAL line order");
        }
        applicableDndRuleTypes = List.copyOf(applicableDndRuleTypes == null ? List.of() : applicableDndRuleTypes);
        total = money(total, "total");
        currency = required(currency, "currency");
        if (!"USD".equals(currency) || lines.stream().anyMatch(line -> !"USD".equals(line.currency()))) {
            throw new IllegalArgumentException("typed pricing currency must be USD throughout");
        }
        BigDecimal receivedLineTotal = lines.stream()
                .map(PricingLineSnapshot::amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (receivedLineTotal.compareTo(total) != 0) {
            throw new IllegalArgumentException("received line amounts do not match received total");
        }
        if (pricedAt == null || createdAt == null) {
            throw new IllegalArgumentException("priced and created timestamps are required");
        }
        correlationId = required(correlationId, "correlation id");
    }

    public boolean isCurrentFor(int sequence, String fingerprint) {
        return amendmentSeq == sequence && inputFingerprint.equals(fingerprint);
    }

    private static BigDecimal money(BigDecimal value, String label) {
        if (value == null || value.signum() < 0 || value.scale() > 2) {
            throw new IllegalArgumentException(label + " must be a non-negative decimal with scale <= 2");
        }
        return value;
    }

    private static String required(String value, String label) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(label + " is required");
        }
        return value;
    }
}

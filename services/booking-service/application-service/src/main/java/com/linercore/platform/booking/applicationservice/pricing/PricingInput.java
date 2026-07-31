package com.linercore.platform.booking.applicationservice.pricing;

import com.linercore.platform.booking.domain.model.Booking;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.util.HexFormat;

public record PricingInput(
        String bookingRef,
        String tradeLane,
        String pol,
        String pod,
        String equipmentType,
        String partyId,
        String commodityCode,
        boolean reeferIndicator,
        boolean dgIndicator,
        LocalDate requestedDepartureDate,
        int equipmentQuantity,
        int teu,
        int amendmentSeq) {
    public PricingInput {
        bookingRef = required(bookingRef, "booking ref");
        tradeLane = required(tradeLane, "trade lane");
        pol = required(pol, "POL");
        pod = required(pod, "POD");
        equipmentType = required(equipmentType, "equipment type");
        partyId = required(partyId, "party id");
        commodityCode = required(commodityCode, "commodity code");
        if (requestedDepartureDate == null) {
            throw new IllegalArgumentException("requested departure date is required");
        }
        if (equipmentQuantity < 1 || teu < 1 || amendmentSeq < 0) {
            throw new IllegalArgumentException("pricing quantities and amendment sequence are invalid");
        }
    }

    public static PricingInput from(Booking booking, int amendmentSeq) {
        String date = booking.attributes().get("requestedDepartureDate");
        if (date == null || date.isBlank()) {
            throw new IllegalArgumentException("requested departure date is required");
        }
        int equipmentQuantity = booking.equipment().isEmpty() ? 1 : booking.equipment().get(0).quantity();
        return new PricingInput(
                booking.bookingNumber(),
                booking.attributes().getOrDefault("tradeLaneId", "NA-EU"),
                booking.originLocationId(),
                booking.destinationLocationId(),
                booking.equipmentType(),
                booking.customerId(),
                booking.attributes().getOrDefault(
                        "commodityCode", booking.attributes().getOrDefault("commodityId", "commodity-general")),
                booking.reefer(),
                booking.dangerousGoods(),
                LocalDate.parse(date),
                equipmentQuantity,
                booking.equipmentType().startsWith("4") ? equipmentQuantity * 2 : equipmentQuantity,
                amendmentSeq);
    }

    public byte[] canonicalBytes() {
        String json = "{"
                + "\"bookingRef\":\"" + escape(bookingRef) + "\","
                + "\"tradeLane\":\"" + escape(tradeLane) + "\","
                + "\"pol\":\"" + escape(pol) + "\","
                + "\"pod\":\"" + escape(pod) + "\","
                + "\"equipmentType\":\"" + escape(equipmentType) + "\","
                + "\"partyId\":\"" + escape(partyId) + "\","
                + "\"commodityCode\":\"" + escape(commodityCode) + "\","
                + "\"reeferIndicator\":" + reeferIndicator + ","
                + "\"dgIndicator\":" + dgIndicator + ","
                + "\"dates\":{\"effectiveDate\":\"" + requestedDepartureDate
                + "\",\"requestedDepartureDate\":\"" + requestedDepartureDate + "\"},"
                + "\"quantities\":{\"equipmentQuantity\":" + equipmentQuantity
                + ",\"teu\":" + teu + ",\"amendmentSeq\":" + amendmentSeq + "}"
                + "}";
        return json.getBytes(StandardCharsets.UTF_8);
    }

    public String fingerprint() {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(canonicalBytes()));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    public String providerKey() {
        return bookingRef + ":" + amendmentSeq;
    }

    public boolean sameCommercialInput(PricingInput other) {
        if (other == null) {
            return false;
        }
        return withAmendmentSeq(0).fingerprint().equals(other.withAmendmentSeq(0).fingerprint());
    }

    public PricingInput withAmendmentSeq(int sequence) {
        return new PricingInput(bookingRef, tradeLane, pol, pod, equipmentType, partyId, commodityCode,
                reeferIndicator, dgIndicator, requestedDepartureDate, equipmentQuantity, teu, sequence);
    }

    private static String escape(String value) {
        StringBuilder result = new StringBuilder(value.length());
        for (int index = 0; index < value.length(); index++) {
            char current = value.charAt(index);
            switch (current) {
                case '"' -> result.append("\\\"");
                case '\\' -> result.append("\\\\");
                case '\b' -> result.append("\\b");
                case '\f' -> result.append("\\f");
                case '\n' -> result.append("\\n");
                case '\r' -> result.append("\\r");
                case '\t' -> result.append("\\t");
                default -> {
                    if (current < 0x20) {
                        result.append(String.format("\\u%04x", (int) current));
                    } else {
                        result.append(current);
                    }
                }
            }
        }
        return result.toString();
    }

    private static String required(String value, String label) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(label + " is required");
        }
        return value;
    }
}

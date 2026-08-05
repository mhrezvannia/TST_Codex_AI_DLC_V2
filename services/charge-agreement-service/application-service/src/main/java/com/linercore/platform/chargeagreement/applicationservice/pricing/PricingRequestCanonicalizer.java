package com.linercore.platform.chargeagreement.applicationservice.pricing;

import com.linercore.platform.chargeagreement.domain.model.PricingRequest;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

public final class PricingRequestCanonicalizer {
    public String canonicalJson(PricingRequest request) {
        return "{\"bookingRef\":" + string(request.bookingRef())
                + ",\"tradeLane\":" + string(request.tradeLane())
                + ",\"pol\":" + string(request.pol())
                + ",\"pod\":" + string(request.pod())
                + ",\"equipmentType\":" + string(request.equipmentType())
                + ",\"partyId\":" + string(request.partyId())
                + ",\"commodityCode\":" + string(request.commodityCode())
                + ",\"reeferIndicator\":" + request.reeferIndicator()
                + ",\"dgIndicator\":" + request.dgIndicator()
                + ",\"dates\":{\"effectiveDate\":" + string(request.dates().effectiveDate().toString())
                + ",\"requestedDepartureDate\":" + string(request.dates().requestedDepartureDate().toString())
                + "},\"quantities\":{\"equipmentQuantity\":" + request.quantities().equipmentQuantity()
                + ",\"teu\":" + request.quantities().teu()
                + ",\"amendmentSeq\":" + request.quantities().amendmentSeq() + "}}";
    }

    public String hash(PricingRequest request) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(canonicalJson(request).getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    private static String string(String value) {
        StringBuilder escaped = new StringBuilder(value.length() + 2).append('"');
        value.codePoints().forEach(codePoint -> {
            switch (codePoint) {
                case '"' -> escaped.append("\\\"");
                case '\\' -> escaped.append("\\\\");
                case '\b' -> escaped.append("\\b");
                case '\f' -> escaped.append("\\f");
                case '\n' -> escaped.append("\\n");
                case '\r' -> escaped.append("\\r");
                case '\t' -> escaped.append("\\t");
                default -> {
                    if (codePoint < 0x20) {
                        escaped.append("\\u%04x".formatted(codePoint));
                    } else {
                        escaped.appendCodePoint(codePoint);
                    }
                }
            }
        });
        return escaped.append('"').toString();
    }
}

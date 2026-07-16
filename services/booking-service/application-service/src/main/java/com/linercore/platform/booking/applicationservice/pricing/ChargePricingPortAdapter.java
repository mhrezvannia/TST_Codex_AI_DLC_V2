package com.linercore.platform.booking.applicationservice.pricing;

import com.linercore.platform.booking.applicationservice.port.PricingOutcome;
import com.linercore.platform.booking.applicationservice.port.PricingPort;
import com.linercore.platform.booking.applicationservice.port.PricingRequestResult;
import com.linercore.platform.booking.domain.model.Booking;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Clock;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

public class ChargePricingPortAdapter implements PricingPort {
    private final ChargePricingClient client;
    private final Clock clock;

    public ChargePricingPortAdapter(ChargePricingClient client, Clock clock) {
        this.client = client;
        this.clock = clock;
    }

    @Override
    public PricingRequestResult requestPricing(Booking booking, String idempotencyKey, String correlationId) {
        String requestHash = requestHash(booking, idempotencyKey);
        String pricingRequestId = "pricing-" + requestHash.substring(0, 16);
        ChargePricingRequest request = ChargePricingRequest.from(booking, idempotencyKey, correlationId,
                pricingRequestId, requestHash, Instant.now(clock));
        try {
            ChargePricingResponse response = client.quote(request);
            if (response.manualPricingRequired() || "MANUAL".equals(response.pricingBasis())) {
                return PricingRequestResult.manual(pricingRequestId, response.reasonCode(),
                        "Charge requires manual pricing", response.correlationId());
            }
            return PricingRequestResult.priced(pricingRequestId, response.pricingRef(),
                    quotedAmounts(response, requestHash), response.correlationId());
        } catch (ChargePricingClientException ex) {
            return PricingRequestResult.failure(pricingRequestId, toOutcome(ex.failureType()), ex.reasonCode(),
                    ex.getMessage(), correlationId);
        }
    }

    private Map<String, String> quotedAmounts(ChargePricingResponse response, String requestHash) {
        LinkedHashMap<String, String> quoted = new LinkedHashMap<>();
        quoted.put("pricingBasis", response.pricingBasis());
        quoted.put("requestHash", requestHash);
        quoted.put("lineItemCount", Integer.toString(response.lineItems().size()));
        for (int i = 0; i < response.lineItems().size(); i++) {
            ChargePricingLineItem line = response.lineItems().get(i);
            String prefix = "line." + (i + 1) + ".";
            quoted.put(prefix + "chargeCode", line.chargeCode());
            quoted.put(prefix + "basis", nullToBlank(line.basis()));
            quoted.put(prefix + "quantity", Integer.toString(line.quantity()));
            quoted.put(prefix + "amount", line.amount());
            quoted.put(prefix + "currencyId", nullToBlank(line.currencyId()));
        }
        return Map.copyOf(quoted);
    }

    private PricingOutcome toOutcome(ChargePricingFailureType failureType) {
        return switch (failureType) {
            case TRANSIENT -> PricingOutcome.TRANSIENT_FAILURE;
            case DENIED -> PricingOutcome.DENIED;
            case VALIDATION -> PricingOutcome.VALIDATION_FAILED;
        };
    }

    private String requestHash(Booking booking, String idempotencyKey) {
        String material = String.join("|",
                booking.id().value(),
                Integer.toString(booking.revision()),
                booking.customerId(),
                booking.originLocationId(),
                booking.destinationLocationId(),
                booking.equipmentType(),
                idempotencyKey);
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(material.getBytes(StandardCharsets.UTF_8));
            StringBuilder builder = new StringBuilder(bytes.length * 2);
            for (byte value : bytes) {
                builder.append(String.format("%02x", value));
            }
            return builder.toString();
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is not available", ex);
        }
    }

    private String nullToBlank(String value) {
        return value == null ? "" : value;
    }
}

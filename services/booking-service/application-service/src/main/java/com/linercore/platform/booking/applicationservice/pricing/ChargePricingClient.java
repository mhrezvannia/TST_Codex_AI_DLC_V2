package com.linercore.platform.booking.applicationservice.pricing;

public interface ChargePricingClient {
    ChargePricingResponse quote(
            byte[] canonicalBody,
            String idempotencyKey,
            String correlationId) throws ChargePricingClientException;
}

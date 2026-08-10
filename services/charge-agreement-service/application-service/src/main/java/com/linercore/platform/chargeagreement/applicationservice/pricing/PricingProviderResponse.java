package com.linercore.platform.chargeagreement.applicationservice.pricing;

import java.util.Arrays;

public record PricingProviderResponse(
        int httpStatus,
        String contentType,
        byte[] body,
        boolean replayed) {
    public PricingProviderResponse {
        body = Arrays.copyOf(body, body.length);
    }

    @Override
    public byte[] body() {
        return Arrays.copyOf(body, body.length);
    }
}

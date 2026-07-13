package com.linercore.platform.booking.applicationservice.pricing;

public interface ChargePricingClient {
    ChargePricingResponse quote(ChargePricingRequest request) throws ChargePricingClientException;
}

package com.linercore.platform.booking.applicationservice.dnd;

public interface ChargeDndPricingClient {
    ChargeDndPricingResponse price(ChargeDndPricingRequest request) throws ChargeDndPricingClientException;
}

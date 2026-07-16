package com.linercore.platform.booking.applicationservice.dnd;

import com.linercore.platform.booking.applicationservice.port.DndPricingOutcome;
import com.linercore.platform.booking.applicationservice.port.DndPricingPort;
import com.linercore.platform.booking.applicationservice.port.DndPricingResult;
import com.linercore.platform.booking.domain.model.Booking;
import java.util.LinkedHashMap;
import java.util.Map;

public class ChargeDndPricingPortAdapter implements DndPricingPort {
    private final ChargeDndPricingClient client;

    public ChargeDndPricingPortAdapter(ChargeDndPricingClient client) {
        this.client = client;
    }

    @Override
    public DndPricingResult requestDndPricing(Booking booking, String idempotencyKey, String correlationId) {
        ChargeDndPricingRequest request = ChargeDndPricingRequest.from(booking, idempotencyKey, correlationId);
        try {
            ChargeDndPricingResponse response = client.price(request);
            return DndPricingResult.priced(response.dndPricingRef(), response.chargeableDays(), lineItems(response), response.correlationId());
        } catch (ChargeDndPricingClientException ex) {
            return DndPricingResult.failure(toOutcome(ex.failureType()), ex.reasonCode(), ex.getMessage(), correlationId);
        }
    }

    private DndPricingOutcome toOutcome(ChargeDndPricingFailureType failureType) {
        return switch (failureType) {
            case MANUAL -> DndPricingOutcome.MANUAL_REQUIRED;
            case TRANSIENT -> DndPricingOutcome.TRANSIENT_FAILURE;
            case DENIED -> DndPricingOutcome.DENIED;
            case VALIDATION -> DndPricingOutcome.VALIDATION_FAILED;
        };
    }

    private Map<String, String> lineItems(ChargeDndPricingResponse response) {
        LinkedHashMap<String, String> items = new LinkedHashMap<>();
        items.put("lineItemCount", Integer.toString(response.lineItems().size()));
        for (int i = 0; i < response.lineItems().size(); i++) {
            items.put("line." + (i + 1), response.lineItems().get(i));
        }
        return items;
    }
}

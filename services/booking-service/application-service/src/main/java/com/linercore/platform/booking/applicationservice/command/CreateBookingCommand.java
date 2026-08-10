package com.linercore.platform.booking.applicationservice.command;

import com.linercore.platform.booking.domain.model.EquipmentAssignment;
import com.linercore.platform.booking.domain.model.RoutingLeg;
import java.util.List;
import java.util.Map;

public record CreateBookingCommand(
        String idempotencyKey,
        String customerId,
        List<RoutingLeg> routing,
        List<EquipmentAssignment> equipment,
        String currency,
        String cargoMode,
        boolean reefer,
        boolean dangerousGoods,
        Map<String, String> attributes,
        String actorSubjectId,
        String correlationId) {

    public CreateBookingCommand {
        routing = List.copyOf(routing == null ? List.of() : routing);
        equipment = List.copyOf(equipment == null ? List.of() : equipment);
        attributes = Map.copyOf(attributes == null ? Map.of() : attributes);
    }
}

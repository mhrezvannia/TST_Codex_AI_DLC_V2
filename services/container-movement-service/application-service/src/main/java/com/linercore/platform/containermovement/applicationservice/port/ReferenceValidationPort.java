package com.linercore.platform.containermovement.applicationservice.port;

import java.util.List;

public interface ReferenceValidationPort {
    List<String> inactiveLocationIds(List<String> locationIds, String correlationId);
}

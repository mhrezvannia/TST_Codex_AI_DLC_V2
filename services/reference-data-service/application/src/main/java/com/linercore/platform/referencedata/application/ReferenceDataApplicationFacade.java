package com.linercore.platform.referencedata.application;

import com.linercore.platform.referencedata.applicationservice.ReferenceDataApplicationService;
import com.linercore.platform.referencedata.domain.HealthDocument;

public class ReferenceDataApplicationFacade {
    private final ReferenceDataApplicationService service;

    public ReferenceDataApplicationFacade(ReferenceDataApplicationService service) {
        this.service = service;
    }

    public HealthDocument health() {
        return service.health();
    }
}

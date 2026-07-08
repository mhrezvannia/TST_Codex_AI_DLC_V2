package com.linercore.platform.identity.application;

import com.linercore.platform.identity.applicationservice.IdentityApplicationService;
import com.linercore.platform.identity.domain.HealthDocument;

public class IdentityApplicationFacade {
    private final IdentityApplicationService service;

    public IdentityApplicationFacade(IdentityApplicationService service) {
        this.service = service;
    }

    public HealthDocument health() {
        return service.health();
    }
}

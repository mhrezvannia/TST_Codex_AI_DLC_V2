package com.linercore.platform.chargeagreement.container.api;

import java.time.Instant;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/charge-agreements")
public class ChargeAgreementModuleController {
    @GetMapping("/module-info")
    public ModuleInfo moduleInfo() {
        return new ModuleInfo(
                "charge-agreement-service",
                "local-host-runtime",
                "0.1.0-SNAPSHOT",
                Instant.now(),
                List.of(
                        new CapabilityFlag("backend-health", true, "Spring Boot service shell is running"),
                        new CapabilityFlag("agreement-lifecycle", false, "Domain lifecycle arrives in U02/U03"),
                        new CapabilityFlag("persistence-api", false, "Persistence and REST CRUD arrive in U04/U05"),
                        new CapabilityFlag("ui-write-workflows", false, "Functional UI writes arrive in U06")
                ));
    }

    public record ModuleInfo(
            String serviceName,
            String mode,
            String version,
            Instant checkedAt,
            List<CapabilityFlag> capabilities) {
    }

    public record CapabilityFlag(String key, boolean enabled, String description) {
    }
}

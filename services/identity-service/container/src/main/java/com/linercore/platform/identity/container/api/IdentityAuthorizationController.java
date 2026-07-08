package com.linercore.platform.identity.container.api;

import com.linercore.platform.identity.applicationservice.IdentityApplicationService;
import com.linercore.platform.identity.applicationservice.command.AssignRoleCommand;
import com.linercore.platform.identity.domain.model.AuthorizationDecision;
import com.linercore.platform.identity.domain.model.AuthorizationRequest;
import com.linercore.platform.identity.domain.model.EffectivePermissionsView;
import com.linercore.platform.identity.domain.model.Role;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/identity")
public class IdentityAuthorizationController {
    private final IdentityApplicationService service;

    public IdentityAuthorizationController(IdentityApplicationService service) {
        this.service = service;
    }

    @PostMapping("/authorize")
    public ResponseEntity<AuthorizationDecision> authorize(
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId,
            @RequestBody AuthorizationApiRequest request) {
        AuthorizationDecision decision = service.authorize(new AuthorizationRequest(
                request.requestId(),
                correlationId == null ? request.correlationId() : correlationId,
                request.tokenReference(),
                request.resource(),
                request.action(),
                request.scope(),
                Map.of("caller", request.caller())));
        return ResponseEntity.ok(decision);
    }

    @PostMapping("/roles/assign")
    public ResponseEntity<AuthorizationDecision> assignRole(@RequestBody AssignRoleCommand command) {
        return ResponseEntity.ok(service.assignRole(command));
    }

    @PostMapping("/effective-permissions")
    public ResponseEntity<EffectivePermissionsView> effectivePermissions(@RequestBody TokenReferenceRequest request) {
        return ResponseEntity.ok(service.effectivePermissions(request.tokenReference()));
    }

    @GetMapping("/roles")
    public ResponseEntity<List<Role>> roles() {
        return ResponseEntity.ok(service.roleCatalog());
    }

    public record AuthorizationApiRequest(
            String requestId,
            String correlationId,
            String tokenReference,
            String resource,
            String action,
            String scope,
            String caller) {
    }

    public record TokenReferenceRequest(String tokenReference) {
    }
}

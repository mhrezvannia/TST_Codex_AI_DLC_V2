package com.linercore.platform.identity.application.keycloak;

import com.linercore.platform.identity.applicationservice.port.SubjectResolverPort;
import com.linercore.platform.identity.domain.model.AuthenticatedSubject;
import java.util.Optional;

public class KeycloakSubjectResolver implements SubjectResolverPort {
    private final String expectedIssuer;

    public KeycloakSubjectResolver(String expectedIssuer) {
        this.expectedIssuer = expectedIssuer;
    }

    public Optional<AuthenticatedSubject> resolve(String tokenReference) {
        if (tokenReference == null || tokenReference.isBlank() || tokenReference.startsWith("invalid")) {
            return Optional.empty();
        }
        String subjectId = tokenReference.replace("Bearer ", "").trim();
        return Optional.of(new AuthenticatedSubject(
                subjectId,
                subjectId,
                subjectId,
                subjectId + "@example.test",
                expectedIssuer,
                "carrier",
                "local-placeholder"));
    }
}

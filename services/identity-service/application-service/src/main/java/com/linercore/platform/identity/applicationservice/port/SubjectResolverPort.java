package com.linercore.platform.identity.applicationservice.port;

import com.linercore.platform.identity.domain.model.AuthenticatedSubject;
import java.util.Optional;

public interface SubjectResolverPort {
    Optional<AuthenticatedSubject> resolve(String tokenReference);
}

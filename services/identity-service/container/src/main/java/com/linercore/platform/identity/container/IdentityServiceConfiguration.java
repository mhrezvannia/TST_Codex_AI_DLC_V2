package com.linercore.platform.identity.container;

import com.linercore.platform.identity.application.keycloak.KeycloakSubjectResolver;
import com.linercore.platform.identity.applicationservice.IdentityApplicationService;
import com.linercore.platform.identity.applicationservice.port.AuthorizationAuditRepository;
import com.linercore.platform.identity.applicationservice.port.IdGenerator;
import com.linercore.platform.identity.applicationservice.port.RoleAssignmentRepository;
import com.linercore.platform.identity.applicationservice.port.SubjectResolverPort;
import com.linercore.platform.identity.dataaccess.inmemory.InMemoryAuthorizationAuditRepository;
import com.linercore.platform.identity.dataaccess.inmemory.InMemoryRoleAssignmentRepository;
import com.linercore.platform.identity.dataaccess.inmemory.UuidIdGenerator;
import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class IdentityServiceConfiguration {
    @Bean
    SubjectResolverPort subjectResolverPort() {
        return new KeycloakSubjectResolver("local-keycloak");
    }

    @Bean
    RoleAssignmentRepository roleAssignmentRepository() {
        return new InMemoryRoleAssignmentRepository();
    }

    @Bean
    AuthorizationAuditRepository authorizationAuditRepository() {
        return new InMemoryAuthorizationAuditRepository();
    }

    @Bean
    IdGenerator idGenerator() {
        return new UuidIdGenerator();
    }

    @Bean
    IdentityApplicationService identityApplicationService(
            SubjectResolverPort subjectResolver,
            RoleAssignmentRepository roleAssignmentRepository,
            AuthorizationAuditRepository auditRepository,
            IdGenerator idGenerator) {
        return new IdentityApplicationService(subjectResolver, roleAssignmentRepository, auditRepository, idGenerator, Clock.systemUTC());
    }
}

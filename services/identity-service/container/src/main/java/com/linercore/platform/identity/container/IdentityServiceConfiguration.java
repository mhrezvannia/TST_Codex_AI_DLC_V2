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
import java.time.Instant;
import com.linercore.platform.identity.domain.model.AssignmentStatus;
import com.linercore.platform.identity.domain.model.RoleAssignment;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;

@Configuration
public class IdentityServiceConfiguration {
    @Bean
    SubjectResolverPort subjectResolverPort() {
        return new KeycloakSubjectResolver("local-keycloak");
    }

    @Bean
    RoleAssignmentRepository roleAssignmentRepository(Environment environment) {
        InMemoryRoleAssignmentRepository repository = new InMemoryRoleAssignmentRepository();
        if (environment.acceptsProfiles(Profiles.of("local"))) {
            repository.save(new RoleAssignment(
                    "local-bootstrap-security-admin",
                    "local.reference.admin",
                    "role-security-admin",
                    AssignmentStatus.ACTIVE,
                    "local-bootstrap",
                    Instant.EPOCH,
                    null,
                    null,
                    "local seed-loader bootstrap",
                    1));
            repository.save(new RoleAssignment(
                    "local-bootstrap-superuser",
                    "local.superuser",
                    "role-superuser",
                    AssignmentStatus.ACTIVE,
                    "local-bootstrap",
                    Instant.EPOCH,
                    null,
                    null,
                    "local superuser bootstrap",
                    1));
        }
        return repository;
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

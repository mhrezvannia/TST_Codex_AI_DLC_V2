package com.linercore.platform.identity.applicationservice.port;

import com.linercore.platform.identity.domain.model.RoleAssignment;
import java.util.List;
import java.util.Optional;

public interface RoleAssignmentRepository {
    List<RoleAssignment> findActiveBySubjectId(String subjectId);

    Optional<RoleAssignment> findBySubjectAndRole(String subjectId, String roleId);

    RoleAssignment save(RoleAssignment assignment);
}

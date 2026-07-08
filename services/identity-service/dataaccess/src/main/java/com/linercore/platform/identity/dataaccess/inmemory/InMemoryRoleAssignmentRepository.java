package com.linercore.platform.identity.dataaccess.inmemory;

import com.linercore.platform.identity.applicationservice.port.RoleAssignmentRepository;
import com.linercore.platform.identity.domain.model.RoleAssignment;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;

public class InMemoryRoleAssignmentRepository implements RoleAssignmentRepository {
    private final CopyOnWriteArrayList<RoleAssignment> assignments = new CopyOnWriteArrayList<>();

    public List<RoleAssignment> findActiveBySubjectId(String subjectId) {
        return assignments.stream()
                .filter(RoleAssignment::active)
                .filter(assignment -> assignment.subjectId().equals(subjectId))
                .toList();
    }

    public Optional<RoleAssignment> findBySubjectAndRole(String subjectId, String roleId) {
        return assignments.stream()
                .filter(assignment -> assignment.subjectId().equals(subjectId))
                .filter(assignment -> assignment.roleId().equals(roleId))
                .findFirst();
    }

    public RoleAssignment save(RoleAssignment assignment) {
        findBySubjectAndRole(assignment.subjectId(), assignment.roleId()).ifPresent(assignments::remove);
        assignments.add(assignment);
        return assignment;
    }

    public List<RoleAssignment> all() {
        return new ArrayList<>(assignments);
    }
}

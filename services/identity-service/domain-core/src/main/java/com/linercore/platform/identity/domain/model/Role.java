package com.linercore.platform.identity.domain.model;

public record Role(String roleId, RoleCode code, String name, String description, boolean assignable, boolean active) {
}

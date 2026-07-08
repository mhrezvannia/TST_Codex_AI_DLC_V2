package com.linercore.platform.identity.domain.model;

public record Permission(String permissionId, String resource, PermissionAction action, String scope, String classification) {
    public boolean matches(String requestedResource, String requestedAction, String requestedScope) {
        boolean resourceMatches = resource.equals(requestedResource);
        boolean actionMatches = action.value().equals(requestedAction);
        boolean scopeMatches = scope == null || scope.isBlank() || scope.equals(requestedScope);
        return resourceMatches && actionMatches && scopeMatches;
    }
}

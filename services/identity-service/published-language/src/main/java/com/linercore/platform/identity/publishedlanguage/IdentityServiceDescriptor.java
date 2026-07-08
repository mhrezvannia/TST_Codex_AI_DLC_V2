package com.linercore.platform.identity.publishedlanguage;

public record IdentityServiceDescriptor(String serviceName, String apiPath) {
    public static IdentityServiceDescriptor current() {
        return new IdentityServiceDescriptor("identity-service", "/identity");
    }
}

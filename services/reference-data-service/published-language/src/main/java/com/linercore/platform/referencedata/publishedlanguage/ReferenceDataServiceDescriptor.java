package com.linercore.platform.referencedata.publishedlanguage;

public record ReferenceDataServiceDescriptor(String serviceName, String apiPath) {
    public static ReferenceDataServiceDescriptor current() {
        return new ReferenceDataServiceDescriptor("reference-data-service", "/reference-data");
    }
}

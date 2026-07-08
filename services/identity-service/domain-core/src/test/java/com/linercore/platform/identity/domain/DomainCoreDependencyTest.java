package com.linercore.platform.identity.domain;

import static org.junit.jupiter.api.Assertions.assertFalse;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;

class DomainCoreDependencyTest {
    private static final String[] FORBIDDEN = {
            "org.springframework",
            "jakarta.persistence",
            "org.apache.kafka",
            "com.fasterxml.jackson",
            "lombok",
            "dataaccess",
            "messaging"
    };

    @Test
    void domainCoreDoesNotImportFrameworkOrAdapterNamespaces() throws IOException {
        Path sourceRoot = Path.of("src/main/java");
        String source = Files.walk(sourceRoot)
                .filter(path -> path.toString().endsWith(".java"))
                .map(path -> {
                    try {
                        return Files.readString(path);
                    } catch (IOException ex) {
                        throw new IllegalStateException(ex);
                    }
                })
                .reduce("", String::concat);

        for (String forbidden : FORBIDDEN) {
            assertFalse(source.contains(forbidden), "Forbidden domain-core dependency: " + forbidden);
        }
    }
}

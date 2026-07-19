package com.linercore.platform.chargeagreement.dataaccess;

import static org.junit.jupiter.api.Assertions.assertFalse;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;

class ChargeAgreementSchemaTest {
    @Test
    void schemaCreationIsRestartSafe() throws IOException {
        try (var stream = getClass().getResourceAsStream("/db/charge-agreement-schema.sql")) {
            if (stream == null) {
                throw new IOException("charge agreement schema not found");
            }
            String schema = new String(stream.readAllBytes(), StandardCharsets.UTF_8);
            assertFalse(schema.matches("(?s).*CREATE TABLE (?!IF NOT EXISTS).*"));
            assertFalse(schema.matches("(?s).*CREATE INDEX (?!IF NOT EXISTS).*"));
        }
    }
}

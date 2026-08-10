package com.linercore.platform.chargeagreement.container.api;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.linercore.platform.chargeagreement.domain.model.ChargeBasis;
import com.linercore.platform.chargeagreement.domain.model.ChargeCategory;
import com.linercore.platform.chargeagreement.domain.model.MoneyAmount;
import com.linercore.platform.chargeagreement.domain.model.PricingLine;
import com.linercore.platform.chargeagreement.domain.model.PricingResult;
import com.linercore.platform.chargeagreement.domain.model.ReferenceId;
import com.linercore.platform.chargeagreement.domain.rate.RateBasis;
import com.linercore.platform.chargeagreement.domain.rate.RateCategory;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.yaml.snakeyaml.Yaml;

class JacksonPricingTerminalRendererContractTest {
    private static final ObjectMapper MAPPER = JsonMapper.builder()
            .findAndAddModules()
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
            .build();
    private static final Set<String> RESULT_REQUIRED =
            Set.of("bookingRef", "pricingBasis", "pricingRef", "charges", "applicableDndRuleTypes");
    private static final Set<String> LINE_REQUIRED =
            Set.of("chargeCode", "category", "amount", "currency");

    @ParameterizedTest
    @ValueSource(strings = {"AGREEMENT", "TARIFF"})
    void realRendererMatchesOpenApiSchemaAndTerminalMatrix(String basis) throws Exception {
        JsonNode rendered = MAPPER.readTree(
                new JacksonPricingTerminalRenderer(MAPPER).renderSuccess(result(basis)));

        validateObject(rendered, schema("PricingResult"), RESULT_REQUIRED);
        for (JsonNode line : rendered.path("charges")) {
            validateObject(line, schema("ChargeLine"), LINE_REQUIRED);
        }
        JsonNode fixture = scenario(basis.equals("AGREEMENT") ? "agreement-success" : "tariff-success");
        assertThat(rendered).isEqualTo(fixture.path("response"));
        assertThat(rendered.has("agreementVersionId")).isEqualTo(basis.equals("AGREEMENT"));
    }

    private static void validateObject(
            JsonNode value,
            Map<String, Object> schema,
            Set<String> required) {
        assertThat(value.isObject()).isTrue();
        Map<String, Object> properties = map(schema.get("properties"));
        List<String> names = new ArrayList<>();
        value.fieldNames().forEachRemaining(names::add);
        assertThat(names)
                .allMatch(properties::containsKey);
        assertThat(names)
                .containsAll(required);
        value.fields().forEachRemaining(property -> {
            Map<String, Object> propertySchema = map(properties.get(property.getKey()));
            Object type = propertySchema.get("type");
            if ("string".equals(type)) assertThat(property.getValue().isTextual()).isTrue();
            if ("number".equals(type)) assertThat(property.getValue().isNumber()).isTrue();
            if ("integer".equals(type)) assertThat(property.getValue().isIntegralNumber()).isTrue();
            if ("array".equals(type)) assertThat(property.getValue().isArray()).isTrue();
            if (propertySchema.containsKey("enum")) {
                assertThat(((List<?>) propertySchema.get("enum")).stream().map(Object::toString).toList())
                        .contains(property.getValue().asText());
            }
        });
    }

    private static PricingResult result(String basis) {
        boolean agreement = "AGREEMENT".equals(basis);
        int quantity = agreement ? 3 : 1;
        String suffix = agreement ? "0001" : "0002";
        List<PricingLine> lines = List.of(
                line("OFR", ChargeCategory.FREIGHT, RateCategory.BASE,
                        agreement ? "100.01" : "100.00", quantity, "rate-version-base-" + suffix),
                line("BAF", ChargeCategory.SURCHARGE, RateCategory.SURCHARGE,
                        agreement ? "20.01" : "20.00", quantity, "rate-version-surcharge-" + suffix),
                line("THC", ChargeCategory.LOCAL, RateCategory.LOCAL,
                        agreement ? "10.01" : "10.00", quantity, "rate-version-local-" + suffix));
        String booking = agreement ? "booking-agreement-0001" : "booking-tariff-0001";
        String pricingRef = agreement
                ? "agreement-version-0001"
                : "TARIFF-c676b4e4472631fbdd069424";
        return PricingResult.w2Priced(
                booking + ":" + (agreement ? 2 : 1),
                booking,
                basis,
                pricingRef,
                agreement ? pricingRef : null,
                LocalDate.parse("2026-08-01"),
                lines,
                agreement ? "corr-agreement-0001" : "corr-tariff-0001",
                Instant.parse(agreement ? "2026-08-01T09:30:00Z" : "2026-08-01T09:31:00Z"));
    }

    private static PricingLine line(
            String code,
            ChargeCategory category,
            RateCategory rateCategory,
            String unitRate,
            int quantity,
            String sourceVersion) {
        BigDecimal rate = new BigDecimal(unitRate);
        MoneyAmount unit = new MoneyAmount(rate, new ReferenceId("currency-usd"));
        MoneyAmount amount =
                new MoneyAmount(rate.multiply(BigDecimal.valueOf(quantity)), new ReferenceId("currency-usd"));
        return new PricingLine(
                "line-" + code,
                new ReferenceId(code),
                category,
                ChargeBasis.CONTAINER,
                quantity,
                unit,
                amount,
                rateCategory,
                RateBasis.PER_CONTAINER,
                sourceVersion);
    }

    private static JsonNode scenario(String id) throws Exception {
        for (JsonNode scenario : MAPPER.readTree(file(
                "contracts/examples/pricing-u04-terminal-matrix.json").toFile()).path("scenarios")) {
            if (id.equals(scenario.path("scenarioId").asText())) return scenario;
        }
        throw new IllegalArgumentException("terminal scenario was not found: " + id);
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> schema(String name) throws Exception {
        Map<String, Object> root = new Yaml().load(Files.readString(file("contracts/openapi/pricing.v1.yaml")));
        return map(map(map(root.get("components")).get("schemas")).get(name));
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> map(Object value) {
        return (Map<String, Object>) value;
    }

    private static Path file(String relative) {
        Path current = Path.of("").toAbsolutePath();
        while (current != null) {
            Path candidate = current.resolve(relative);
            if (Files.isRegularFile(candidate)) return candidate;
            current = current.getParent();
        }
        throw new IllegalStateException(relative + " was not found");
    }
}

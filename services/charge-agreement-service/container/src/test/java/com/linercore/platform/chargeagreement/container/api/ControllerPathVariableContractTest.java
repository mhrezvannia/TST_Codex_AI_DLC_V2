package com.linercore.platform.chargeagreement.container.api;

import static org.junit.jupiter.api.Assertions.assertFalse;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.web.bind.annotation.PathVariable;

class ControllerPathVariableContractTest {
    @Test
    void pathVariablesDeclareNamesWithoutCompilerParameterMetadata() {
        for (Class<?> controller : List.of(RateApiController.class, ManualPricingCaseApiController.class)) {
            for (Method method : controller.getDeclaredMethods()) {
                for (Parameter parameter : method.getParameters()) {
                    PathVariable pathVariable = parameter.getAnnotation(PathVariable.class);
                    if (pathVariable != null) {
                        assertFalse(pathVariable.value().isBlank() && pathVariable.name().isBlank(),
                                () -> controller.getSimpleName() + "." + method.getName()
                                        + " has an unnamed @PathVariable");
                    }
                }
            }
        }
    }
}

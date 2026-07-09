package com.linercore.platform.containermovement.domain.model;

import java.util.List;

public record MovementValidationResult(List<String> errors) {
    public MovementValidationResult {
        errors = List.copyOf(errors == null ? List.of() : errors);
    }

    public static MovementValidationResult ok() {
        return new MovementValidationResult(List.of());
    }

    public static MovementValidationResult invalid(List<String> errors) {
        return new MovementValidationResult(errors);
    }

    public boolean valid() {
        return errors.isEmpty();
    }
}

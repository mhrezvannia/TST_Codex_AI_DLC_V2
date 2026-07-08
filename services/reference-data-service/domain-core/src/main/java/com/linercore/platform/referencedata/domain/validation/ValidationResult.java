package com.linercore.platform.referencedata.domain.validation;

import java.util.List;

public record ValidationResult(List<String> errors) {
    public static ValidationResult ok() {
        return new ValidationResult(List.of());
    }

    public static ValidationResult invalid(List<String> errors) {
        return new ValidationResult(errors);
    }

    public boolean valid() {
        return errors.isEmpty();
    }
}

package com.linercore.platform.chargeagreement.applicationservice.pricing;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.linercore.platform.chargeagreement.applicationservice.port.ManualPricingCaseRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class ManualPricingCaseQueryServiceTest {

    @Test
    void authorizationPrecedesListAndDetailAndNotFoundDisclosesNoRecordData() {
        ManualPricingCaseRepository repository = mock(ManualPricingCaseRepository.class);
        List<PricingTelemetry.Signal> signals = new ArrayList<>();
        ManualPricingCaseQueryService denied = new ManualPricingCaseQueryService(
                (subject, resource, action, correlation) -> false,
                repository,
                signals::add);
        var query = new ManualPricingCaseRepository.ManualCaseQuery(
                null, null, null, null, 0, 20);

        assertThrows(SecurityException.class, () -> denied.list(
                "reader", "corr-denied", query));
        assertThrows(SecurityException.class, () -> denied.detail(
                "reader", "corr-denied", "case-secret"));
        verify(repository, never()).listOpen(any());
        verify(repository, never()).findOpenById(any());

        when(repository.findOpenById("missing")).thenReturn(Optional.empty());
        ManualPricingCaseQueryService allowed = new ManualPricingCaseQueryService(
                (subject, resource, action, correlation) -> true,
                repository,
                signals::add);
        var notFound = assertThrows(
                ManualPricingCaseQueryService.ManualPricingCaseNotFoundException.class,
                () -> allowed.detail("analyst", "corr-safe", "missing"));
        assertEquals("manual pricing case was not found", notFound.getMessage());
        verify(repository).findOpenById("missing");
        assertEquals(List.of(
                        PricingTelemetry.Outcome.DENIED,
                        PricingTelemetry.Outcome.DENIED,
                        PricingTelemetry.Outcome.NOT_FOUND),
                signals.stream().map(PricingTelemetry.Signal::outcome).toList());
        assertEquals(false, signals.toString().contains("case-secret"));
        assertEquals(false, signals.toString().contains("corr-denied"));
    }
}

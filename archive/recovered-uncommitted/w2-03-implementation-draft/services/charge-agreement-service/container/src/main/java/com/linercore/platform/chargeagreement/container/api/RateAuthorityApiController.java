package com.linercore.platform.chargeagreement.container.api;

import com.linercore.platform.chargeagreement.applicationservice.RateAuthorityApplicationService;
import com.linercore.platform.chargeagreement.applicationservice.command.CreateRateCommand;
import com.linercore.platform.chargeagreement.applicationservice.command.VersionRateCommand;
import com.linercore.platform.chargeagreement.domain.model.AgreementId;
import com.linercore.platform.chargeagreement.domain.model.AgreementRateBinding;
import com.linercore.platform.chargeagreement.domain.model.ChargeCategory;
import com.linercore.platform.chargeagreement.domain.model.RateStatus;
import com.linercore.platform.chargeagreement.domain.model.RateVersion;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RateAuthorityApiController {
    private final RateAuthorityApplicationService rates;

    public RateAuthorityApiController(RateAuthorityApplicationService rates) {
        this.rates = rates;
    }

    @GetMapping("/api/charge-rates")
    public List<RateResponse> search(
            @RequestParam(name = "category", required = false) ChargeCategory category,
            @RequestParam(name = "actor", defaultValue = "local-user") String actor,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        return rates.search(category, actor, correlation(correlationId)).stream().map(this::response).toList();
    }

    @PostMapping("/api/charge-rates")
    public ResponseEntity<RateResponse> create(
            @RequestBody RateRequest request,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        RateVersion created = rates.create(new CreateRateCommand(
                request.category(), request.chargeCodeId(), request.tradeLaneId(), request.equipmentTypeId(),
                request.locationId(), request.amount(), request.currencyId(), request.validFrom(), request.validTo(),
                actor(request.actorSubjectId()), correlation(correlationId)));
        return ResponseEntity.status(HttpStatus.CREATED).body(response(created));
    }

    @GetMapping("/api/charge-rates/{id}")
    public RateResponse detail(
            @PathVariable("id") String id,
            @RequestParam(name = "actor", defaultValue = "local-user") String actor,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        return response(rates.detail(id, actor, correlation(correlationId)));
    }

    @PostMapping("/api/charge-rates/{id}/versions")
    public ResponseEntity<RateResponse> version(
            @PathVariable("id") String id,
            @RequestBody VersionRequest request,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        RateVersion created = rates.createVersion(id, new VersionRateCommand(
                request.expectedVersion(), request.amount(), request.currencyId(), request.validFrom(), request.validTo(),
                actor(request.actorSubjectId()), correlation(correlationId)));
        return ResponseEntity.status(HttpStatus.CREATED).body(response(created));
    }

    @PostMapping("/api/charge-rates/{id}/approve")
    public RateResponse approve(
            @PathVariable("id") String id,
            @RequestParam("version") int version,
            @RequestBody ActorRequest request,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        return response(rates.approve(id, version, actor(request.actorSubjectId()), correlation(correlationId)));
    }

    @PostMapping("/api/charge-agreements/{agreementId}/rate-bindings")
    public BindingResponse bind(
            @PathVariable("agreementId") String agreementId,
            @RequestParam("version") long version,
            @RequestBody BindingRequest request,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        AgreementRateBinding binding = rates.bindAgreement(new AgreementId(agreementId), version,
                request.rateVersionIds(), actor(request.actorSubjectId()), correlation(correlationId));
        return new BindingResponse(binding.agreementId().value(), binding.agreementVersion(), binding.rateVersionIds());
    }

    private RateResponse response(RateVersion rate) {
        return new RateResponse(rate.id(), rate.definitionId(), rate.version(), rate.category(),
                rate.chargeCodeId().value(), rate.tradeLaneId().value(), rate.equipmentTypeId().value(),
                rate.locationId() == null ? null : rate.locationId().value(), rate.basis().name(), rate.amount().amount(),
                rate.amount().currencyId().value().toUpperCase(), rate.validity().from(), rate.validity().to(),
                rate.status(), rate.previousVersionId());
    }

    private static String actor(String value) {
        return value == null || value.isBlank() ? "local-user" : value;
    }

    private static String correlation(String value) {
        return value == null || value.isBlank() ? "local-correlation" : value;
    }

    public record RateRequest(ChargeCategory category, String chargeCodeId, String tradeLaneId,
            String equipmentTypeId, String locationId, BigDecimal amount, String currencyId, LocalDate validFrom,
            LocalDate validTo, String actorSubjectId) {
    }

    public record VersionRequest(int expectedVersion, BigDecimal amount, String currencyId, LocalDate validFrom,
            LocalDate validTo, String actorSubjectId) {
    }

    public record ActorRequest(String actorSubjectId) {
    }

    public record BindingRequest(List<String> rateVersionIds, String actorSubjectId) {
    }

    public record BindingResponse(String agreementId, long agreementVersion, List<String> rateVersionIds) {
    }

    public record RateResponse(String id, String definitionId, int version, ChargeCategory category,
            String chargeCodeId, String tradeLaneId, String equipmentTypeId, String locationId, String basis,
            BigDecimal amount, String currencyId, LocalDate validFrom, LocalDate validTo, RateStatus status,
            String previousVersionId) {
    }
}

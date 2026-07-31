package com.linercore.platform.chargeagreement.container.api;

import com.linercore.platform.chargeagreement.applicationservice.ChargeAgreementApplicationService;
import com.linercore.platform.chargeagreement.applicationservice.command.ChargeTermCommand;
import com.linercore.platform.chargeagreement.applicationservice.command.CreateAgreementCommand;
import com.linercore.platform.chargeagreement.applicationservice.command.UpdateAgreementCommand;
import com.linercore.platform.chargeagreement.applicationservice.query.ActiveAgreementLookupQuery;
import com.linercore.platform.chargeagreement.applicationservice.query.ActiveAgreementLookupResult;
import com.linercore.platform.chargeagreement.applicationservice.query.AgreementSearchQuery;
import com.linercore.platform.chargeagreement.domain.model.ActivityEntry;
import com.linercore.platform.chargeagreement.domain.model.AgreementId;
import com.linercore.platform.chargeagreement.domain.model.AgreementStatus;
import com.linercore.platform.chargeagreement.domain.model.ChargeBasis;
import com.linercore.platform.chargeagreement.domain.model.ChargeTerm;
import com.linercore.platform.chargeagreement.domain.model.CustomerAgreement;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/charge-agreements")
public class ChargeAgreementApiController {
    private final ChargeAgreementApplicationService service;

    public ChargeAgreementApiController(ChargeAgreementApplicationService service) {
        this.service = service;
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public AgreementSearchResponse search(
            @RequestParam(name = "customerId", required = false) String customerId,
            @RequestParam(name = "tradeLaneId", required = false) String tradeLaneId,
            @RequestParam(name = "commodityId", required = false) String commodityId,
            @RequestParam(name = "status", required = false) AgreementStatus status,
            @RequestParam(name = "validOn", required = false) LocalDate validOn,
            @RequestParam(name = "includeInactive", defaultValue = "false") boolean includeInactive,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "25") int size,
            @RequestParam(name = "actor", defaultValue = "local-user") String actor,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        AgreementSearchQuery query = new AgreementSearchQuery(customerId, tradeLaneId, commodityId, status, validOn,
                includeInactive, page, size, actor, correlation(correlationId));
        List<AgreementSummaryResponse> items = service.search(query).stream()
                .map(this::toSummary)
                .toList();
        return new AgreementSearchResponse(items, page, Math.max(1, Math.min(size, 100)), items.size());
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<AgreementResponse> create(
            @RequestBody AgreementRequest request,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        CustomerAgreement agreement = service.create(new CreateAgreementCommand(request.agreementNumber(), request.customerId(),
                request.tradeLaneId(), request.commodityId(), request.validFrom(), request.validTo(),
                actor(request.actorSubjectId()), request.reason(), correlation(correlationId)));
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(agreement));
    }

    @GetMapping(path = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public AgreementResponse detail(
            @PathVariable("id") String id,
            @RequestParam(name = "actor", defaultValue = "local-user") String actor,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        return toResponse(service.detail(new AgreementId(id), actor, correlation(correlationId)));
    }

    @PutMapping(
            path = "/{id}",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public AgreementResponse update(
            @PathVariable("id") String id,
            @RequestParam(name = "version") long version,
            @RequestBody AgreementRequest request,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        CustomerAgreement agreement = service.update(new AgreementId(id), version,
                new UpdateAgreementCommand(request.agreementNumber(), request.customerId(), request.tradeLaneId(),
                        request.commodityId(), request.validFrom(), request.validTo(), toCommands(request.terms()),
                        actor(request.actorSubjectId()), request.reason(), correlation(correlationId)));
        return toResponse(agreement);
    }

    @PostMapping(
            path = "/{id}/approve",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public AgreementResponse approve(
            @PathVariable("id") String id,
            @RequestParam(name = "version") long version,
            @RequestBody StatusActionRequest request,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        return toResponse(service.approve(new AgreementId(id), version, actor(request.actorSubjectId()),
                request.reason(), correlation(correlationId)));
    }

    @PostMapping(
            path = "/{id}/suspend",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public AgreementResponse suspend(
            @PathVariable("id") String id,
            @RequestParam(name = "version") long version,
            @RequestBody StatusActionRequest request,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        return toResponse(service.suspend(new AgreementId(id), version, actor(request.actorSubjectId()),
                request.reason(), correlation(correlationId)));
    }

    @PostMapping(
            path = "/{id}/expire",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public AgreementResponse expire(
            @PathVariable("id") String id,
            @RequestParam(name = "version") long version,
            @RequestBody StatusActionRequest request,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        return toResponse(service.expire(new AgreementId(id), version, actor(request.actorSubjectId()),
                request.reason(), correlation(correlationId)));
    }

    @GetMapping(path = "/active-lookup", produces = MediaType.APPLICATION_JSON_VALUE)
    public ActiveLookupResponse activeLookup(
            @RequestParam(name = "customerId") String customerId,
            @RequestParam(name = "tradeLaneId", required = false) String tradeLaneId,
            @RequestParam(name = "originLocationId", required = false) String originLocationId,
            @RequestParam(name = "destinationLocationId", required = false) String destinationLocationId,
            @RequestParam(name = "commodityId", required = false) String commodityId,
            @RequestParam(name = "effectiveDate") LocalDate effectiveDate,
            @RequestParam(name = "actor", defaultValue = "local-user") String actor,
            @RequestHeader(name = "X-Correlation-Id", required = false) String correlationId) {
        ActiveAgreementLookupResult result = service.activeLookup(new ActiveAgreementLookupQuery(customerId, tradeLaneId,
                originLocationId, destinationLocationId, commodityId, effectiveDate, actor, correlation(correlationId)));
        if (!result.matched()) {
            return new ActiveLookupResponse(false, null, List.of(), "no active agreement matched");
        }
        return new ActiveLookupResponse(true, result.agreementId().value(), result.terms().stream().map(this::toTerm).toList(), null);
    }

    private AgreementResponse toResponse(CustomerAgreement agreement) {
        return new AgreementResponse(agreement.id().value(), agreement.agreementNumber().value(), agreement.customerId().value(),
                agreement.tradeLaneId().value(), agreement.commodityId().value(), agreement.validity().from(), agreement.validity().to(),
                agreement.status(), agreement.version(), agreement.terms().stream().map(this::toTerm).toList(),
                agreement.activity().stream().map(this::toActivity).toList());
    }

    private AgreementSummaryResponse toSummary(CustomerAgreement agreement) {
        return new AgreementSummaryResponse(agreement.id().value(), agreement.agreementNumber().value(), agreement.customerId().value(),
                agreement.tradeLaneId().value(), agreement.commodityId().value(), agreement.validity().from(), agreement.validity().to(),
                agreement.status(), agreement.version());
    }

    private ChargeTermResponse toTerm(ChargeTerm term) {
        return new ChargeTermResponse(term.id(), term.chargeCodeId().value(), term.basis(), term.amount().amount(),
                term.amount().currencyId().value(), term.validity().from(), term.validity().to(), term.notes());
    }

    private ActivityResponse toActivity(ActivityEntry entry) {
        return new ActivityResponse(entry.action(), entry.actor(), entry.occurredAt(), entry.reason());
    }

    private List<ChargeTermCommand> toCommands(List<ChargeTermRequest> terms) {
        return terms == null ? List.of() : terms.stream()
                .map(term -> new ChargeTermCommand(term.id(), term.chargeCodeId(), term.basis(), term.amount(),
                        term.currencyId(), term.validFrom(), term.validTo(), term.notes()))
                .toList();
    }

    private String actor(String actorSubjectId) {
        // The legacy grammar retains the field for byte compatibility, but it
        // is never accepted as authentication or audit provenance.
        return "legacy-unverified";
    }

    private String correlation(String correlationId) {
        return correlationId == null || correlationId.isBlank() ? UUID.randomUUID().toString() : correlationId;
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ApiErrorResponse> notFound(NoSuchElementException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error("not_found", exception.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> badRequest(IllegalArgumentException exception) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error("bad_request", exception.getMessage()));
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<ApiErrorResponse> forbidden(SecurityException exception) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error("forbidden", exception.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiErrorResponse> conflict(IllegalStateException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error("conflict", exception.getMessage()));
    }

    private ApiErrorResponse error(String code, String message) {
        return new ApiErrorResponse(code, message == null ? code : message, List.of(), UUID.randomUUID().toString());
    }

    public record AgreementRequest(
            String agreementNumber,
            String customerId,
            String tradeLaneId,
            String commodityId,
            LocalDate validFrom,
            LocalDate validTo,
            List<ChargeTermRequest> terms,
            String actorSubjectId,
            String reason) {
    }

    public record ChargeTermRequest(
            String id,
            String chargeCodeId,
            ChargeBasis basis,
            BigDecimal amount,
            String currencyId,
            LocalDate validFrom,
            LocalDate validTo,
            String notes) {
    }

    public record StatusActionRequest(String actorSubjectId, String reason) {
    }

    public record AgreementResponse(
            String id,
            String agreementNumber,
            String customerId,
            String tradeLaneId,
            String commodityId,
            LocalDate validFrom,
            LocalDate validTo,
            AgreementStatus status,
            long version,
            List<ChargeTermResponse> terms,
            List<ActivityResponse> activity) {
    }

    public record AgreementSummaryResponse(
            String id,
            String agreementNumber,
            String customerId,
            String tradeLaneId,
            String commodityId,
            LocalDate validFrom,
            LocalDate validTo,
            AgreementStatus status,
            long version) {
    }

    public record AgreementSearchResponse(List<AgreementSummaryResponse> items, int page, int size, int returned) {
    }

    public record ChargeTermResponse(
            String id,
            String chargeCodeId,
            ChargeBasis basis,
            BigDecimal amount,
            String currencyId,
            LocalDate validFrom,
            LocalDate validTo,
            String notes) {
    }

    public record ActivityResponse(String action, String actor, Instant occurredAt, String reason) {
    }

    public record ActiveLookupResponse(boolean matched, String agreementId, List<ChargeTermResponse> terms, String noMatchReason) {
    }

    public record ApiErrorResponse(String code, String message, List<String> fields, String correlationId) {
    }
}

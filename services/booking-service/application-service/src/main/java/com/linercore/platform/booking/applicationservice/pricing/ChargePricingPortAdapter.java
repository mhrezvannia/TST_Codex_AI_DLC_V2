package com.linercore.platform.booking.applicationservice.pricing;

import com.linercore.platform.booking.applicationservice.port.PricingOutcome;
import com.linercore.platform.booking.applicationservice.port.PricingPort;
import com.linercore.platform.booking.applicationservice.port.PricingPortResult;
import com.linercore.platform.booking.applicationservice.port.PricingRequestResult;
import com.linercore.platform.booking.domain.model.Booking;
import com.linercore.platform.booking.domain.model.BookingPricingSnapshot;
import com.linercore.platform.booking.domain.model.PricingLineSnapshot;
import com.linercore.platform.booking.domain.model.PricingSnapshot;
import java.time.Clock;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Booking's typed anti-corruption layer for the U04 pricing provider.
 *
 * <p>The captured canonical bytes and provider key are passed through unchanged.
 * Only Booking-owned context (revision, fingerprint, persistence timestamp) is
 * added to the immutable local snapshot.
 */
public final class ChargePricingPortAdapter implements PricingPort {
    private final ChargePricingClient client;
    private final Clock clock;
    private final BookingPricingResilience resilience;

    public ChargePricingPortAdapter(ChargePricingClient client, Clock clock) {
        this(client, clock, new BookingPricingResilience(clock));
    }

    public ChargePricingPortAdapter(
            ChargePricingClient client,
            Clock clock,
            BookingPricingResilience resilience) {
        this.client = client;
        this.clock = clock;
        this.resilience = resilience;
    }

    @Override
    public PricingPortResult requestPricing(PricingAttempt attempt) {
        return resilience.execute(() -> rawTypedRequest(attempt), attempt.correlationId());
    }

    private PricingPortResult rawTypedRequest(PricingAttempt attempt) {
        try {
            ChargePricingResponse response = client.quote(
                    attempt.canonicalBody(), attempt.providerKey(), attempt.correlationId());
            return mapResponse(attempt, response);
        } catch (ChargePricingClientException exception) {
            String correlationId = valueOr(exception.correlationId(), attempt.correlationId());
            return switch (exception.failureType()) {
                case MANUAL -> new PricingPortResult.ManualRequired(
                        exception.reasonCode(),
                        exception.pricingRequestId(),
                        exception.manualCaseId(),
                        correlationId,
                        exception.getMessage());
                case DENIED -> new PricingPortResult.Denied(exception.reasonCode(), correlationId);
                case VALIDATION ->
                    new PricingPortResult.Validation(exception.reasonCode(), correlationId);
                case CONFLICT ->
                    new PricingPortResult.Conflict(exception.reasonCode(), correlationId);
                case IN_PROGRESS -> new PricingPortResult.InProgress(
                        exception.reasonCode(),
                        Math.max(1, Math.min(30, exception.retryAfterSeconds())),
                        correlationId);
                case MALFORMED ->
                    new PricingPortResult.Malformed(exception.reasonCode(), correlationId);
                case TRANSIENT -> new PricingPortResult.Outage(
                        exception.reasonCode(), 1, "CLOSED", null, correlationId);
            };
        } catch (IllegalArgumentException exception) {
            return new PricingPortResult.Malformed(
                    "MALFORMED_PROVIDER_RESPONSE", attempt.correlationId());
        }
    }

    private PricingPortResult mapResponse(PricingAttempt attempt, ChargePricingResponse response) {
        if (response.hasAnyTypedEnrichment() && !response.hasCompleteTypedEnrichment()) {
            return new PricingPortResult.Malformed(
                    "MALFORMED_PROVIDER_RESPONSE", attempt.correlationId());
        }
        if (!response.hasAnyTypedEnrichment()) {
            return new PricingPortResult.LegacyPriced(legacySnapshot(response, attempt));
        }
        var input = attempt.input();
        if (!response.bookingRef().equals(input.bookingRef())
                || !response.pricingRequestId().equals(attempt.providerKey())
                || !response.requestedDepartureDate().equals(input.requestedDepartureDate())
                || response.lineItems().stream().anyMatch(line ->
                        line.quantity() != input.equipmentQuantity()
                                || line.unitRate()
                                                .multiply(java.math.BigDecimal.valueOf(line.quantity()))
                                                .compareTo(line.amount())
                                        != 0)
                || !response.correlationId().equals(attempt.correlationId())) {
            return new PricingPortResult.Malformed(
                    "MALFORMED_PROVIDER_RESPONSE", attempt.correlationId());
        }
        var lines = response.lineItems().stream()
                .map(line -> new PricingLineSnapshot(
                        line.chargeCode(),
                        line.category(),
                        line.rateCategory(),
                        line.basis(),
                        line.quantity(),
                        line.unitRate(),
                        line.amount(),
                        line.currency(),
                        line.sourceRateVersionId()))
                .toList();
        return new PricingPortResult.Priced(new BookingPricingSnapshot(
                2,
                response.pricingRequestId(),
                response.bookingRef(),
                input.amendmentSeq(),
                attempt.booking().revision(),
                attempt.inputHash(),
                response.requestedDepartureDate(),
                response.pricingBasis(),
                response.pricingRef(),
                response.agreementVersionId(),
                lines,
                response.applicableDndRuleTypes(),
                response.total(),
                response.currency(),
                response.pricedAt(),
                response.correlationId(),
                Instant.now(clock)));
    }

    private PricingSnapshot legacySnapshot(
            ChargePricingResponse response, PricingAttempt attempt) {
        LinkedHashMap<String, String> quoted = new LinkedHashMap<>();
        quoted.put("pricingBasis", response.pricingBasis());
        for (int index = 0; index < response.lineItems().size(); index++) {
            ChargePricingLineItem line = response.lineItems().get(index);
            String prefix = "line." + (index + 1) + ".";
            quoted.put(prefix + "chargeCode", line.chargeCode());
            quoted.put(prefix + "category", line.category());
            quoted.put(prefix + "amount", line.amount().toPlainString());
            quoted.put(prefix + "currency", line.currency());
        }
        return new PricingSnapshot(
                attempt.providerKey(),
                response.pricingRef(),
                "QUOTED",
                quoted,
                Instant.now(clock),
                attempt.correlationId());
    }

    /**
     * Compatibility for the pre-U05 application service. It still consumes the
     * typed provider path and never selects the HTTP body or provider key.
     */
    @Override
    public PricingRequestResult requestPricing(
            Booking booking, String ignoredLegacyKey, String correlationId) {
        PricingInput input = PricingInput.from(booking, booking.pricingAmendmentSeq());
        PricingAttempt attempt = new PricingAttempt(
                booking,
                input,
                input.canonicalBytes(),
                input.fingerprint(),
                input.providerKey(),
                correlationId);
        PricingPortResult result = requestPricing(attempt);
        if (result instanceof PricingPortResult.Priced priced) {
            BookingPricingSnapshot snapshot = priced.snapshot();
            return PricingRequestResult.priced(
                    snapshot.pricingRequestId(),
                    snapshot.pricingRef(),
                    flattened(snapshot),
                    snapshot.correlationId());
        }
        if (result instanceof PricingPortResult.LegacyPriced legacy) {
            return PricingRequestResult.priced(
                    legacy.snapshot().pricingRequestId(),
                    legacy.snapshot().pricingQuoteId(),
                    legacy.snapshot().quotedAmounts(),
                    legacy.snapshot().correlationId());
        }
        String requestId = input.providerKey();
        if (result instanceof PricingPortResult.ManualRequired manual) {
            return PricingRequestResult.manual(
                    valueOr(manual.pricingRequestId(), requestId),
                    manual.reasonCode(),
                    manual.providerEvidence(),
                    manual.correlationId());
        }
        if (result instanceof PricingPortResult.InProgress pending) {
            return PricingRequestResult.pending(requestId, pending.correlationId());
        }
        PricingOutcome outcome = result instanceof PricingPortResult.Denied
                ? PricingOutcome.DENIED
                : result instanceof PricingPortResult.Validation
                        ? PricingOutcome.VALIDATION_FAILED
                        : PricingOutcome.TRANSIENT_FAILURE;
        return PricingRequestResult.failure(
                requestId, outcome, result.reasonCode(), result.reasonCode(), result.correlationId());
    }

    private static Map<String, String> flattened(BookingPricingSnapshot snapshot) {
        LinkedHashMap<String, String> quoted = new LinkedHashMap<>();
        quoted.put("pricingBasis", snapshot.pricingBasis());
        quoted.put("total", snapshot.total().toPlainString());
        quoted.put("currency", snapshot.currency());
        for (int index = 0; index < snapshot.lines().size(); index++) {
            PricingLineSnapshot line = snapshot.lines().get(index);
            String prefix = "line." + (index + 1) + ".";
            quoted.put(prefix + "chargeCode", line.chargeCode());
            quoted.put(prefix + "category", line.category());
            quoted.put(prefix + "basis", line.basis());
            quoted.put(prefix + "quantity", Integer.toString(line.quantity()));
            quoted.put(prefix + "unitRate", line.unitRate().toPlainString());
            quoted.put(prefix + "amount", line.amount().toPlainString());
            quoted.put(prefix + "currency", line.currency());
            quoted.put(prefix + "sourceRateVersionId", line.sourceRateVersionId());
        }
        return Map.copyOf(quoted);
    }

    private static String valueOr(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}

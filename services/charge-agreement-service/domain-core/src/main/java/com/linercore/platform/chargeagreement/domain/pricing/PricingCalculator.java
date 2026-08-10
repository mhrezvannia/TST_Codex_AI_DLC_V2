package com.linercore.platform.chargeagreement.domain.pricing;

import com.linercore.platform.chargeagreement.domain.model.ChargeBasis;
import com.linercore.platform.chargeagreement.domain.model.ChargeCategory;
import com.linercore.platform.chargeagreement.domain.model.MoneyAmount;
import com.linercore.platform.chargeagreement.domain.model.PricingLine;
import com.linercore.platform.chargeagreement.domain.model.PricingRequest;
import com.linercore.platform.chargeagreement.domain.model.PricingResult;
import com.linercore.platform.chargeagreement.domain.rate.RateCategory;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.Objects;

public final class PricingCalculator {

    public PricingResult calculate(
            ResolvedPricingAuthority authority,
            PricingRequest request,
            String correlationId,
            Instant terminalAt) {
        Objects.requireNonNull(authority, "pricing authority is required");
        Objects.requireNonNull(request, "pricing request is required");
        Objects.requireNonNull(terminalAt, "terminal time is required");
        if (!request.correlationId().equals(correlationId)) {
            throw new IllegalArgumentException("pricing correlation must match the request");
        }

        int quantity = request.quantities().equipmentQuantity();
        List<PricingLine> lines = authority.sources().stream()
                .map(source -> line(source, quantity))
                .toList();
        return PricingResult.w2Priced(
                request.pricingRequestId(),
                request.bookingRef(),
                authority.basis().name(),
                authority.pricingRef(),
                authority.agreementVersionId() == null ? null : authority.agreementVersionId().value(),
                request.requestedDepartureDate(),
                lines,
                correlationId,
                terminalAt);
    }

    private PricingLine line(ResolvedPricingAuthority.RateSource source, int quantity) {
        BigDecimal unitRate = source.version().money().amount();
        if (unitRate.signum() <= 0) {
            throw new IllegalArgumentException("automatic pricing sources must be greater than zero");
        }
        BigDecimal amount = unitRate.multiply(BigDecimal.valueOf(quantity)).setScale(2, RoundingMode.HALF_UP);
        return new PricingLine(
                source.version().id().value(),
                new com.linercore.platform.chargeagreement.domain.model.ReferenceId(source.chargeCode()),
                legacyCategory(source.category()),
                ChargeBasis.CONTAINER,
                quantity,
                new MoneyAmount(unitRate, source.version().money().currencyId()),
                new MoneyAmount(amount, source.version().money().currencyId()),
                source.category(),
                source.version().basis(),
                source.version().id().value());
    }

    private ChargeCategory legacyCategory(RateCategory category) {
        return switch (category) {
            case BASE -> ChargeCategory.FREIGHT;
            case SURCHARGE -> ChargeCategory.SURCHARGE;
            case LOCAL -> ChargeCategory.LOCAL;
        };
    }
}

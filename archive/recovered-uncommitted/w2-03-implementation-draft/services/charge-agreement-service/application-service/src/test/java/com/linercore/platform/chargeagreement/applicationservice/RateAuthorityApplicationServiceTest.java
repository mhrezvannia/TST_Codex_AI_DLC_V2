package com.linercore.platform.chargeagreement.applicationservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.linercore.platform.chargeagreement.applicationservice.command.CreateRateCommand;
import com.linercore.platform.chargeagreement.applicationservice.command.VersionRateCommand;
import com.linercore.platform.chargeagreement.applicationservice.port.AgreementRateBindingRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.RateRepository;
import com.linercore.platform.chargeagreement.domain.model.AgreementId;
import com.linercore.platform.chargeagreement.domain.model.AgreementRateBinding;
import com.linercore.platform.chargeagreement.domain.model.ChargeCategory;
import com.linercore.platform.chargeagreement.domain.model.PricingLine;
import com.linercore.platform.chargeagreement.domain.model.PricingRequest;
import com.linercore.platform.chargeagreement.domain.model.RateVersion;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;

class RateAuthorityApplicationServiceTest {
    private final InMemoryRates rates = new InMemoryRates();
    private final InMemoryBindings bindings = new InMemoryBindings();
    private final AtomicInteger sequence = new AtomicInteger();
    private final RateAuthorityApplicationService service = new RateAuthorityApplicationService(
            rates, bindings, (subject, resource, action, correlation) -> true, request -> List.of(),
            () -> "id-" + sequence.incrementAndGet());

    @Test
    void bindsApprovedThreeCategoryAuthorityAndReturnsItemisedPricing() {
        List<String> ids = List.of(
                approved(ChargeCategory.FREIGHT, "OCEAN", null, "100.00").id(),
                approved(ChargeCategory.SURCHARGE, "BAF", null, "20.00").id(),
                approved(ChargeCategory.LOCAL, "THC", "USNYC", "15.00").id());

        service.bindAgreement(new AgreementId("agr-1"), 2, ids, "analyst", "corr-1");
        service.validateAgreementApproval(new AgreementId("agr-1"), 2);
        service.promoteAgreementBinding(new AgreementId("agr-1"), 2, 3);
        List<PricingLine> lines = service.pricingLines(new AgreementId("agr-1"), 3, request());

        assertEquals(List.of(ChargeCategory.FREIGHT, ChargeCategory.SURCHARGE, ChargeCategory.LOCAL),
                lines.stream().map(PricingLine::category).toList());
        assertEquals(new BigDecimal("135.00"), lines.stream().map(line -> line.amount().amount())
                .reduce(BigDecimal.ZERO, BigDecimal::add));
    }

    @Test
    void rejectsIncompleteOrDraftAgreementAuthority() {
        RateVersion freight = approved(ChargeCategory.FREIGHT, "OCEAN", null, "100.00");
        assertThrows(IllegalStateException.class, () -> service.bindAgreement(new AgreementId("agr-1"), 2,
                List.of(freight.id()), "analyst", "corr-1"));

        RateVersion draft = service.create(command(ChargeCategory.SURCHARGE, "BAF", null, "20.00"));
        assertThrows(IllegalStateException.class, () -> service.bindAgreement(new AgreementId("agr-1"), 2,
                List.of(freight.id(), draft.id()), "analyst", "corr-1"));
    }

    @Test
    void rejectsDuplicateCategoryEvenWhenAllRequiredCategoriesArePresent() {
        List<String> ids = List.of(
                approved(ChargeCategory.FREIGHT, "OCEAN", null, "100.00").id(),
                approved(ChargeCategory.FREIGHT, "OCEAN-PEAK", null, "10.00").id(),
                approved(ChargeCategory.SURCHARGE, "BAF", null, "20.00").id(),
                approved(ChargeCategory.LOCAL, "THC", "USNYC", "15.00").id());

        assertThrows(IllegalStateException.class, () -> service.bindAgreement(new AgreementId("agr-1"), 2,
                ids, "analyst", "corr-1"));
    }

    @Test
    void returnsNoPriceWhenAnyBoundCategoryDoesNotMatchTheRequest() {
        List<String> ids = List.of(
                approved(ChargeCategory.FREIGHT, "OCEAN", null, "100.00").id(),
                approved(ChargeCategory.SURCHARGE, "BAF", null, "20.00").id(),
                approved(ChargeCategory.LOCAL, "THC", "DEHAM", "15.00").id());
        service.bindAgreement(new AgreementId("agr-1"), 2, ids, "analyst", "corr-1");

        assertEquals(List.of(), service.pricingLines(new AgreementId("agr-1"), 2, request()));
    }

    @Test
    void rejectsDeniedAndInvalidReferenceMutations() {
        RateAuthorityApplicationService denied = new RateAuthorityApplicationService(
                rates, bindings, (subject, resource, action, correlation) -> false, request -> List.of(),
                () -> "denied-id");
        RateAuthorityApplicationService invalidReference = new RateAuthorityApplicationService(
                rates, bindings, (subject, resource, action, correlation) -> true,
                request -> List.of("charge code is inactive"), () -> "invalid-id");

        assertThrows(SecurityException.class,
                () -> denied.create(command(ChargeCategory.FREIGHT, "OCEAN", null, "100.00")));
        assertThrows(IllegalArgumentException.class,
                () -> invalidReference.create(command(ChargeCategory.FREIGHT, "OCEAN", null, "100.00")));
    }

    @Test
    void changedRateCreatesNewDraftWithoutMutatingApprovedVersion() {
        RateVersion current = approved(ChargeCategory.FREIGHT, "OCEAN", null, "100.00");
        RateVersion next = service.createVersion(current.id(), new VersionRateCommand(current.version(),
                new BigDecimal("125.00"), "USD", LocalDate.parse("2026-01-01"),
                LocalDate.parse("2026-12-31"), "analyst", "corr-2"));

        assertEquals(new BigDecimal("100.00"), rates.findById(current.id()).orElseThrow().amount().amount());
        assertEquals(new BigDecimal("125.00"), next.amount().amount());
        assertEquals(current.id(), next.previousVersionId());
    }

    private RateVersion approved(ChargeCategory category, String code, String location, String amount) {
        RateVersion draft = service.create(command(category, code, location, amount));
        return service.approve(draft.id(), draft.version(), "approver", "corr-approve");
    }

    private CreateRateCommand command(ChargeCategory category, String code, String location, String amount) {
        return new CreateRateCommand(category, code, "lane-1", "22G1", location, new BigDecimal(amount), "USD",
                LocalDate.parse("2026-01-01"), LocalDate.parse("2026-12-31"), "analyst", "corr-1");
    }

    private PricingRequest request() {
        return new PricingRequest("booking-1", "lane-1", "USNYC", "NLRTM", "22G1", "cust-1", "general",
                false, false, new PricingRequest.PricingDates(LocalDate.parse("2026-06-01"),
                        LocalDate.parse("2026-06-01")), new PricingRequest.PricingQuantities(1, 2, 0), "corr-1");
    }

    private static final class InMemoryRates implements RateRepository {
        private final Map<String, RateVersion> values = new LinkedHashMap<>();

        public RateVersion save(RateVersion rate) {
            values.put(rate.id(), rate);
            return rate;
        }

        public Optional<RateVersion> findById(String id) {
            return Optional.ofNullable(values.get(id));
        }

        public List<RateVersion> findAllByIds(List<String> ids) {
            return ids.stream().map(values::get).filter(java.util.Objects::nonNull).toList();
        }

        public List<RateVersion> search(ChargeCategory category) {
            return values.values().stream().filter(rate -> category == null || rate.category() == category).toList();
        }
    }

    private static final class InMemoryBindings implements AgreementRateBindingRepository {
        private final List<AgreementRateBinding> values = new ArrayList<>();

        public AgreementRateBinding replace(AgreementRateBinding binding) {
            values.removeIf(value -> value.agreementId().equals(binding.agreementId())
                    && value.agreementVersion() == binding.agreementVersion());
            values.add(binding);
            return binding;
        }

        public Optional<AgreementRateBinding> find(AgreementId agreementId, long agreementVersion) {
            return values.stream().filter(value -> value.agreementId().equals(agreementId)
                    && value.agreementVersion() == agreementVersion).findFirst();
        }
    }
}

package com.linercore.platform.chargeagreement.applicationservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.linercore.platform.chargeagreement.applicationservice.command.ChargeTermCommand;
import com.linercore.platform.chargeagreement.applicationservice.command.CreateAgreementCommand;
import com.linercore.platform.chargeagreement.applicationservice.command.UpdateAgreementCommand;
import com.linercore.platform.chargeagreement.applicationservice.port.AuthorizationPort;
import com.linercore.platform.chargeagreement.applicationservice.port.IdGenerator;
import com.linercore.platform.chargeagreement.applicationservice.port.PricingRequestRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.PricingRequestStatus;
import com.linercore.platform.chargeagreement.applicationservice.port.ReferenceValidationPort;
import com.linercore.platform.chargeagreement.applicationservice.port.StoredPricingRequest;
import com.linercore.platform.chargeagreement.applicationservice.query.ActiveAgreementLookupQuery;
import com.linercore.platform.chargeagreement.applicationservice.query.ActiveAgreementLookupResult;
import com.linercore.platform.chargeagreement.domain.model.AgreementId;
import com.linercore.platform.chargeagreement.domain.model.AgreementStatus;
import com.linercore.platform.chargeagreement.domain.model.ChargeBasis;
import com.linercore.platform.chargeagreement.domain.model.CustomerAgreement;
import com.linercore.platform.chargeagreement.domain.model.ManualPricingCase;
import com.linercore.platform.chargeagreement.domain.model.PricingRequest;
import com.linercore.platform.chargeagreement.domain.model.PricingResult;
import com.linercore.platform.chargeagreement.domain.model.ReferenceId;
import com.linercore.platform.chargeagreement.domain.outbox.AgreementOutboxEvent;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class ChargeAgreementApplicationServiceTest {
    private final TestAgreementRepository agreements = new TestAgreementRepository();
    private final List<AgreementOutboxEvent> outbox = new ArrayList<>();
    private final List<ManualPricingCase> manualCases = new ArrayList<>();
    private final ChargeAgreementApplicationService service = new ChargeAgreementApplicationService(
            agreements,
            allowAll(),
            validReferences(),
            new SequentialIds(),
            Clock.fixed(Instant.parse("2026-07-08T00:00:00Z"), ZoneOffset.UTC),
            outbox::add,
            null,
            null,
            manualCases::add);

    @Test
    void createsUpdatesApprovesAndSuspendsAgreement() {
        CustomerAgreement created = service.create(createCommand("agr-001", "cust-1", "lane-1", "cmdty-1"));
        CustomerAgreement updated = service.update(created.id(), created.version(), updateCommand("agr-001", "cust-1", "lane-1", "cmdty-1"));
        CustomerAgreement approved = service.approve(updated.id(), updated.version(), "approver-1", "approved", "corr-2");
        CustomerAgreement suspended = service.suspend(approved.id(), approved.version(), "ops-1", "hold", "corr-3");

        assertEquals(AgreementStatus.SUSPENDED, suspended.status());
        assertEquals(4, outbox.size());
        assertEquals("charge-agreement.approved", outbox.get(2).eventType());
    }

    @Test
    void rejectsStaleUpdateAndAuthorizationDenial() {
        CustomerAgreement created = service.create(createCommand("agr-001", "cust-1", "lane-1", "cmdty-1"));

        assertThrows(IllegalStateException.class,
                () -> service.update(created.id(), 99, updateCommand("agr-001", "cust-1", "lane-1", "cmdty-1")));

        ChargeAgreementApplicationService denied = new ChargeAgreementApplicationService(
                agreements, denyAll(), validReferences(), new SequentialIds(), Clock.systemUTC());
        assertThrows(SecurityException.class,
                () -> denied.detail(created.id(), "reader-1", "corr-denied"));
    }

    @Test
    void activeLookupReturnsMostSpecificApprovedAgreementOrNoMatch() {
        CustomerAgreement base = approveAgreement("agr-base", "cust-1", "lane-base", "cmdty-1");
        CustomerAgreement specific = approveAgreement("agr-specific", "cust-1", "lane-1", "cmdty-1");
        approveAgreement("agr-other", "cust-2", "lane-1", "cmdty-1");

        ActiveAgreementLookupResult result = service.activeLookup(new ActiveAgreementLookupQuery(
                "cust-1", "lane-1", null, null, "cmdty-1", LocalDate.parse("2026-06-01"), "reader-1", "corr-lookup"));

        assertTrue(result.matched());
        assertEquals(specific.id(), result.agreementId());
        assertFalse(result.agreementId().equals(base.id()));

        ActiveAgreementLookupResult noMatch = service.activeLookup(new ActiveAgreementLookupQuery(
                "cust-1", "lane-1", null, null, "cmdty-1", LocalDate.parse("2027-01-01"), "reader-1", "corr-lookup"));
        assertFalse(noMatch.matched());
    }

    @Test
    void referenceValidationFailureStopsPersistence() {
        ChargeAgreementApplicationService invalidReferences = new ChargeAgreementApplicationService(
                new TestAgreementRepository(),
                allowAll(),
                request -> List.of("missing reference"),
                new SequentialIds(),
                Clock.systemUTC());

        assertThrows(IllegalArgumentException.class,
                () -> invalidReferences.create(createCommand("agr-001", "cust-1", "lane-1", "cmdty-1")));
    }

    @Test
    void pricesItemisedRequestFromActiveAgreementTerms() {
        approveAgreement("agr-price", "cust-1", "lane-1", "cmdty-1");

        PricingResult result = service.price(new PricingRequest("price-req-1", ref("cust-1"), ref("lane-1"), ref("cmdty-1"),
                LocalDate.parse("2026-06-01"), Map.of(ChargeBasis.TEU, 2), "corr-price"), "pricing-user");

        assertFalse(result.manualPricingRequired());
        assertEquals(new BigDecimal("84.00"), result.total().amount());
        assertEquals(1, result.lines().size());
    }

    @Test
    void recordsManualPricingCaseWhenNoActiveAgreementMatches() {
        PricingResult result = service.price(new PricingRequest("price-req-2", ref("cust-missing"), ref("lane-1"), ref("cmdty-1"),
                LocalDate.parse("2026-06-01"), Map.of(ChargeBasis.TEU, 1), "corr-manual"), "pricing-user");

        assertTrue(result.manualPricingRequired());
        assertEquals("NO_RATE", result.reasonCode());
        assertEquals(1, manualCases.size());
        assertEquals("price-req-2:0", manualCases.get(0).pricingRequestId());
    }

    @Test
    void requestPricingReplaysTerminalResultAndRejectsConflictingBody() {
        approveAgreement("agr-price", "cust-1", "lane-1", "cmdty-1");
        InMemoryPricingRequests pricingRequests = new InMemoryPricingRequests(true);
        ChargeAgreementApplicationService pricedService = serviceWithPricingRequests(pricingRequests);
        PricingRequest request = pricingRequest("booking-1", "lane-1", "cust-1", "cmdty-1", 7);

        PricingResult first = pricedService.requestPricing(request, "booking-1:7", "pricing-user");
        PricingResult replay = pricedService.requestPricing(request, "booking-1:7", "pricing-user");

        assertFalse(first.manualPricingRequired());
        assertEquals(first.pricingRef(), replay.pricingRef());
        assertEquals(1, pricingRequests.insertCount);
        assertThrows(PricingConflictException.class, () -> pricedService.requestPricing(
                pricingRequest("booking-1", "lane-1", "cust-1", "cmdty-other", 7), "booking-1:7",
                "pricing-user"));
    }

    @Test
    void requestPricingRejectsSameHashWhileLeaseIsLive() {
        InMemoryPricingRequests pricingRequests = new InMemoryPricingRequests(false);
        ChargeAgreementApplicationService pricedService = serviceWithPricingRequests(pricingRequests);
        PricingRequest request = pricingRequest("booking-2", "lane-1", "cust-missing", "cmdty-1", 1);

        assertThrows(PricingRequestInProgressException.class,
                () -> pricedService.requestPricing(request, "booking-2:1", "pricing-user"));
        assertThrows(PricingRequestInProgressException.class,
                () -> pricedService.requestPricing(request, "booking-2:1", "pricing-user"));
    }

    @Test
    void expiredPricingClaimIsTakenOverAndFencedCompletionProtectsWinner() {
        approveAgreement("agr-price", "cust-1", "lane-1", "cmdty-1");
        InMemoryPricingRequests pricingRequests = new InMemoryPricingRequests(false);
        Clock firstAttemptClock = Clock.fixed(Instant.parse("2026-07-08T00:00:00Z"), ZoneOffset.UTC);
        ChargeAgreementApplicationService firstAttempt = serviceWithPricingRequests(pricingRequests, firstAttemptClock);
        PricingRequest request = pricingRequest("booking-3", "lane-1", "cust-1", "cmdty-1", 3);

        assertThrows(PricingRequestInProgressException.class,
                () -> firstAttempt.requestPricing(request, "booking-3:3", "pricing-user"));
        String originalOwner = pricingRequests.records.get("booking-3:3").ownerToken();
        pricingRequests.completeEnabled = true;

        ChargeAgreementApplicationService takeover = serviceWithPricingRequests(pricingRequests,
                Clock.fixed(Instant.parse("2026-07-08T00:00:11Z"), ZoneOffset.UTC));
        PricingResult result = takeover.requestPricing(request, "booking-3:3", "pricing-user");

        assertFalse(result.manualPricingRequired());
        assertEquals(1, pricingRequests.insertCount);
        assertEquals(1, pricingRequests.takeoverCount);
        assertEquals(PricingRequestStatus.COMPLETED, pricingRequests.records.get("booking-3:3").status());
        assertFalse(pricingRequests.completeOwned("booking-3:3", originalOwner, PricingResult.manual(
                "late-result", "LATE_OWNER", "corr"), "LATE_OWNER", Instant.parse("2026-07-08T00:00:12Z")));
        assertEquals(result.pricingRef(), pricingRequests.records.get("booking-3:3").result().pricingRef());
    }

    private CustomerAgreement approveAgreement(String number, String customerId, String tradeLaneId, String commodityId) {
        CustomerAgreement created = service.create(createCommand(number, customerId, tradeLaneId, commodityId));
        CustomerAgreement updated = service.update(created.id(), created.version(), updateCommand(number, customerId, tradeLaneId, commodityId));
        return service.approve(updated.id(), updated.version(), "approver-1", "approved", "corr");
    }

    private ChargeAgreementApplicationService serviceWithPricingRequests(PricingRequestRepository pricingRequests) {
        return serviceWithPricingRequests(pricingRequests,
                Clock.fixed(Instant.parse("2026-07-08T00:00:00Z"), ZoneOffset.UTC));
    }

    private ChargeAgreementApplicationService serviceWithPricingRequests(PricingRequestRepository pricingRequests, Clock clock) {
        return new ChargeAgreementApplicationService(
                agreements,
                allowAll(),
                validReferences(),
                new SequentialIds(),
                clock,
                null,
                null,
                null,
                manualCases::add,
                pricingRequests);
    }

    private PricingRequest pricingRequest(
            String bookingRef,
            String tradeLane,
            String partyId,
            String commodityCode,
            int amendmentSeq) {
        return new PricingRequest(bookingRef, tradeLane, "USNYC", "NLRTM", "22G1", partyId, commodityCode, false, false,
                new PricingRequest.PricingDates(LocalDate.parse("2026-06-01"), LocalDate.parse("2026-06-01")),
                new PricingRequest.PricingQuantities(1, 2, amendmentSeq),
                "corr-pricing");
    }

    private CreateAgreementCommand createCommand(String number, String customerId, String tradeLaneId, String commodityId) {
        return new CreateAgreementCommand(number, customerId, tradeLaneId, commodityId,
                LocalDate.parse("2026-01-01"), LocalDate.parse("2026-12-31"),
                "manager-1", "create", "corr-1");
    }

    private UpdateAgreementCommand updateCommand(String number, String customerId, String tradeLaneId, String commodityId) {
        return new UpdateAgreementCommand(number, customerId, tradeLaneId, commodityId,
                LocalDate.parse("2026-01-01"), LocalDate.parse("2026-12-31"),
                List.of(new ChargeTermCommand("term-1", "charge-ocean", ChargeBasis.TEU, new BigDecimal("42.00"),
                        "usd", LocalDate.parse("2026-01-01"), LocalDate.parse("2026-12-31"), "base")),
                "manager-1", "update", "corr-1");
    }

    private AuthorizationPort allowAll() {
        return (subjectId, resource, action, correlationId) -> true;
    }

    private AuthorizationPort denyAll() {
        return (subjectId, resource, action, correlationId) -> false;
    }

    private ReferenceValidationPort validReferences() {
        return request -> List.of();
    }

    private ReferenceId ref(String value) {
        return new ReferenceId(value);
    }

    private static class SequentialIds implements IdGenerator {
        private int next = 1;

        public String nextId() {
            return "id-" + next++;
        }
    }

    private static class InMemoryPricingRequests implements PricingRequestRepository {
        private final Map<String, StoredPricingRequest> records = new LinkedHashMap<>();
        private boolean completeEnabled;
        private int insertCount;
        private int takeoverCount;

        private InMemoryPricingRequests(boolean completeEnabled) {
            this.completeEnabled = completeEnabled;
        }

        public Optional<StoredPricingRequest> findByIdempotencyKey(String idempotencyKey) {
            return Optional.ofNullable(records.get(idempotencyKey));
        }

        public boolean insertClaim(StoredPricingRequest claim) {
            if (records.containsKey(claim.idempotencyKey())) {
                return false;
            }
            records.put(claim.idempotencyKey(), claim);
            insertCount++;
            return true;
        }

        public boolean takeOverExpiredClaim(String idempotencyKey, String ownerToken, Instant leaseUntil, Instant now) {
            StoredPricingRequest existing = records.get(idempotencyKey);
            if (existing == null
                    || existing.status() != PricingRequestStatus.IN_PROGRESS
                    || existing.leaseUntil().isAfter(now)) {
                return false;
            }
            records.put(idempotencyKey, new StoredPricingRequest(
                    existing.idempotencyKey(),
                    existing.bookingRef(),
                    existing.amendmentSeq(),
                    existing.requestHash(),
                    existing.status(),
                    ownerToken,
                    leaseUntil,
                    existing.result(),
                    existing.terminalCode(),
                    existing.correlationId(),
                    existing.startedAt(),
                    existing.completedAt()));
            takeoverCount++;
            return true;
        }

        public boolean completeOwned(String idempotencyKey, String ownerToken, PricingResult result, String terminalCode,
                Instant completedAt) {
            if (!completeEnabled) {
                return false;
            }
            StoredPricingRequest existing = records.get(idempotencyKey);
            if (existing == null
                    || existing.status() != PricingRequestStatus.IN_PROGRESS
                    || !existing.ownerToken().equals(ownerToken)) {
                return false;
            }
            records.put(idempotencyKey, new StoredPricingRequest(
                    existing.idempotencyKey(),
                    existing.bookingRef(),
                    existing.amendmentSeq(),
                    existing.requestHash(),
                    result.manualPricingRequired() ? PricingRequestStatus.MANUAL : PricingRequestStatus.COMPLETED,
                    existing.ownerToken(),
                    existing.leaseUntil(),
                    result,
                    terminalCode,
                    existing.correlationId(),
                    existing.startedAt(),
                    completedAt));
            return true;
        }
    }
}

package com.linercore.platform.chargeagreement.applicationservice.rate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.linercore.platform.chargeagreement.applicationservice.port.IdGenerator;
import com.linercore.platform.chargeagreement.applicationservice.port.RateAuthorizationPort;
import com.linercore.platform.chargeagreement.applicationservice.port.RateReferenceValidationPort;
import com.linercore.platform.chargeagreement.applicationservice.port.RateRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.RateRepositoryException;
import com.linercore.platform.chargeagreement.domain.rate.Rate;
import com.linercore.platform.chargeagreement.domain.rate.RateActivity;
import com.linercore.platform.chargeagreement.domain.rate.RateCategory;
import com.linercore.platform.chargeagreement.domain.rate.RateId;
import com.linercore.platform.chargeagreement.domain.rate.RateLifecycle;
import com.linercore.platform.chargeagreement.domain.rate.RatePresentationState;
import com.linercore.platform.chargeagreement.domain.rate.RateVersion;
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
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;

class RateApplicationServiceTest {
    private static final Instant NOW = Instant.parse("2026-07-08T12:00:00Z");
    private static final LocalDate TODAY = LocalDate.parse("2026-07-08");

    private final TestRateRepository repository = new TestRateRepository();
    private final RateApplicationService service = service(repository, allowAll(), request -> List.of());

    @Test
    void createsBaseSurchargeAndLocalFixturesWithAudit() {
        RateViews.Detail base = service.create(create(RateCategory.BASE));
        RateViews.Detail surcharge = service.create(create(RateCategory.SURCHARGE));
        RateViews.Detail local = service.create(create(RateCategory.LOCAL));

        assertEquals(List.of("OFR", "BAF", "THC"), List.of(
                base.rate().chargeCode(), surcharge.rate().chargeCode(), local.rate().chargeCode()));
        assertEquals(3, repository.activities.values().stream().mapToInt(List::size).sum());
        assertEquals(RatePresentationState.DRAFT, base.versions().getFirst().presentationState());
        assertEquals(0, base.rate().latestVersion().money().amount().scale() - 2);
    }

    @Test
    void authorizesBeforeReferenceValidationAndPersistence() {
        AtomicInteger referenceCalls = new AtomicInteger();
        RateApplicationService denied = service(new TestRateRepository(),
                (subject, resource, action, correlation) -> RateAuthorizationPort.Decision.DENY,
                request -> {
                    referenceCalls.incrementAndGet();
                    return List.of();
                });

        RateApplicationException failure = assertThrows(RateApplicationException.class,
                () -> denied.create(create(RateCategory.BASE)));

        assertEquals(403, failure.status());
        assertEquals(0, referenceCalls.get());
    }

    @Test
    void distinguishesInvalidReferenceFromUnavailableReferenceData() {
        RateApplicationService invalid = service(new TestRateRepository(), allowAll(),
                request -> List.of(new RateReferenceValidationPort.Violation("chargeCodeId", "inactive")));
        RateApplicationService unavailable = service(new TestRateRepository(), allowAll(),
                request -> {
                    throw new IllegalStateException("connection detail must not escape");
                });

        RateApplicationException invalidFailure = assertThrows(RateApplicationException.class,
                () -> invalid.create(create(RateCategory.BASE)));
        RateApplicationException unavailableFailure = assertThrows(RateApplicationException.class,
                () -> unavailable.create(create(RateCategory.BASE)));

        assertEquals(422, invalidFailure.status());
        assertEquals("chargeCodeId", invalidFailure.fieldErrors().getFirst().field());
        assertEquals(503, unavailableFailure.status());
        assertFalse(unavailableFailure.getMessage().contains("connection"));
    }

    @Test
    void rejectsStaleDraftUpdateWithoutAppendingActivity() {
        RateViews.Detail created = service.create(create(RateCategory.BASE));
        int activitiesBefore = created.activities().size();

        RateApplicationException failure = assertThrows(RateApplicationException.class,
                () -> service.updateDraft(update(created, 99)));

        assertEquals(409, failure.status());
        assertEquals(activitiesBefore, repository.activities.get(created.rate().id()).size());
    }

    @Test
    void approvesDraftAndMapsRepositoryOverlapToSafeConflict() {
        RateViews.Detail created = service.create(create(RateCategory.BASE));
        RateViews.Detail approved = service.approve(new RateCommands.Approve(
                created.rate().id().value(), created.rate().latestVersion().id().value(), 0,
                "pricing-user", "corr-approve"));
        assertEquals(RateLifecycle.APPROVED, approved.rate().latestVersion().lifecycle());
        assertFalse(approved.actions().canApprove());
        assertTrue(approved.actions().canCreateSuccessor());

        TestRateRepository conflicting = new TestRateRepository();
        RateApplicationService conflictingService = service(conflicting, allowAll(), request -> List.of());
        RateViews.Detail draft = conflictingService.create(create(RateCategory.BASE));
        conflicting.approvalConflict = true;
        RateApplicationException failure = assertThrows(RateApplicationException.class,
                () -> conflictingService.approve(new RateCommands.Approve(
                        draft.rate().id().value(), draft.rate().latestVersion().id().value(), 0,
                        "pricing-user", "corr-overlap")));
        assertEquals(409, failure.status());
        assertEquals("RATE_AUTHORITY_CONFLICT", failure.code());
        assertFalse(failure.getMessage().contains("constraint"));
    }

    @Test
    void successorCopiesApprovedSourceWithoutMutatingIt() {
        RateViews.Detail created = service.create(create(RateCategory.SURCHARGE));
        RateViews.Detail approved = service.approve(new RateCommands.Approve(
                created.rate().id().value(), created.rate().latestVersion().id().value(), 0,
                "pricing-user", "corr-approve"));
        RateVersion sourceBefore = approved.rate().latestVersion();

        RateViews.Detail successor = service.createSuccessor(new RateCommands.CreateSuccessor(
                approved.rate().id().value(), sourceBefore.id().value(), null, null, null,
                null, null, null, "pricing-user", "corr-successor"));

        RateVersion sourceAfter = successor.rate().versions().stream()
                .filter(version -> version.id().equals(sourceBefore.id()))
                .findFirst().orElseThrow();
        assertEquals(sourceBefore, sourceAfter);
        assertNotEquals(sourceBefore.id(), successor.rate().draft().id());
        assertEquals(sourceBefore.id(), successor.rate().draft().sourceVersionId());
        assertEquals(sourceBefore.money(), successor.rate().draft().money());
    }

    @Test
    void effectiveApprovedSummaryIsNotHiddenByDraftSuccessor() {
        RateViews.Detail created = service.create(create(RateCategory.BASE));
        RateViews.Detail approved = service.approve(new RateCommands.Approve(
                created.rate().id().value(), created.rate().latestVersion().id().value(), 0,
                "pricing-user", "corr-approve"));
        service.createSuccessor(new RateCommands.CreateSuccessor(
                approved.rate().id().value(), approved.rate().latestVersion().id().value(), null, null, null,
                null, null, null, "pricing-user", "corr-successor"));

        RateViews.Page page = service.search(new RateSearchQuery(null, null, TODAY, null, null,
                null, null, 0, 20, "pricing-user", "corr-list"));

        assertEquals(RatePresentationState.EFFECTIVE,
                page.items().getFirst().selectedSummaryVersion().presentationState());
        assertEquals(RateLifecycle.APPROVED,
                page.items().getFirst().selectedSummaryVersion().version().lifecycle());
        assertTrue(page.items().getFirst().hasDraft());
    }

    @Test
    void applicabilityFiltersTheSelectedSummaryNotAnyHistoricalVersion() {
        RateViews.Detail created = service.create(create(RateCategory.BASE));
        RateViews.Detail approved = service.approve(new RateCommands.Approve(
                created.rate().id().value(), created.rate().latestVersion().id().value(), 0,
                "pricing-user", "corr-approve"));
        service.createSuccessor(new RateCommands.CreateSuccessor(
                approved.rate().id().value(), approved.rate().latestVersion().id().value(), null, null, null,
                "location-successor", "location-successor-destination", null,
                "pricing-user", "corr-successor"));

        RateViews.Page sourceSummary = service.search(new RateSearchQuery(null, null, TODAY,
                "location-origin", null, null, null, 0, 20, "pricing-user", "corr-source"));
        RateViews.Page successorNotSummary = service.search(new RateSearchQuery(null, null, TODAY,
                "location-successor", null, null, null, 0, 20, "pricing-user", "corr-successor-search"));
        RateViews.Page successorDraft = service.search(new RateSearchQuery(null, RatePresentationState.DRAFT, TODAY,
                "location-successor", null, null, null, 0, 20, "pricing-user", "corr-draft-search"));

        assertEquals(1, sourceSummary.items().size());
        assertEquals("location-origin", sourceSummary.items().getFirst().selectedSummaryVersion()
                .version().applicability().originLocationId().value());
        assertTrue(successorNotSummary.items().isEmpty());
        assertEquals(1, successorDraft.items().size());
        assertEquals("location-successor", successorDraft.items().getFirst().selectedSummaryVersion()
                .version().applicability().originLocationId().value());
    }

    @Test
    void evaluatesMutationActionsIndependently() {
        service.create(create(RateCategory.BASE));
        RateApplicationService approveOnly = service(repository,
                (subject, resource, action, correlation) ->
                        List.of("read", "approve").contains(action)
                                ? RateAuthorizationPort.Decision.ALLOW : RateAuthorizationPort.Decision.DENY,
                request -> List.of());

        RateViews.Page page = approveOnly.search(new RateSearchQuery(null, null, TODAY,
                null, null, null, null, 0, 20, "pricing-user", "corr-actions"));

        assertFalse(page.canCreate());
        assertFalse(page.items().getFirst().actions().canEdit());
        assertTrue(page.items().getFirst().actions().canApprove());
        assertFalse(page.items().getFirst().actions().canCreateSuccessor());
    }

    @Test
    void searchIsPagedBoundedAndReadOnlySubjectsReceiveNoMutationActions() {
        service.create(create(RateCategory.BASE));
        service.create(create(RateCategory.LOCAL));
        RateApplicationService readerService = service(repository,
                (subject, resource, action, correlation) -> "read".equals(action)
                        ? RateAuthorizationPort.Decision.ALLOW : RateAuthorizationPort.Decision.DENY,
                request -> List.of());

        RateViews.Page page = readerService.search(new RateSearchQuery(null, RatePresentationState.DRAFT,
                TODAY, null, null, null, null, Integer.MAX_VALUE, 1, "reader", "corr-list"));

        assertTrue(page.items().isEmpty());
        RateViews.Page first = readerService.search(new RateSearchQuery(RateCategory.BASE, null,
                TODAY, null, null, null, "OFR", 0, 1, "reader", "corr-list"));
        assertEquals(1, first.items().size());
        assertFalse(first.items().getFirst().actions().canEdit());
        assertFalse(first.items().getFirst().actions().canApprove());
    }

    @Test
    void unavailableIdentityFailsClosedBeforeRateDisclosure() {
        RateViews.Detail created = service.create(create(RateCategory.LOCAL));
        RateApplicationService unavailable = service(repository,
                (subject, resource, action, correlation) -> RateAuthorizationPort.Decision.UNAVAILABLE,
                request -> List.of());

        RateApplicationException failure = assertThrows(RateApplicationException.class,
                () -> unavailable.detail(created.rate().id().value(), TODAY, "reader", "corr-read"));

        assertEquals(503, failure.status());
        assertEquals("IDENTITY_UNAVAILABLE", failure.code());
    }

    private static RateApplicationService service(
            TestRateRepository repository,
            RateAuthorizationPort authorization,
            RateReferenceValidationPort references) {
        AtomicInteger sequence = new AtomicInteger();
        IdGenerator ids = () -> "rate-test-" + sequence.incrementAndGet();
        return new RateApplicationService(repository, authorization, references, ids,
                Clock.fixed(NOW, ZoneOffset.UTC));
    }

    private static RateAuthorizationPort allowAll() {
        return (subject, resource, action, correlation) -> RateAuthorizationPort.Decision.ALLOW;
    }

    private static RateCommands.Create create(RateCategory category) {
        return new RateCommands.Create(
                category,
                "charge-code-" + category.name().toLowerCase(),
                switch (category) {
                    case BASE -> "OFR";
                    case SURCHARGE -> "BAF";
                    case LOCAL -> "THC";
                },
                new BigDecimal("125.50"),
                "currency-usd",
                "USD",
                TODAY.minusDays(30),
                TODAY.plusDays(30),
                "location-origin",
                category == RateCategory.LOCAL ? null : "location-destination",
                "equipment-40hc",
                "pricing-user",
                "corr-create-" + category.name().toLowerCase());
    }

    private static RateCommands.UpdateDraft update(RateViews.Detail detail, long expectedVersion) {
        RateVersion version = detail.rate().latestVersion();
        return new RateCommands.UpdateDraft(detail.rate().id().value(), version.id().value(), expectedVersion,
                new BigDecimal("126.00"), version.money().currencyId().value(), version.money().currencyCode(),
                version.effectiveFrom(), version.effectiveTo(),
                version.applicability().originLocationId().value(),
                version.applicability().destinationLocationId() == null
                        ? null : version.applicability().destinationLocationId().value(),
                version.applicability().equipmentTypeId().value(), "pricing-user", "corr-update");
    }

    private static final class TestRateRepository implements RateRepository {
        private final Map<RateId, Rate> rates = new LinkedHashMap<>();
        private final Map<RateId, List<RateActivity>> activities = new LinkedHashMap<>();
        private boolean approvalConflict;

        @Override
        public void create(Rate rate, RateActivity activity) {
            rates.put(rate.id(), rate);
            activities.computeIfAbsent(rate.id(), ignored -> new ArrayList<>()).add(activity);
        }

        @Override
        public Rate updateDraft(Rate stableRate, RateVersion revisedVersion, RateActivity activity) {
            return replace(stableRate, revisedVersion, stableRate.nextVersionNo(), activity);
        }

        @Override
        public Rate approveUnderLock(Rate stableRate, RateVersion approvedVersion, RateActivity activity) {
            if (approvalConflict) {
                throw new RateRepositoryException("RATE_AUTHORITY_CONFLICT", "constraint detail");
            }
            return replace(stableRate, approvedVersion, stableRate.nextVersionNo(), activity);
        }

        @Override
        public Rate createSuccessor(
                Rate stableRate,
                RateVersion sourceVersion,
                RateVersion successor,
                RateActivity activity) {
            List<RateVersion> versions = new ArrayList<>(stableRate.versions());
            versions.add(successor);
            Rate persisted = copy(stableRate, stableRate.nextVersionNo() + 1, versions);
            rates.put(persisted.id(), persisted);
            activities.computeIfAbsent(persisted.id(), ignored -> new ArrayList<>()).add(activity);
            return persisted;
        }

        @Override
        public Optional<Rate> findById(RateId rateId) {
            return Optional.ofNullable(rates.get(rateId));
        }

        @Override
        public SearchPage search(SearchCriteria criteria) {
            List<Rate> filtered = rates.values().stream()
                    .filter(rate -> criteria.category() == null || rate.category() == criteria.category())
                    .filter(rate -> selectedMatches(rate, criteria))
                    .filter(rate -> criteria.query() == null || criteria.query().isBlank()
                            || rate.id().value().toLowerCase().contains(criteria.query().strip().toLowerCase())
                            || rate.chargeCode().toLowerCase().contains(criteria.query().strip().toLowerCase()))
                    .sorted(java.util.Comparator.comparing(Rate::createdAt).reversed()
                            .thenComparing(rate -> rate.id().value()))
                    .toList();
            int from = (int) Math.min(criteria.offset(), filtered.size());
            int to = Math.min(from + criteria.limit(), filtered.size());
            return new SearchPage(List.copyOf(filtered.subList(from, to)), filtered.size());
        }

        @Override
        public List<RateActivity> activities(RateId rateId) {
            return List.copyOf(activities.getOrDefault(rateId, List.of()));
        }

        private Rate replace(Rate stableRate, RateVersion replacement, long nextVersion, RateActivity activity) {
            List<RateVersion> versions = stableRate.versions().stream()
                    .map(version -> version.id().equals(replacement.id()) ? replacement : version)
                    .toList();
            Rate persisted = copy(stableRate, nextVersion, versions);
            rates.put(persisted.id(), persisted);
            activities.computeIfAbsent(persisted.id(), ignored -> new ArrayList<>()).add(activity);
            return persisted;
        }

        private static Rate copy(Rate source, long nextVersion, List<RateVersion> versions) {
            return new Rate(source.id(), source.category(), source.chargeCodeId(), source.chargeCode(),
                    nextVersion, source.createdBy(), source.createdAt(), source.correlationId(), versions);
        }

        private static boolean selectedMatches(Rate rate, SearchCriteria criteria) {
            RateVersion selected = RateViews.selectSummary(rate, criteria.lifecycle(), criteria.asOf());
            if (selected == null) {
                return false;
            }
            return matches(criteria.originLocationId(),
                    selected.applicability().originLocationId().value())
                    && matches(criteria.destinationLocationId(),
                            selected.applicability().destinationLocationId() == null
                                    ? null : selected.applicability().destinationLocationId().value())
                    && matches(criteria.equipmentTypeId(),
                            selected.applicability().equipmentTypeId().value());
        }

        private static boolean matches(String expected, String actual) {
            return expected == null || expected.isBlank() || java.util.Objects.equals(expected, actual);
        }
    }
}

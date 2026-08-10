package com.linercore.platform.chargeagreement.applicationservice.agreement;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.linercore.platform.chargeagreement.applicationservice.port.AgreementAdminReadRepository;
import com.linercore.platform.chargeagreement.applicationservice.port.AgreementAuthorizationPort;
import com.linercore.platform.chargeagreement.applicationservice.port.AgreementRateVersionPort;
import com.linercore.platform.chargeagreement.applicationservice.port.AgreementReferenceValidationPort;
import com.linercore.platform.chargeagreement.applicationservice.port.W2AgreementRepository;
import com.linercore.platform.chargeagreement.domain.agreement.Agreement;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementActivity;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementId;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementLifecycle;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementVersion;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementVersionId;
import com.linercore.platform.chargeagreement.domain.outbox.AgreementOutboxEvent;
import com.linercore.platform.chargeagreement.domain.rate.RateCategory;
import com.linercore.platform.chargeagreement.domain.rate.RateLifecycle;
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

class AgreementApplicationServiceTest {
    private static final Instant NOW = Instant.parse("2026-07-28T12:00:00Z");
    private static final LocalDate FROM = LocalDate.parse("2026-08-01");
    private static final LocalDate TO = LocalDate.parse("2026-08-31");

    private final MemoryRepository repository = new MemoryRepository();
    private final List<AgreementOutboxEvent> outbox = new ArrayList<>();
    private final AtomicInteger ids = new AtomicInteger();
    private final AgreementApplicationService service = service(
            repository, allowAll(), request -> List.of(), validRates(), outbox);

    @Test
    void authorizesBeforeReferencesRatesAndPersistence() {
        AtomicInteger referenceCalls = new AtomicInteger();
        AtomicInteger rateCalls = new AtomicInteger();
        AgreementApplicationService denied = service(
                new MemoryRepository(),
                (subject, resource, action, correlation) -> AgreementAuthorizationPort.Decision.DENY,
                request -> {
                    referenceCalls.incrementAndGet();
                    return List.of();
                },
                values -> {
                    rateCalls.incrementAndGet();
                    return List.of();
                },
                new ArrayList<>());

        AgreementApplicationException failure =
                assertThrows(AgreementApplicationException.class, () -> denied.create(create()));

        assertEquals(403, failure.status());
        assertEquals(0, referenceCalls.get());
        assertEquals(0, rateCalls.get());
    }

    @Test
    void createsW2DraftWithThreeApprovedRateLinksActivityAndOutbox() {
        AgreementViews.Detail detail = service.create(create());

        assertEquals(AgreementLifecycle.DRAFT, detail.selectedVersion().lifecycle());
        assertEquals(3, detail.selectedVersion().links().size());
        assertEquals(1, detail.activity().size());
        assertEquals(1, outbox.size());
        assertTrue(outbox.getFirst().eventId().startsWith("w2agr-"));
        assertEquals("W2_VERSIONED", outbox.getFirst().payload().get("authorityModel"));
    }

    @Test
    void returnsFieldErrorsForInvalidReferenceWithoutWriting() {
        AgreementApplicationService invalid = service(
                repository,
                allowAll(),
                request -> List.of(new AgreementReferenceValidationPort.Violation("customerId", "inactive")),
                validRates(),
                outbox);

        AgreementApplicationException failure =
                assertThrows(AgreementApplicationException.class, () -> invalid.create(create()));

        assertEquals(422, failure.status());
        assertEquals("customerId", failure.fieldErrors().getFirst().field());
        assertTrue(repository.values.isEmpty());
        assertTrue(outbox.isEmpty());
    }

    @Test
    void rejectsMissingOrIncompatibleRateVersionWithoutWriting() {
        AgreementApplicationService invalid = service(
                repository,
                allowAll(),
                request -> List.of(),
                ignored -> List.of(
                        fact("rate-base", RateCategory.BASE, "OFR"),
                        fact("rate-surcharge", RateCategory.SURCHARGE, "WRONG")),
                outbox);

        AgreementApplicationException failure =
                assertThrows(AgreementApplicationException.class, () -> invalid.create(create()));

        assertEquals("AGREEMENT_RATE_LINKS_INVALID", failure.code());
        assertEquals(2, failure.fieldErrors().size());
        assertTrue(repository.values.isEmpty());
    }

    @Test
    void updatesDraftOptimisticallyAndPreservesStableIdentity() {
        AgreementViews.Detail created = service.create(create());
        AgreementViews.Detail revised = service.updateDraft(new AgreementCommands.UpdateDraft(
                created.agreement().id().value(), created.selectedVersion().id().value(), 0,
                commercial("customer-2"), "customer amendment", "subject-1", "corr-2"));

        assertEquals(created.agreement().id(), revised.agreement().id());
        assertEquals(created.selectedVersion().id(), revised.selectedVersion().id());
        assertEquals("customer-2", revised.selectedVersion().customerId().value());
        assertEquals(1, revised.selectedVersion().rowVersion());
        assertEquals(2, revised.activity().size());
        assertEquals(2, outbox.size());
    }

    @Test
    void rejectsStaleDraftUpdateAndApprovedCommercialMutation() {
        AgreementViews.Detail created = service.create(create());
        AgreementApplicationException stale = assertThrows(
                AgreementApplicationException.class,
                () -> service.updateDraft(new AgreementCommands.UpdateDraft(
                        created.agreement().id().value(), created.selectedVersion().id().value(), 9,
                        commercial("customer-2"), "amend", "subject-1", "corr-2")));
        assertEquals(409, stale.status());

        AgreementViews.Detail approved = service.approve(new AgreementCommands.Approve(
                created.agreement().id().value(), created.selectedVersion().id().value(), 0,
                "approved", "subject-1", "corr-3"));
        AgreementApplicationException immutable = assertThrows(
                AgreementApplicationException.class,
                () -> service.updateDraft(new AgreementCommands.UpdateDraft(
                        approved.agreement().id().value(), approved.selectedVersion().id().value(), 1,
                        commercial("customer-3"), "amend", "subject-1", "corr-4")));
        assertEquals(422, immutable.status());
    }

    @Test
    void approvalRevalidatesInsideRepositoryLock() {
        AgreementViews.Detail created = service.create(create());
        repository.validationObserved = false;

        AgreementViews.Detail approved = service.approve(new AgreementCommands.Approve(
                created.agreement().id().value(), created.selectedVersion().id().value(), 0,
                "four eyes approved", "approver-1", "corr-3"));

        assertTrue(repository.validationObserved);
        assertEquals(AgreementLifecycle.APPROVED, approved.selectedVersion().lifecycle());
        assertEquals("approver-1", approved.selectedVersion().approvedBy());
        assertNotNull(approved.selectedVersion().approvedAt());
    }

    @Test
    void createsSingleDraftSuccessorFromApprovedSourceWithoutMutatingSource() {
        AgreementViews.Detail created = service.create(create());
        AgreementViews.Detail approved = service.approve(new AgreementCommands.Approve(
                created.agreement().id().value(), created.selectedVersion().id().value(), 0,
                "approved", "approver-1", "corr-2"));

        AgreementViews.Detail successor = service.createSuccessor(new AgreementCommands.CreateSuccessor(
                approved.agreement().id().value(), approved.selectedVersion().id().value(),
                commercial("customer-2"), "annual renewal", "subject-1", "corr-3"));

        assertEquals(2, successor.agreement().versions().size());
        assertEquals(AgreementLifecycle.DRAFT, successor.selectedVersion().lifecycle());
        assertEquals(approved.selectedVersion().id(), successor.selectedVersion().sourceVersionId());
        AgreementVersion preserved = successor.agreement().versions().stream()
                .filter(value -> value.id().equals(approved.selectedVersion().id()))
                .findFirst().orElseThrow();
        assertEquals(AgreementLifecycle.APPROVED, preserved.lifecycle());
        assertEquals("customer-1", preserved.customerId().value());
        assertEquals("customer-2", successor.selectedVersion().customerId().value());
    }

    @Test
    void terminalTransitionsRequireApprovedAndReason() {
        AgreementViews.Detail created = service.create(create());
        AgreementApplicationException draftFailure = assertThrows(
                AgreementApplicationException.class,
                () -> service.suspend(new AgreementCommands.Transition(
                        created.agreement().id().value(), created.selectedVersion().id().value(),
                        0, "risk hold", "subject-1", "corr-2")));
        assertEquals(422, draftFailure.status());

        AgreementViews.Detail approved = service.approve(new AgreementCommands.Approve(
                created.agreement().id().value(), created.selectedVersion().id().value(), 0,
                "approved", "approver-1", "corr-3"));
        AgreementViews.Detail suspended = service.suspend(new AgreementCommands.Transition(
                approved.agreement().id().value(), approved.selectedVersion().id().value(),
                1, "risk hold", "subject-1", "corr-4"));
        assertEquals(AgreementLifecycle.SUSPENDED, suspended.selectedVersion().lifecycle());
        assertEquals("approver-1", suspended.selectedVersion().approvedBy());
    }

    @Test
    void searchAndDetailArePermissionAwareAndDoNotExposeExistenceWhenDenied() {
        AgreementViews.Detail created = service.create(create());
        AgreementViews.Page page = service.search(new AgreementSearchQuery(
                "customer-1", null, null, FROM, 0, 20, "subject-1", "corr-2"));
        assertEquals(1, page.total());
        assertFalse(page.items().getFirst().readOnly());

        AgreementApplicationService denied = service(
                repository,
                (subject, resource, action, correlation) -> AgreementAuthorizationPort.Decision.DENY,
                request -> List.of(),
                validRates(),
                outbox);
        AgreementApplicationException failure = assertThrows(
                AgreementApplicationException.class,
                () -> denied.detail(created.agreement().id().value(), null, "subject-2", "corr-3"));
        assertEquals(403, failure.status());
    }

    @Test
    void failsClosedWhenAuthorizationOrValidationDependencyIsUnavailable() {
        AgreementApplicationService authUnavailable = service(
                repository,
                (subject, resource, action, correlation) -> AgreementAuthorizationPort.Decision.UNAVAILABLE,
                request -> List.of(),
                validRates(),
                outbox);
        AgreementApplicationService refsUnavailable = service(
                repository,
                allowAll(),
                request -> {
                    throw new IllegalStateException("internal endpoint detail");
                },
                validRates(),
                outbox);

        assertEquals(503, assertThrows(
                AgreementApplicationException.class, () -> authUnavailable.create(create())).status());
        AgreementApplicationException refsFailure = assertThrows(
                AgreementApplicationException.class, () -> refsUnavailable.create(create()));
        assertEquals(503, refsFailure.status());
        assertFalse(refsFailure.getMessage().contains("endpoint"));
    }

    private AgreementApplicationService service(
            MemoryRepository values,
            AgreementAuthorizationPort authorization,
            AgreementReferenceValidationPort references,
            AgreementRateVersionPort rateVersions,
            List<AgreementOutboxEvent> eventSink) {
        return new AgreementApplicationService(
                values,
                values,
                authorization,
                references,
                rateVersions,
                eventSink::add,
                () -> "u03-" + ids.incrementAndGet(),
                Clock.fixed(NOW, ZoneOffset.UTC));
    }

    private static AgreementAuthorizationPort allowAll() {
        return (subject, resource, action, correlation) -> AgreementAuthorizationPort.Decision.ALLOW;
    }

    private static AgreementRateVersionPort validRates() {
        return ignored -> List.of(
                fact("rate-base", RateCategory.BASE, "OFR"),
                fact("rate-surcharge", RateCategory.SURCHARGE, "BAF"),
                fact("rate-local", RateCategory.LOCAL, "THC"));
    }

    private static AgreementRateVersionPort.RateVersionFact fact(
            String id, RateCategory category, String chargeCode) {
        return new AgreementRateVersionPort.RateVersionFact(
                id, category, chargeCode, RateLifecycle.APPROVED,
                FROM.minusDays(1), TO.plusDays(1), "origin-1",
                category == RateCategory.LOCAL ? null : "destination-1", "equipment-1");
    }

    private static AgreementCommands.Create create() {
        return new AgreementCommands.Create(
                "AGR-2026-0001", commercial("customer-1"), null, "subject-1", "corr-1");
    }

    private static AgreementCommands.Commercial commercial(String customer) {
        return new AgreementCommands.Commercial(
                customer, "lane-1", "origin-1", "destination-1", "equipment-1",
                FROM, TO, "rate-base", "rate-surcharge", "rate-local");
    }

    private static final class MemoryRepository implements W2AgreementRepository, AgreementAdminReadRepository {
        private final Map<AgreementId, Agreement> values = new LinkedHashMap<>();
        private final Map<AgreementId, List<AgreementActivity>> activities = new LinkedHashMap<>();
        private boolean validationObserved;

        @Override
        public void create(Agreement agreement, AgreementActivity activity) {
            values.put(agreement.id(), agreement);
            append(activity);
        }

        @Override
        public Agreement updateDraft(
                Agreement stable, AgreementVersion revisedVersion, AgreementActivity activity) {
            Agreement updated = replace(stable, revisedVersion);
            values.put(updated.id(), updated);
            append(activity);
            return updated;
        }

        @Override
        public Agreement createSuccessor(
                Agreement stable,
                AgreementVersion source,
                AgreementVersion successor,
                AgreementActivity activity) {
            List<AgreementVersion> versions = new ArrayList<>(stable.versions());
            versions.add(successor);
            Agreement updated = new Agreement(stable.id(), stable.number(), stable.authorityModel(), versions);
            values.put(updated.id(), updated);
            append(activity);
            return updated;
        }

        @Override
        public Agreement approveUnderLock(
                Agreement stable,
                AgreementVersion draft,
                long expectedRowVersion,
                ApprovalValidation validation,
                String actor,
                Instant at,
                String correlationId,
                String activityId,
                String reason) {
            Agreement current = values.get(stable.id());
            AgreementVersion locked = current.versions().stream()
                    .filter(value -> value.id().equals(draft.id()))
                    .findFirst().orElseThrow();
            validation.validate(locked);
            validationObserved = true;
            AgreementVersion approved = locked.approve(expectedRowVersion, actor, at, correlationId);
            Agreement updated = replace(current, approved);
            values.put(updated.id(), updated);
            append(new AgreementActivity(
                    activityId, updated.id(), approved.id(),
                    com.linercore.platform.chargeagreement.domain.agreement.AgreementActivityAction.APPROVED,
                    actor, at, correlationId, reason, approved.rowVersion()));
            return updated;
        }

        @Override
        public Agreement transitionLifecycle(
                Agreement stable, AgreementVersion transitionedVersion, AgreementActivity activity) {
            Agreement updated = replace(stable, transitionedVersion);
            values.put(updated.id(), updated);
            append(activity);
            return updated;
        }

        @Override
        public Optional<Agreement> findById(AgreementId agreementId) {
            return Optional.ofNullable(values.get(agreementId));
        }

        @Override
        public SearchPage search(SearchCriteria criteria) {
            List<Agreement> matching = values.values().stream()
                    .filter(value -> criteria.customerId() == null || value.versions().stream()
                            .anyMatch(version -> criteria.customerId().equals(version.customerId().value())))
                    .skip(criteria.offset())
                    .limit(criteria.limit())
                    .toList();
            return new SearchPage(matching, matching.size());
        }

        @Override
        public List<AgreementActivity> activity(AgreementId agreementId) {
            return List.copyOf(activities.getOrDefault(agreementId, List.of()));
        }

        private void append(AgreementActivity activity) {
            activities.computeIfAbsent(activity.agreementId(), ignored -> new ArrayList<>()).add(activity);
        }

        private static Agreement replace(Agreement stable, AgreementVersion version) {
            List<AgreementVersion> versions = stable.versions().stream()
                    .map(value -> value.id().equals(version.id()) ? version : value)
                    .toList();
            return new Agreement(stable.id(), stable.number(), stable.authorityModel(), versions);
        }
    }
}

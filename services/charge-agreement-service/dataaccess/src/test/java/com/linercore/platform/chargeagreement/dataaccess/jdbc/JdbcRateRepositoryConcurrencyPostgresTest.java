package com.linercore.platform.chargeagreement.dataaccess.jdbc;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.linercore.platform.chargeagreement.applicationservice.port.RateRepositoryException;
import com.linercore.platform.chargeagreement.applicationservice.port.RateRepository;
import com.linercore.platform.chargeagreement.domain.model.ReferenceId;
import com.linercore.platform.chargeagreement.domain.rate.Rate;
import com.linercore.platform.chargeagreement.domain.rate.RateActivity;
import com.linercore.platform.chargeagreement.domain.rate.RateApplicability;
import com.linercore.platform.chargeagreement.domain.rate.RateCategory;
import com.linercore.platform.chargeagreement.domain.rate.RateId;
import com.linercore.platform.chargeagreement.domain.rate.RateLifecycle;
import com.linercore.platform.chargeagreement.domain.rate.RateMoney;
import com.linercore.platform.chargeagreement.domain.rate.RatePresentationState;
import com.linercore.platform.chargeagreement.domain.rate.RateVersion;
import com.linercore.platform.chargeagreement.domain.rate.RateVersionId;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers(disabledWithoutDocker = true)
class JdbcRateRepositoryConcurrencyPostgresTest {
    private static final Instant NOW = Instant.parse("2026-07-26T08:00:00Z");
    private static final LocalDate FROM = LocalDate.parse("2026-07-01");
    private static final LocalDate TO = LocalDate.parse("2026-12-31");

    @Container
    static final PostgreSQLContainer<?> POSTGRES =
            new PostgreSQLContainer<>("postgres:15-alpine").withDatabaseName("charge_rate_concurrency");

    private DriverManagerDataSource dataSource;

    @BeforeEach
    void migrateCleanSchema() throws Exception {
        try (Connection connection = connection(); Statement statement = connection.createStatement()) {
            statement.execute("DROP SCHEMA public CASCADE");
            statement.execute("CREATE SCHEMA public");
        }
        Flyway.configure()
                .dataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword())
                .locations("classpath:db/migration")
                .load()
                .migrate();
        dataSource = new DriverManagerDataSource(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
    }

    @Test
    void concurrentApprovalsForOneAuthorityHaveOneWinnerAndAtomicActivity() throws Exception {
        JdbcRateRepository setup = repository();
        Rate first = draft("a");
        Rate second = draft("b");
        setup.create(first, activity(first.latestVersion(), "create-a", RateActivity.Action.RATE_CREATED));
        setup.create(second, activity(second.latestVersion(), "create-b", RateActivity.Action.RATE_CREATED));
        RateVersion firstApproval = approve(first.latestVersion(), "approve-a");
        RateVersion secondApproval = approve(second.latestVersion(), "approve-b");

        List<Outcome> outcomes = race(
                () -> repository().approveUnderLock(first, firstApproval,
                        activity(firstApproval, "approval-a", RateActivity.Action.RATE_VERSION_APPROVED)),
                () -> repository().approveUnderLock(second, secondApproval,
                        activity(secondApproval, "approval-b", RateActivity.Action.RATE_VERSION_APPROVED)));

        assertEquals(1, outcomes.stream().filter(Outcome::success).count());
        assertEquals(List.of("RATE_AUTHORITY_CONFLICT"), failureCodes(outcomes));
        long approved = List.of(first.id(), second.id()).stream()
                .map(id -> setup.findById(id).orElseThrow())
                .flatMap(rate -> rate.versions().stream())
                .filter(version -> version.lifecycle() == RateLifecycle.APPROVED)
                .count();
        long approvalActivity = List.of(first.id(), second.id()).stream()
                .flatMap(id -> setup.activities(id).stream())
                .filter(value -> value.action() == RateActivity.Action.RATE_VERSION_APPROVED)
                .count();
        assertEquals(1, approved);
        assertEquals(1, approvalActivity);
        assertEquals(3, setup.activities(first.id()).size() + setup.activities(second.id()).size());
    }

    @Test
    void draftUpdateAndApprovalRaceHasOneWinnerAndPublishedConflictCode() throws Exception {
        JdbcRateRepository setup = repository();
        Rate rate = draft("update-approve");
        setup.create(rate, activity(rate.latestVersion(), "create", RateActivity.Action.RATE_CREATED));
        RateVersion current = rate.latestVersion();
        RateVersion revised = current.reviseDraft(
                new RateMoney(new BigDecimal("126.00"), current.money().currencyId(), "USD"),
                current.effectiveFrom(), current.effectiveTo(), current.applicability(), 0,
                "pricing-update", NOW.plusSeconds(1), "corr-update");
        RateVersion approved = approve(current, "corr-approve");

        List<Outcome> outcomes = race(
                () -> repository().updateDraft(rate, revised,
                        activity(revised, "update", RateActivity.Action.RATE_DRAFT_UPDATED)),
                () -> repository().approveUnderLock(rate, approved,
                        activity(approved, "approve", RateActivity.Action.RATE_VERSION_APPROVED)));

        assertEquals(1, outcomes.stream().filter(Outcome::success).count());
        assertEquals(List.of("RATE_VERSION_CONFLICT"), failureCodes(outcomes));
        List<RateActivity> activities = setup.activities(rate.id());
        assertEquals(2, activities.size());
        assertEquals(1, activities.stream()
                .filter(value -> value.action() != RateActivity.Action.RATE_CREATED).count());
        assertEquals(1, setup.findById(rate.id()).orElseThrow().latestVersion().rowVersion());
    }

    @Test
    void duplicateSuccessorRaceCreatesOneDraftAndOneActivity() throws Exception {
        JdbcRateRepository setup = repository();
        Rate initial = draft("successor");
        setup.create(initial, activity(initial.latestVersion(), "create", RateActivity.Action.RATE_CREATED));
        RateVersion approvedVersion = approve(initial.latestVersion(), "corr-initial-approve");
        Rate approvedRate = setup.approveUnderLock(initial, approvedVersion,
                activity(approvedVersion, "initial-approve", RateActivity.Action.RATE_VERSION_APPROVED));
        RateVersion first = successor(approvedRate, approvedVersion, "successor-a");
        RateVersion second = successor(approvedRate, approvedVersion, "successor-b");

        List<Outcome> outcomes = race(
                () -> repository().createSuccessor(approvedRate, approvedVersion, first,
                        activity(first, "successor-activity-a", RateActivity.Action.RATE_SUCCESSOR_CREATED)),
                () -> repository().createSuccessor(approvedRate, approvedVersion, second,
                        activity(second, "successor-activity-b", RateActivity.Action.RATE_SUCCESSOR_CREATED)));

        assertEquals(1, outcomes.stream().filter(Outcome::success).count());
        assertEquals(List.of("RATE_VERSION_CONFLICT"), failureCodes(outcomes));
        Rate persisted = setup.findById(initial.id()).orElseThrow();
        assertEquals(1, persisted.versions().stream()
                .filter(version -> version.lifecycle() == RateLifecycle.DRAFT).count());
        assertEquals(1, setup.activities(initial.id()).stream()
                .filter(value -> value.action() == RateActivity.Action.RATE_SUCCESSOR_CREATED).count());
        assertEquals(3, setup.activities(initial.id()).size());
    }

    @Test
    void sqlSearchFiltersTheSelectedVersionAndAppliesCountLimitAndOffset() {
        JdbcRateRepository setup = repository();
        Rate initial = draft("selected");
        setup.create(initial, activity(initial.latestVersion(), "create-selected", RateActivity.Action.RATE_CREATED));
        RateVersion approvedVersion = approve(initial.latestVersion(), "corr-selected-approve");
        Rate approved = setup.approveUnderLock(initial, approvedVersion,
                activity(approvedVersion, "selected-approve", RateActivity.Action.RATE_VERSION_APPROVED));
        RateVersion successor = new RateVersion(
                new RateVersionId("version-selected-successor"),
                approved.id(),
                approved.nextVersionNo(),
                RateLifecycle.DRAFT,
                approvedVersion.basis(),
                approvedVersion.money(),
                approvedVersion.effectiveFrom(),
                approvedVersion.effectiveTo(),
                new RateApplicability(
                        new ReferenceId("location-successor"),
                        new ReferenceId("location-successor-destination"),
                        approvedVersion.applicability().equipmentTypeId()),
                0,
                approvedVersion.id(),
                "pricing-user",
                NOW.plusSeconds(3),
                null,
                null,
                null,
                null,
                "corr-selected-successor");
        setup.createSuccessor(approved, approvedVersion, successor,
                activity(successor, "selected-successor", RateActivity.Action.RATE_SUCCESSOR_CREATED));
        Rate second = draft("selected-page-two");
        setup.create(second, activity(second.latestVersion(), "create-page-two", RateActivity.Action.RATE_CREATED));

        RateRepository.SearchPage firstPage = setup.search(criteria(
                null, "location-origin", 0, 1));
        RateRepository.SearchPage secondPage = setup.search(criteria(
                null, "location-origin", 1, 1));
        RateRepository.SearchPage historicalOnly = setup.search(criteria(
                null, "location-successor", 0, 20));
        RateRepository.SearchPage selectedDraft = setup.search(criteria(
                RatePresentationState.DRAFT, "location-successor", 0, 20));

        assertEquals(2, firstPage.total());
        assertEquals(1, firstPage.items().size());
        assertEquals(1, secondPage.items().size());
        assertEquals(0, historicalOnly.total());
        assertEquals(1, selectedDraft.total());
        assertEquals(successor.id(), selectedDraft.items().getFirst().draft().id());
    }

    @Test
    void pricingCandidatesAreBoundedDeterministicInclusiveAndCategorySpecific() {
        JdbcRateRepository setup = repository();
        Rate baseB = pricingDraft("b", RateCategory.BASE, "charge-code-ofr-b");
        Rate baseA = pricingDraft("a", RateCategory.BASE, "charge-code-ofr-a");
        Rate local = pricingDraft("local", RateCategory.LOCAL, "charge-code-thc");
        for (Rate rate : List.of(baseB, baseA, local)) {
            setup.create(rate, activity(rate.latestVersion(), "create-" + rate.id().value(),
                    RateActivity.Action.RATE_CREATED));
            RateVersion approved = approve(rate.latestVersion(), "approve-" + rate.id().value());
            setup.approveUnderLock(rate, approved, activity(
                    approved, "approve-" + rate.id().value(), RateActivity.Action.RATE_VERSION_APPROVED));
        }

        List<RateRepository.PricingCandidate> fromBoundary = setup.findApprovedPricingCandidates(
                new RateRepository.PricingCandidateQuery(
                        RateCategory.BASE, "location-origin", "location-destination",
                        "equipment-40hc", FROM));
        List<RateRepository.PricingCandidate> toBoundary = setup.findApprovedPricingCandidates(
                new RateRepository.PricingCandidateQuery(
                        RateCategory.BASE, "location-origin", "location-destination",
                        "equipment-40hc", TO));
        List<RateRepository.PricingCandidate> localIgnoringDestination = setup.findApprovedPricingCandidates(
                new RateRepository.PricingCandidateQuery(
                        RateCategory.LOCAL, "location-origin", "ignored-by-local",
                        "equipment-40hc", FROM));

        assertEquals(List.of("version-pricing-a", "version-pricing-b"),
                fromBoundary.stream().map(value -> value.version().id().value()).toList());
        assertEquals(2, toBoundary.size());
        assertEquals(List.of("version-pricing-local"),
                localIgnoringDestination.stream().map(value -> value.version().id().value()).toList());
        assertTrue(setup.findApprovedPricingCandidates(new RateRepository.PricingCandidateQuery(
                RateCategory.BASE, "location-origin", "wrong-destination",
                "equipment-40hc", FROM)).isEmpty());
        assertEquals("version-pricing-a", setup.findApprovedPricingVersion(
                new RateVersionId("version-pricing-a")).orElseThrow().version().id().value());
        assertTrue(setup.findApprovedPricingVersion(new RateVersionId("version-missing")).isEmpty());
    }

    private JdbcRateRepository repository() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        return new JdbcRateRepository(jdbc,
                new TransactionTemplate(new DataSourceTransactionManager(dataSource)));
    }

    private static Rate draft(String suffix) {
        return Rate.firstDraft(
                new RateId("rate-" + suffix),
                new RateVersionId("version-" + suffix),
                RateCategory.BASE,
                new ReferenceId("charge-code-ofr"),
                "OFR",
                new RateMoney(new BigDecimal("125.50"), new ReferenceId("currency-usd"), "USD"),
                FROM,
                TO,
                new RateApplicability(
                        new ReferenceId("location-origin"),
                        new ReferenceId("location-destination"),
                        new ReferenceId("equipment-40hc")),
                "pricing-user",
                NOW,
                "corr-" + suffix);
    }

    private static Rate pricingDraft(String suffix, RateCategory category, String chargeCodeId) {
        return Rate.firstDraft(
                new RateId("rate-pricing-" + suffix),
                new RateVersionId("version-pricing-" + suffix),
                category,
                new ReferenceId(chargeCodeId),
                category == RateCategory.BASE ? "OFR"
                        : category == RateCategory.SURCHARGE ? "BAF" : "THC",
                new RateMoney(new BigDecimal("125.50"), new ReferenceId("currency-usd"), "USD"),
                FROM,
                TO,
                RateApplicability.forCategory(
                        category,
                        new ReferenceId("location-origin"),
                        category == RateCategory.LOCAL ? null : new ReferenceId("location-destination"),
                        new ReferenceId("equipment-40hc")),
                "pricing-user",
                NOW,
                "corr-pricing-" + suffix);
    }

    private static RateVersion approve(RateVersion draft, String correlation) {
        return draft.approve(0, "pricing-approver", NOW.plusSeconds(2), correlation);
    }

    private static RateVersion successor(
            Rate rate,
            RateVersion source,
            String suffix) {
        return new RateVersion(
                new RateVersionId("version-" + suffix),
                rate.id(),
                rate.nextVersionNo(),
                RateLifecycle.DRAFT,
                source.basis(),
                source.money(),
                source.effectiveFrom(),
                source.effectiveTo(),
                source.applicability(),
                0,
                source.id(),
                "pricing-user",
                NOW.plusSeconds(3),
                null,
                null,
                null,
                null,
                "corr-" + suffix);
    }

    private static RateRepository.SearchCriteria criteria(
            RatePresentationState lifecycle,
            String origin,
            long offset,
            int limit) {
        return new RateRepository.SearchCriteria(
                null, lifecycle, LocalDate.parse("2026-07-26"), origin, null, null,
                null, offset, limit);
    }

    private static RateActivity activity(
            RateVersion version,
            String id,
            RateActivity.Action action) {
        return new RateActivity(id, version.rateId(), version.id(), version.versionNo(), action,
                "pricing-user", NOW.plusSeconds(version.rowVersion()), "corr-" + id, null, version.rowVersion());
    }

    private static List<String> failureCodes(List<Outcome> outcomes) {
        return outcomes.stream().filter(value -> !value.success()).map(Outcome::code).sorted().toList();
    }

    private static List<Outcome> race(Callable<Rate> first, Callable<Rate> second) throws Exception {
        var executor = Executors.newFixedThreadPool(2);
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);
        try {
            Future<Outcome> firstFuture = executor.submit(contender(first, ready, start));
            Future<Outcome> secondFuture = executor.submit(contender(second, ready, start));
            ready.await();
            start.countDown();
            return List.of(firstFuture.get(), secondFuture.get());
        } finally {
            executor.shutdownNow();
        }
    }

    private static Callable<Outcome> contender(
            Callable<Rate> work,
            CountDownLatch ready,
            CountDownLatch start) {
        return () -> {
            ready.countDown();
            start.await();
            try {
                work.call();
                return new Outcome(true, null);
            } catch (RateRepositoryException exception) {
                return new Outcome(false, exception.code());
            }
        };
    }

    private Connection connection() throws Exception {
        return DriverManager.getConnection(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
    }

    private record Outcome(boolean success, String code) {
    }
}

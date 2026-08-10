package com.linercore.platform.chargeagreement.dataaccess.jdbc;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.linercore.platform.chargeagreement.applicationservice.port.AgreementRepositoryException;
import com.linercore.platform.chargeagreement.domain.agreement.Agreement;
import com.linercore.platform.chargeagreement.domain.agreement.AgreementActivityAction;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import org.junit.jupiter.api.Test;

class JdbcW2AgreementConcurrencyPostgresTest extends AgreementPostgresSupport {
    @Test
    void overlappingAuthorityApprovalsHaveExactlyOneWinner() throws Exception {
        Agreement first = draft("race-a");
        Agreement second = draft("race-b");
        transactions().executeWithoutResult(ignored -> {
            repository().create(first, activity(
                    first, first.latestVersion(), "activity-create-a", AgreementActivityAction.CREATED));
            repository().create(second, activity(
                    second, second.latestVersion(), "activity-create-b", AgreementActivityAction.CREATED));
        });

        List<Outcome> outcomes = race(
                () -> repository().approveUnderLock(
                        first, first.latestVersion(), 0, ignored -> { },
                        "approver-a", NOW.plusSeconds(1), "corr-approve-a",
                        "activity-approve-a", "approved"),
                () -> repository().approveUnderLock(
                        second, second.latestVersion(), 0, ignored -> { },
                        "approver-b", NOW.plusSeconds(1), "corr-approve-b",
                        "activity-approve-b", "approved"));

        assertEquals(1, outcomes.stream().filter(Outcome::success).count());
        assertEquals(List.of("AGREEMENT_AUTHORITY_CONFLICT"), outcomes.stream()
                .filter(value -> !value.success()).map(Outcome::code).toList());
        assertEquals(1, jdbc.queryForObject("""
                SELECT COUNT(*) FROM charge_agreement_versions
                WHERE lifecycle = 'APPROVED' AND authority_model = 'W2_VERSIONED'
                """, Integer.class));
        assertEquals(1, jdbc.queryForObject("""
                SELECT COUNT(*) FROM charge_agreement_activity WHERE action = 'APPROVED'
                """, Integer.class));
    }

    private List<Outcome> race(Callable<Agreement> first, Callable<Agreement> second) throws Exception {
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);
        try (var executor = Executors.newFixedThreadPool(2)) {
            Callable<Outcome> wrappedFirst = wrapped(first, ready, start);
            Callable<Outcome> wrappedSecond = wrapped(second, ready, start);
            Future<Outcome> firstFuture = executor.submit(wrappedFirst);
            Future<Outcome> secondFuture = executor.submit(wrappedSecond);
            ready.await();
            start.countDown();
            return List.of(firstFuture.get(), secondFuture.get());
        }
    }

    private Callable<Outcome> wrapped(
            Callable<Agreement> operation, CountDownLatch ready, CountDownLatch start) {
        return () -> {
            ready.countDown();
            start.await();
            try {
                transactions().execute(status -> {
                    try {
                        return operation.call();
                    } catch (RuntimeException exception) {
                        throw exception;
                    } catch (Exception exception) {
                        throw new IllegalStateException(exception);
                    }
                });
                return new Outcome(true, null);
            } catch (AgreementRepositoryException exception) {
                return new Outcome(false, exception.code());
            }
        };
    }

    private record Outcome(boolean success, String code) {
    }
}

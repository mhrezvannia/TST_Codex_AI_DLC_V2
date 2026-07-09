# Code Summary - U02 Agreement Domain Model

## Files Created

| Area | Files |
| --- | --- |
| Domain model | `services/charge-agreement-service/domain-core/src/main/java/com/linercore/platform/chargeagreement/domain/model/*.java` |
| Domain tests | `services/charge-agreement-service/domain-core/src/test/java/com/linercore/platform/chargeagreement/domain/model/CustomerAgreementTest.java` |

## Key Decisions

The domain model is adapter-free and centers on `CustomerAgreement` as the aggregate root. It enforces draft-only updates, approval only with at least one valid charge term, approved-only suspend/expire transitions, positive charge amounts, and charge-term validity inside the agreement window.

## Test Coverage

The domain test covers draft creation, agreement-number normalization, header and term updates, approval preconditions, suspend/expire inactive behavior, illegal updates after suspension, non-positive amounts, and out-of-window terms.

## Verification

Pass: covered by `mvn -f services/pom.xml -pl charge-agreement-service/container -am test` after installing JDK 21 and Maven.

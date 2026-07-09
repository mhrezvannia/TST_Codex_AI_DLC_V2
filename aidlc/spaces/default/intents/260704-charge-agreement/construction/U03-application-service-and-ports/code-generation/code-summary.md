# Code Summary - U03 Application Service and Ports

## Files Created

| Area | Files |
| --- | --- |
| Application service | `ChargeAgreementApplicationService.java` |
| Commands | `CreateAgreementCommand.java`, `UpdateAgreementCommand.java`, `ChargeTermCommand.java` |
| Queries/results | `AgreementSearchQuery.java`, `ActiveAgreementLookupQuery.java`, `ActiveAgreementLookupResult.java`, `AgreementFact.java` |
| Ports | `AgreementRepository.java`, `AuthorizationPort.java`, `ReferenceValidationPort.java`, `IdGenerator.java`, `AgreementEventPublisherPort.java` |
| Tests | `ChargeAgreementApplicationServiceTest.java`, `TestAgreementRepository.java` |

## Key Decisions

The application service remains adapter-free. It coordinates authorization, reference validation, optimistic version checks, repository persistence, lifecycle use cases, and a lightweight event fact seam. Active lookup requires customer and effective date, filters approved active candidates, applies trade-lane and commodity matching when supplied, and returns an explicit no-match payload.

## Test Coverage

The application-service test covers create/update/approve/suspend, event fact publication, stale version rejection, authorization denial, reference validation failure, and active lookup match/no-match behavior.

## Verification

Pass: covered by `mvn -f services/pom.xml -pl charge-agreement-service/container -am test` after installing JDK 21 and Maven.

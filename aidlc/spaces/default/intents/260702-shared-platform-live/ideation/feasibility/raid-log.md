# RAID Log - Shared Platform Local Functionality

## Risks

| ID | Risk | Likelihood | Impact | Owner | Mitigation |
| --- | --- | --- | --- | --- | --- |
| R-001 | Local prerequisites remain unavailable, blocking backend and full-stack verification. | High | High | Platform / developer environment owner | Install Java 21, Maven 3.9+, and start approved Docker runtime before construction verification. |
| R-002 | Compose references images that are not buildable from this repo. | High | High | Architecture / delivery | Add Dockerfiles/build contexts or a documented image build pipeline. |
| R-003 | Auth bypass becomes relied on as a functional substitute for Keycloak. | Medium | High | Security / architecture | Keep bypass opt-in/local-only; add real local Keycloak realm/client/user bootstrap. |
| R-004 | Reference-data UI remains static/read-only after implementation. | Medium | High | Product / frontend / backend | Require BFF-to-backend read/write flows as acceptance criteria. |
| R-005 | Seed loader stays dry-run-only. | Medium | Medium | Platform / QA | Add apply mode through service/admin APIs and idempotency tests. |
| R-006 | Contract artifacts diverge from actual running service behavior. | Medium | High | Architecture / QA | Add provider tests, Schema Registry compatibility checks, and contract catalog validation. |
| R-007 | PII handling for Party/Customer is under-controlled. | Medium | High | Security / compliance | Add authorization checks, access logs, masking, and OWASP/API matrix evidence. |

## Assumptions

| ID | Assumption | Confidence | Validation |
| --- | --- | --- | --- |
| A-001 | Docker Desktop or an approved Docker-compatible runtime can be used on the developer machine. | Medium | Confirm with user/team and run `docker version`. |
| A-002 | Java 21 and Maven 3.9+ can be installed locally or are present on the self-hosted runner. | High | Verify `java -version` and `mvn -version`. |
| A-003 | Existing Java service skeleton is close enough to compile once toolchain is available. | Medium | Run `mvn -f services/pom.xml test` after toolchain setup. |
| A-004 | Current in-memory adapters can be evolved to local persistence/API behavior without changing domain boundaries. | Medium | Validate in reverse engineering and application design. |
| A-005 | Keycloak local bootstrap can be deterministic through realm import or admin API. | Medium | Prototype in construction or infrastructure design. |

## Issues

| ID | Issue | Severity | Evidence | Resolution path |
| --- | --- | --- | --- | --- |
| I-001 | Java is not installed/on PATH on this machine. | High | `java` command not recognized. | Install Java 21. |
| I-002 | Maven is not installed/on PATH on this machine. | High | `mvn` command not recognized. | Install Maven 3.9+. |
| I-003 | Docker daemon is not running. | High | Docker pipe not found. | Start Docker Desktop or approved runtime. |
| I-004 | No Dockerfiles were found for local service/app images. | High | Repo scan found `compose.yaml` but no Dockerfiles. | Add build definitions or documented local dev profile. |
| I-005 | Current reference-data app uses static/local data and disabled mutations. | Medium | User-observed read-only UI; prior code summary confirms placeholder BFFs. | Wire BFF to backend and implement write flows. |

## Dependencies

| ID | Dependency | Needed for | Status |
| --- | --- | --- | --- |
| D-001 | Java 21 | Backend compile, tests, runtime images. | Missing locally. |
| D-002 | Maven 3.9+ | Backend build/test gates. | Missing locally. |
| D-003 | Docker runtime | PostgreSQL, Keycloak, Kafka, Schema Registry, Nginx, local service stack. | Docker daemon not running. |
| D-004 | Keycloak 24 | Real local authentication. | Compose service declared; bootstrap not completed. |
| D-005 | PostgreSQL 15 | Persistent reference/authz stores. | Compose service declared. |
| D-006 | Kafka and Schema Registry | Reference-change event publication and compatibility checks. | Compose services declared. |
| D-007 | Self-hosted CI runner | Full quality-gate evidence. | Needs provisioning confirmation. |
| D-008 | Harbor/Nexus/Artifactory or local image build | Image publication or local stack startup. | Registry choice not confirmed. |

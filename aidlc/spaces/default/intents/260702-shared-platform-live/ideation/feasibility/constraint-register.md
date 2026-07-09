# Constraint Register - Shared Platform Local Functionality

## Constraint Summary

This register consumes `intent-statement`, `competitive-analysis`, `market-trends`, and `build-vs-buy`. Constraints are classified as mandated, project-decided, or environmental.

## Technical Constraints

| ID | Constraint | Source | Impact | Treatment |
| --- | --- | --- | --- | --- |
| C-001 | Java service code must target Java 21 / Java 17 floor. | Enterprise Tech-Env v1.1 | Requires Java toolchain and Maven-compatible build. | Install Java 21 locally and on CI runner. |
| C-002 | Backend services must use Spring Boot 3.3 and hexagonal Maven multi-module skeleton. | Enterprise Tech-Env v1.1 | Limits implementation shape and dependency direction. | Preserve existing service skeleton; validate domain-core purity. |
| C-003 | Docker Compose is the local/on-prem topology. | Enterprise Tech-Env v1.1 | Full local functionality depends on Docker daemon and Compose descriptors. | Start approved Docker runtime; complete image build definitions. |
| C-004 | No public cloud services. | Enterprise Tech-Env v1.1 / build-vs-buy | AWS/managed cloud substitutions are not allowed. | Use self-hosted/on-prem components. |
| C-005 | Browser traffic must go through Next.js BFF, not backend services directly. | Enterprise Tech-Env v1.1 | UI integration must use route handlers/server actions. | Implement BFF-to-backend clients. |
| C-006 | Reference data owns Party/Customer PII. | Shared Platform Tech Env | Data handling and logging require classification discipline. | Restrict sensitive fields and log access with correlation ids. |
| C-007 | Auth must use Keycloak for authentication and `identity-service` for authorization. | Enterprise Tech-Env v1.1 | Local bypass cannot become production behavior. | Keep `AUTH_BYPASS=true` local-only and add real Keycloak bootstrap. |
| C-008 | Events use Kafka, Avro, Schema Registry, and transactional outbox. | Enterprise Tech-Env v1.1 | Event publication requires broker/runtime and schema compatibility checks. | Implement live publication and compatibility verification. |
| C-009 | Quality gates must include backend Maven tests. | CI/Build & Test evidence | Current machine cannot satisfy full gate. | Install Maven or run on properly provisioned self-hosted runner. |

## Organizational Constraints

| ID | Constraint | Source | Impact | Treatment |
| --- | --- | --- | --- | --- |
| O-001 | Build order must keep Shared Platform before Charge, Booking, and Container Movement. | Program Vision / project memory | Avoids downstream integration debt. | Keep this intent scoped to Shared Platform functionality. |
| O-002 | Follow-on roadmap is fixed after this intent. | Project memory `## Decided` | Prevents re-asking module order. | Proceed Charge, Booking, Container Movement, then M0-M4. |
| O-003 | Self-hosted runner and registry availability are not yet confirmed. | Feasibility checks | CI/release evidence may be delayed. | Confirm runner and registry during infrastructure/design stages. |

## Regulatory and Compliance Constraints

| ID | Constraint | Source | Impact | Treatment |
| --- | --- | --- | --- | --- |
| R-001 | OWASP Top 10, OWASP API Top 10, and CIS Controls v8 are mandatory. | Enterprise Tech-Env v1.1 | Security matrix and evidence are required. | Complete `security/owasp-compliance.md` during this intent. |
| R-002 | PII must be protected and access-logged. | Enterprise Tech-Env / Shared Platform Tech Env | Party/Customer APIs and UI need controls. | Add authorization checks, masked logging, and audit evidence. |
| R-003 | Data residency is on-prem; primary/DR site is TBD. | Enterprise Tech-Env v1.1 | Production topology has later site decisions. | Do not block local functionality; carry to Operation stages. |
| R-004 | Auditability and correlation id are mandatory. | Program Vision / Enterprise Tech-Env | Every mutating flow must be traceable. | Enforce correlation id through BFF, backend, outbox, and logs. |

## Environmental Constraints

| ID | Constraint | Current status | Impact | Treatment |
| --- | --- | --- | --- | --- |
| E-001 | Node.js and Yarn are available. | Available: Node v24.18.0, Yarn 4.5.3. | Frontend and script checks can run. | Continue using direct workspace commands. |
| E-002 | Java is unavailable. | `java` not recognized. | Backend cannot compile/test locally. | Install Java 21. |
| E-003 | Maven is unavailable. | `mvn` not recognized. | Backend quality gate fails. | Install Maven 3.9+. |
| E-004 | Docker daemon is unavailable. | Docker pipe not found. | Compose stack cannot start. | Start Docker Desktop or approved runtime. |
| E-005 | Compose syntax is valid. | `docker compose config --quiet` passed. | Descriptors are parseable. | Continue to runtime/image fixes. |
| E-006 | Dockerfiles/build definitions are missing. | Repo scan found no Dockerfiles. | Local images referenced by Compose may not exist. | Add Dockerfiles/build contexts or dev-run profiles. |

# Feasibility Questions - LinerCore Enterprise

## Q1. What existing systems must this integrate with?

A. Shared Platform MVP, Charge Agreement partial implementation, Keycloak, Kafka, Schema Registry, PostgreSQL, external finance, vessel schedule/capacity source, EDI/movement feeds, and future visibility/network partners.
B. No integrations.
C. Only a static UI prototype.
D. Only one database shared by all services.
X. Other (please specify)

[Answer]: A. Shared Platform MVP, Charge Agreement partial implementation, Keycloak, Kafka, Schema Registry, PostgreSQL, external finance, vessel schedule/capacity source, EDI/movement feeds, and future visibility/network partners.

## Q2. Are there regulatory or compliance requirements?

A. Enterprise security, auditability, PII handling, data residency/trade footprint questions, SOC2-style evidence expectations, least privilege, encryption, logs, and incident readiness.
B. None.
C. HIPAA-specific requirements.
D. PCI cardholder-data processing in the core scope.
X. Other (please specify)

[Answer]: A. Enterprise security, auditability, PII handling, data residency/trade footprint questions, SOC2-style evidence expectations, least privilege, encryption, logs, and incident readiness.

## Q3. What is the current technical baseline?

A. Brownfield monorepo with existing Shared Platform MVP, partial Charge Agreement service, Next.js/TypeScript frontend packages, Java/Spring-style backend modules, Yarn/Turborepo, Graphify graph, and Docker target.
B. Empty greenfield repository.
C. A SaaS-only target with no local runtime.
D. A single desktop app.
X. Other (please specify)

[Answer]: A. Brownfield monorepo with existing Shared Platform MVP, partial Charge Agreement service, Next.js/TypeScript frontend packages, Java/Spring-style backend modules, Yarn/Turborepo, Graphify graph, and Docker target.

## Q4. What are the main technical uncertainties?

A. Full Docker Compose parity, Kafka/SR/Keycloak integration, contract-test maturity, Booking/CMM greenfield build, D&D correctness, external data quality, and end-to-end observability.
B. Whether markdown files can be written.
C. Whether users need a UI.
D. Whether code should exist.
X. Other (please specify)

[Answer]: A. Full Docker Compose parity, Kafka/SR/Keycloak integration, contract-test maturity, Booking/CMM greenfield build, D&D correctness, external data quality, and end-to-end observability.

## Q5. What organizational constraints apply?

A. Preserve historical MVP, follow trunk-based development, keep module boundaries, gate stage approvals, and avoid declaring fake completion.
B. Reopen and overwrite old workflows.
C. Collapse all domains into one service.
D. Skip tests to move faster.
X. Other (please specify)

[Answer]: A. Preserve historical MVP, follow trunk-based development, keep module boundaries, gate stage approvals, and avoid declaring fake completion.

## Q6. What cloud or infrastructure landscape is assumed?

A. On-premises/local Docker foundation with no public cloud runtime dependency; AWS-specific account/service assumptions are out of scope unless later introduced.
B. AWS-only production.
C. Remote SaaS-only runtime.
D. No infrastructure required.
X. Other (please specify)

[Answer]: A. On-premises/local Docker foundation with no public cloud runtime dependency; AWS-specific account/service assumptions are out of scope unless later introduced.

# Feasibility Questions

## Answered Questions

1. What existing systems must this integrate with?
   - A. Existing Shared Platform scaffold only
   - B. Keycloak 24, PostgreSQL, Kafka, Schema Registry, Nginx, and Next.js BFF apps
   - C. Charge, Booking, and Container Movement services
   - D. External Finance
   - X. Other (please specify)
   - [Answer]: B. This intent integrates the Shared Platform scaffold with its required local runtime components; Charge, Booking, Container Movement, and Finance are downstream follow-on work.

2. Are there regulatory or compliance requirements?
   - A. None
   - B. OWASP/API security, CIS controls, PII classification, auditability, data residency, and no public cloud
   - C. PCI-DSS
   - D. HIPAA
   - X. Other (please specify)
   - [Answer]: B. Enterprise Technical Environment v1.1 mandates OWASP Top 10/API Top 10, CIS Controls v8, PII protection, auditability, encryption, TLS, and on-prem/no-public-cloud operation.

3. What is the current technology stack and skill profile?
   - A. Java/Spring Boot backend, Next.js/React/TypeScript frontend, Docker Compose local runtime
   - B. Serverless/public cloud
   - C. Python/Django
   - D. .NET
   - X. Other (please specify)
   - [Answer]: A. Java 21/Spring Boot 3.3, Maven, PostgreSQL, Kafka/Schema Registry, Keycloak, Next.js/React/TypeScript, Yarn/Turborepo, Docker Compose.

4. What are the budget and timeline constraints?
   - A. Unknown
   - B. Use existing scaffold and open-source/self-hosted components; avoid commercial platform acquisition
   - C. Buy a full carrier platform
   - X. Other (please specify)
   - [Answer]: B. Adopt commodity open-source/self-hosted platform components and focus engineering on making the Shared Platform functional.

5. Are there organizational blockers?
   - A. None known
   - B. Local prerequisites and target runner provisioning need confirmation
   - C. Change freeze
   - D. Competing priorities
   - X. Other (please specify)
   - [Answer]: B. Docker runtime, Java 21, Maven, and local/CI image build path must be available before full verification.

6. What AWS services and accounts are currently in use?
   - A. AWS production accounts
   - B. AWS dev accounts
   - C. None; platform is on-premises
   - X. Other (please specify)
   - [Answer]: C. None; Enterprise Technical Environment v1.1 explicitly mandates on-premises operation and no public cloud.

## Evidence

These answers consume `intent-statement`, `competitive-analysis`, `market-trends`, and `build-vs-buy`. They are also grounded in `docs/enterprise-technical-environment.md`, `docs/shared-platform-module-tech-env.md`, `compose.yaml`, and local tool checks performed during feasibility.

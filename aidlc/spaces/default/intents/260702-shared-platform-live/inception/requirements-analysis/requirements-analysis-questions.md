# Requirements Analysis Questions - Shared Platform Local Functionality

## Context

This questions file consumes `intent-statement`, `scope-document`, `business-overview`, `architecture`, `code-structure`, and `team-practices`. Answers are derived from the approved Ideation artifacts, reverse-engineering code knowledge base, and current team practices. Optional user Q&A is intentionally avoided because the user requested uninterrupted progress until Shared Platform is functional.

## Questions and Answers

### Q1. What type of work is this initiative?

A. Greenfield product launch.
B. Brownfield functional completion of the existing Shared Platform scaffold.
C. Visual-only redesign.
D. Downstream business module implementation.
E. Production deployment only.
X. Other (please specify)

[Answer]: B - Brownfield functional completion of the existing Shared Platform scaffold. The `business-overview` and `code-structure` show existing apps, services, contracts, scripts, and Compose descriptors.

### Q2. What is the target depth and complexity?

A. Minimal.
B. Standard.
C. Comprehensive.
D. No requirements needed.
E. UI-only requirements.
X. Other (please specify)

[Answer]: B - Standard. The scope is multi-component and integration-heavy but bounded to Shared Platform U01-U12.

### Q3. Which capability areas must requirements cover?

A. Runtime readiness only.
B. Runtime readiness, backend services, auth/authorization, reference-data operations, BFF/UI, seed apply, events/contracts, quality gates, observability, and local-only safeguards.
C. Charge, Booking, and Container Movement.
D. Public cloud deployment.
E. Marketing site.
X. Other (please specify)

[Answer]: B - Requirements must cover all in-scope Shared Platform areas from the `scope-document` and `intent-backlog`.

### Q4. Which user and system scenarios must be testable?

A. Static view-only browsing.
B. Local startup, sign-in or bypass, reference-data create/update/deactivate/history/status, seed apply, outbox publication, contract validation, quality gates, and failure states.
C. Customer shipment booking.
D. Finance invoice export.
E. Production promotion.
X. Other (please specify)

[Answer]: B - These are the observable scenarios needed to prove Shared Platform is locally functional and integration-ready.

### Q5. What constraints are non-negotiable?

A. Use public cloud if easier.
B. On-prem/local Compose, Next.js BFF-only browser traffic, Keycloak authentication, identity-service authorization, PostgreSQL, Kafka, Schema Registry, transactional outbox, Java/Spring backend, Yarn/Turborepo frontend, and local-only auth bypass.
C. Direct browser-to-service calls.
D. Static data is acceptable.
E. Skip backend Maven gates.
X. Other (please specify)

[Answer]: B - These constraints are carried from `scope-document`, `architecture`, and `team-practices`.

### Q6. What should remain out of scope?

A. Nothing; build everything now.
B. Charge & Customer Agreement, Customer Booking, Container Movement, external finance integration, production deployment, public cloud substitutions, public customer identity, DCSA public T&T, EDI intake, multi-entity, and multi-currency.
C. Reference-data mutations.
D. Auth.
E. Quality gates.
X. Other (please specify)

[Answer]: B - These exclusions are explicitly defined in the `scope-document`.

## Analysis

No unresolved contradiction remains. The requirements should be Standard-depth, testable, and mapped to Shared Platform U01-U12 without expanding into downstream modules.

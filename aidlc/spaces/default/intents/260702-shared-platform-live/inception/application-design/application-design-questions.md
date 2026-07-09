# Application Design Questions - Shared Platform Local Functionality

## Context

This design plan consumes `requirements`, `stories`, `architecture`, `component-inventory`, and `team-practices`. It also uses the refined mockups from the prior stage. Answers are inferred from approved artifacts and current code evidence because the user asked to continue without optional prompts until Shared Platform is locally functional.

## Questions and Answers

### Q1. What is the primary architectural boundary for this intent?

A. Build Charge, Booking, and Container Movement now.
B. Complete the Shared Platform foundation: auth/session, identity authorization, reference-data UI/BFF/backend, seed, events, contracts, and local runtime.
C. Replace the monorepo.
D. Build a public customer portal.
E. Move to managed cloud services.
X. Other (please specify)

[Answer]: B - `requirements`, `stories`, `architecture`, `component-inventory`, and `team-practices` all constrain this intent to Shared Platform local functionality.

### Q2. How should browser-to-backend communication work?

A. Browser calls Java services directly.
B. Browser calls Next.js BFF routes; BFF routes call identity-service and reference-data-service server-side.
C. Browser writes directly to PostgreSQL.
D. Browser publishes Kafka events.
E. Browser uses static local arrays only.
X. Other (please specify)

[Answer]: B - The existing `architecture` and `team-practices` require BFF-to-service integration and no browser-to-service calls.

### Q3. Who owns authorization decisions?

A. UI button state only.
B. identity-service owns authorization decisions; BFF and reference-data-service enforce them.
C. reference-data-service hardcodes every role.
D. Keycloak alone decides every resource action.
E. No authorization for local runs.
X. Other (please specify)

[Answer]: B - `requirements` FR-012/FR-013 and `component-inventory` show identity-service already exposes authorization and effective-permission APIs.

### Q4. What should replace current static Reference Data behavior?

A. Keep static arrays.
B. Introduce Reference Data service clients in the BFF and persist service state through repository adapters.
C. Remove the UI.
D. Make seed files the runtime database.
E. Wait for downstream modules first.
X. Other (please specify)

[Answer]: B - Current code evidence shows the BFF uses local data, while `reference-data-service` already has create/update/deactivate/list/history/outbox use cases.

### Q5. What event pattern should be used?

A. Synchronous calls to every downstream module.
B. Transactional outbox in reference-data-service with Kafka publication and Schema Registry checks.
C. UI emits events.
D. Store events only in logs.
E. Disable events until production.
X. Other (please specify)

[Answer]: B - This follows `architecture`, `requirements` FR-025 through FR-029, and existing outbox/event model code.

### Q6. How should local runtime be made functional?

A. Require unknown prebuilt images.
B. Add buildable app/service images or documented dev profiles, prerequisite checks, and readiness/smoke evidence.
C. Only run frontend dev servers.
D. Only validate markdown.
E. Production deployment first.
X. Other (please specify)

[Answer]: B - `requirements` FR-001 through FR-004 and `component-inventory` identify Compose image and prerequisite gaps.

## Plan Summary

- Keep the current monorepo and bounded contexts.
- Complete the Shared Platform path before downstream modules.
- Use BFF routes as integration adapters.
- Use identity-service for authorization and reference-data-service for reference data ownership.
- Use PostgreSQL-backed adapters for local persistence and transactional outbox.
- Use seed apply, contract checks, and readiness checks as evidence surfaces.


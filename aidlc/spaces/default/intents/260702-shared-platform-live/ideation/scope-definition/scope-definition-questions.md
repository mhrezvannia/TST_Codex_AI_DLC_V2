# Scope Definition Questions - Shared Platform Local Functionality

## Context

This questions file consumes `intent-statement`, `feasibility-assessment`, and `constraint-register`. The user requested continued execution without optional questions until Shared Platform is real functional. Therefore, answers are derived from the existing docs, prior AI-DLC artifacts, and the explicit project memory decision that Charge, Booking, Container Movement, and M0-M4 follow after this intent.

## Questions and Answers

### Q1. What is the minimum viable scope that delivers value?

A. UI-only polish on the existing scaffold.
B. Backend-only compile/test cleanup.
C. Full local Shared Platform functionality: runtime services, auth, reference-data mutations, seeds, events, contracts, and quality gates.
D. Expand immediately into Charge, Booking, and Container Movement.
E. Production deployment before local functionality.
X. Other (please specify)

[Answer]: C - Full local Shared Platform functionality: runtime services, auth, reference-data mutations, seeds, events, contracts, and quality gates. This matches the `intent-statement` success metrics and the feasibility recommendation.

### Q2. Which capabilities are must-have for this intent?

A. Local toolchain/runtime baseline only.
B. Reference-data service, identity/auth, BFF integration, seed apply mode, Kafka/outbox, contract evidence, and quality gates.
C. Customer booking and container movement workflows.
D. External finance integration.
E. Marketing or landing-page work.
X. Other (please specify)

[Answer]: B - Reference-data service, identity/auth, BFF integration, seed apply mode, Kafka/outbox, contract evidence, and quality gates. Charge, Booking, Container Movement, and finance integration stay out of scope.

### Q3. What is nice-to-have or explicitly deferred?

A. Production promotion, external finance integration, public customer identity, DCSA T&T, multi-currency/multi-entity, and downstream module runtime work.
B. Reference-data mutation flows.
C. Seed apply mode.
D. Keycloak local bootstrap.
E. Backend tests.
X. Other (please specify)

[Answer]: A - Production promotion, external finance integration, public customer identity, DCSA T&T, multi-currency/multi-entity, and downstream module runtime work are deferred. They are not required to make the Shared Platform locally functional and integration-ready.

### Q4. What sequencing preference should drive the backlog?

A. Visual polish first.
B. Dependency-first with risk-first checks: local prerequisites, service runtime, auth, reference data, seeds/events, then contracts and operational evidence.
C. Build downstream modules before platform dependencies.
D. Production pipeline first.
E. Defer backend and rely on static BFF data.
X. Other (please specify)

[Answer]: B - Dependency-first with risk-first checks. The feasibility blockers show Java/Maven/Docker/image packaging/runtime are prerequisites before UI mutation flows can be proven end-to-end.

### Q5. Are there hard deadlines tied to specific capabilities?

A. No calendar deadline is documented; use a readiness gate based on functional evidence.
B. Ship UI screenshots immediately.
C. Complete Charge module in this intent.
D. Complete production release in this intent.
E. Skip evidence and proceed to downstream modules.
X. Other (please specify)

[Answer]: A - No calendar deadline is documented. The hard gate is evidence-based: the stack must run locally, key flows must work, and quality gates must pass before downstream modules start.

## Analysis

No contradictions remain after applying project memory and feasibility constraints. The scope is intentionally narrower than the full LinerCore MVP: it completes Shared Platform functionality, then preserves the remembered follow-on order for the three business modules and integration milestones.

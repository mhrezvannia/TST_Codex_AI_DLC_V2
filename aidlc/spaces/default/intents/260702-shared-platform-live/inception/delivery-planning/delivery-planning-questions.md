# Delivery Planning Questions - Shared Platform Local Functionality

## Context

This delivery plan consumes `requirements`, `stories`, `mockups`, `components`, `unit-of-work`, `unit-of-work-dependency`, `unit-of-work-story-map`, and `team-practices`. Answers are inferred from approved artifacts and the user's standing instruction to continue until Shared Platform is functional.

## Questions and Answers

### Q1. Which sequencing heuristic applies?

A. Value-first.
B. Risk-first.
C. Walking-skeleton-first with risk-first follow-through.
D. Calendar-first.
E. Team-preference-first.
X. Other (please specify)

[Answer]: C - `team-practices` explicitly requires a gated walking skeleton, and current risks are runtime, BFF/static data, persistence, events, Java/Maven, and Docker.

### Q2. Should WSJF-style scoring be used?

A. No scoring.
B. Lightweight qualitative WSJF using value, risk reduction, dependency enablement, and job size.
C. Heavy numeric portfolio scoring.
D. Deadline-only scoring.
E. Randomized order.
X. Other (please specify)

[Answer]: B - A lightweight model is enough for this local Shared Platform feature scope.

### Q3. What Bolt granularity should be used?

A. One Bolt per file.
B. Bundle related units when necessary to prove an end-to-end confidence hypothesis.
C. One Bolt for everything.
D. One Bolt per downstream module.
E. Documentation-only Bolts.
X. Other (please specify)

[Answer]: B - The first walking skeleton must touch multiple units; later Bolts can be narrower.

### Q4. Can Bolts run in parallel?

A. Yes, all Bolts parallel.
B. First walking skeleton is strictly gated and serial; later independent work may run in parallel only if the autonomy ladder allows it.
C. No gates anywhere.
D. Parallel before dependencies are met.
E. Production deployment parallel with construction.
X. Other (please specify)

[Answer]: B - This honors `team-practices` and the AI-DLC Construction gate model.

### Q5. What external dependencies can block delivery?

A. None.
B. Local Java 21, Maven 3.9+, Docker daemon, ports, and optional self-hosted runner are blocking environment dependencies.
C. Public cloud accounts.
D. Downstream business module teams.
E. Finance provider credentials.
X. Other (please specify)

[Answer]: B - These blockers were identified by feasibility, `requirements`, and `team-practices`.

## Plan Summary

- Heuristic: walking-skeleton-first plus risk-first follow-through.
- First Bolt: gated walking skeleton across local runtime, auth, identity, reference-data service, BFF, persistence, outbox/status.
- Later Bolts: write UX, seed apply, contracts, readiness evidence.
- Parallelism: no parallelism before walking skeleton gate; after that, only dependency-safe parallelism if allowed by the autonomy ladder.
- Scope guard: no Charge, Booking, Container Movement, public cloud, or production deployment.


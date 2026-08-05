# CI/CD Pipeline - U02 Reference Validation

## Verification Stages

The pipeline builds Booking and Reference Data with the pinned Java/Maven stack, then runs domain mapping, HTTP adapter, auth filter, repository transaction, and BFF tests. Contract fixtures prove exact reference field names/status behavior. Concurrency tests verify executor size 10, queue 20, four-task request cap, ten-permit semaphore, 25 ms overload, 2-second deadline, cancellation of unstarted work, and discard of late in-flight completion.

Compose tests seed the canonical reference sets, drive active/inactive/missing validation through nginx, interrupt Reference Data and Booking at each capture/evaluate/apply boundary, and prove no DB lock spans HTTP. Browser tests cover searchable controls, value retention, field-linked errors, unavailable versus invalid states, and no direct internal service call.

## Security and Quality Gates

Blocking checks cover local token role, header spoofing, bad token, browser override, input/cardinality/body limits, SQL/HTML injection strings, log redaction, dependency scan, changed-code line coverage >=80 percent, accessibility/no-overlap, and non-local fail-closed startup. Static checks reject authoritative caches, cross-service SQL, unbounded executors/queues, implicit HTTP retries, and fallback reference records.

## Promotion and Recovery

Promotion uses the existing Compose app/full profile with PostgreSQL host 55432 and real Reference Data. The fixed performance/overload/outage suite must pass before U02 evidence is attached to the W1 run. Rollback is application-image rollback only; additive Booking state remains readable and no reference data is copied into Booking. Both audit detector suites remain blocking.

## Source Coverage

Pipeline enforces `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md` and `services.md`, and U02 `business-logic-model.md`.

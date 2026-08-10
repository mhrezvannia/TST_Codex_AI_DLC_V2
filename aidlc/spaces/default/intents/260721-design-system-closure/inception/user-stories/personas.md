# Personas — W2-02 Design-System Closure

## Source and Persona Strategy

These personas translate the numbered gates in `requirements.md` into human outcomes. `business-overview.md` establishes the authenticated Booking journey and stakeholder purposes; `component-inventory.md` identifies the shell, Booking, `@erp/ui`, acceptance stack, and evidence seams; and `team-practices.md` requires risk-based tests and a canonical live skeleton. They are role-based, not demographic inventions.

## P1 — Mina, Booking Operator

- **Role:** Booking desk or customer-service operator using LinerCore for repeated operational work.
- **Priority:** Primary.
- **Goals:** Find bookings quickly; create, validate, price, and confirm without switching applications; understand state and next action; recover without re-entering valid data.
- **Pain points:** Duplicate navigation, inconsistent controls, blank loading screens, lost form state, inaccessible feedback, and unclear denied/degraded behavior.
- **Technical comfort:** Medium; expert in shipping operations, not implementation details.
- **Frequency/context:** Frequent keyboard-heavy desktop use, with occasional narrow-screen access and time pressure.
- **Success signal:** Completes list → create → validate → price → confirm → detail in one authenticated shell with visible focus and clear announcements.

## P2 — Arun, Frontend Developer

- **Role:** Developer maintaining Booking presentation and the shared W2-02 UI boundary.
- **Priority:** Secondary but closure-critical.
- **Goals:** Compose Booking from documented `@erp/ui` tokens/primitives; preserve shell/BFF ownership; receive immediate lint/test feedback when presentation drifts.
- **Pain points:** Duplicated local palettes and chrome, ambiguous native-element policy, package declarations without consumption, and enforcement that ignores CSS or local style objects.
- **Technical comfort:** High.
- **Frequency/context:** Works in the TypeScript/Next.js monorepo and must avoid app-to-app coupling or backend behavior changes.
- **Success signal:** Can explain every Booking presentation primitive or documented semantic exception, and negative probes reject forbidden drift.

## P3 — Leila, Quality and Release Reviewer

- **Role:** Reviewer accountable for reproducible W2-02 acceptance and truthful program status.
- **Priority:** Secondary but closure-critical.
- **Goals:** Reproduce the live happy path and difficult-state matrix; correlate every artifact to a requirement; distinguish hard PASS from pending, failed, or historically waived evidence.
- **Pain points:** Screenshots without routes or commands, source-only claims, masked audit exits, detached mocks, missing viewport/theme/state coverage, and historical waivers relabeled as passes.
- **Technical comfort:** High.
- **Frequency/context:** Runs isolated Compose, Playwright, static/build checks, and both project audits at release gates.
- **Success signal:** Obtains a green, requirement-indexed `artifacts/w2-02-live/` package and closes W2-02 only after every gate passes.

## P4 — Reza, Manager-Demo Owner

- **Role:** Owner of the protected manager demonstration at `http://127.0.0.1:8088`.
- **Priority:** Safeguard persona.
- **Goals:** Keep the manager demo continuously available while Wave A acceptance runs; receive objective before/after guard evidence.
- **Pain points:** Test sessions targeting the wrong Compose project, port collisions, unrecorded restarts, or cleanup that stops the shared demo.
- **Technical comfort:** Medium to high.
- **Frequency/context:** Depends on `linercore-shared-platform` while the closure uses the separate `linercore-wave-a` stack.
- **Success signal:** Both demo guards are green and evidence shows no targeting or reconfiguration of the protected project.

## Relationships and Priority

Mina receives direct operational value. Arun makes the shared UI boundary maintainable. Leila proves Mina’s and Arun’s outcomes on the canonical runtime. Reza constrains how Leila may run acceptance. The ordering is not permission to drop a persona: all four outcomes are Must within the same closure epic.

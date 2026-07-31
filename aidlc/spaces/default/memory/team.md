# Team-Level Rules

> This team's affirmed practices and corrections. Overrides aidlc-org.md.
> Populated by practices-discovery affirmation gate. Edit at the gate,
> not directly.

## Way of Working
W2-03 stays on the short-lived `intent/W2-03-charge-tariffs-and-agreements` branch from the common Wave A baseline and integrates through `integ/main-reconciled` under `docs/intents/00-INTENT-BACKLOG.md`. One stream-aligned intent mob owns the vertical flow; this scoped program practice does not rewrite the repository as plain trunk-to-`main` or invent an unobserved merge style.

## Walking Skeleton
The first Construction slice is a gated risk-first Charge-to-Booking walking skeleton: one real approved rate produces one attributable itemised line, Booking stores and renders it, and evidence remains honest about live-runtime status. Full OFR, BAF, POL THC, repricing, and no-rate behavior build on that spine rather than arriving as disconnected horizontal batches.

## Testing Posture
Tests are written alongside code with at least 80 percent line coverage for changed Charge and Booking code. Coverage is necessary but insufficient: domain/version/matching, additive migration, producer-consumer contract, typed snapshot compatibility, repricing, explicit `MANUAL_PRICING_REQUIRED`, Charge UI, Playwright, isolated Compose, demo-guard, `aidlc-audit`, and `erp-fidelity-audit` evidence are required, and Charge lint/build join the blocking quality path.

## Deployment
The canonical W2-03 acceptance environment is the isolated `linercore-wave-a` stack driven only through `scripts/wave-a-compose.mjs`, with `npm run demo:guard` before and after to protect the manager demo. Current CI is validation, not an established production deployment pipeline; staging topology, production cadence, cloud deployment, and continuous delivery remain unclaimed and out of this feature.

## Code Style
Java preserves the existing ports-and-adapters structure, framework-free domain core, service-owned databases, immutable value objects, explicit identifiers/statuses, and typed boundary outcomes or translated exceptions with correlation data. TypeScript remains strict and feature-local in `apps/charge-agreements`, reuses shared auth and `@erp/ui`, and does not redesign `packages/ui`, shell, navigation, typography, or palette; an unobserved `Result<T,E>` convention is not imposed.

## W2-02 Closure Preservation
Closure work uses the smallest canonical live journey that proves the existing architecture and the unresolved Definition-of-Done gap together. W2-02 proves authenticated `/booking` through the shared shell, Booking BFF/backend, shared UI states, and isolated live evidence.

W2-02 tests are written alongside focused changes, and defects are reproduced with a failing test before repair when practical. Unit, component, contract, type, lint, and build checks are necessary but insufficient; the integrated live journey, UI matrix, demo safety, and audits remain hard gates, with no invented percentage target.

W2-02 deploys only to the isolated local `linercore-wave-a` acceptance stack through the approved wrapper, with demo guards before and after. Production promotion is outside the intent, and no external pipeline, environment, or rollback capability is assumed without evidence.

W2-02 frontend work uses strict TypeScript/Next.js workspace boundaries and `@erp/ui` tokens and primitives for applicable presentation. Native semantic elements are allowed only as documented, tested exceptions; module-local theme systems and duplicate shell/navigation are prohibited.

## W2-04 Container Movement Delivery
W2-04 is delivered as one stream-aligned vertical intent on its short-lived
intent branch, preserving merged program work and synchronizing with the
integration baseline after W2-02. Contract, UI, and acceptance seams are
co-reviewed by their bounded owners rather than broadened through shared-file
rewrites.

PB-01 is the gated walking skeleton: one real `booking.confirmed` creates a
planned journey, one accepted GTOT publishes status, and Booking renders the
projection. Later lifecycle depth builds only after that broker-to-database-to-
Booking path and one observable invalid transition are proven.

Tests are written alongside code and selected by acceptance risk, with explicit
domain transition, duplicate, sequence, contract, migration, consumer, UI, and
live-path coverage. Deterministic failures fail closed, without inventing a
numeric coverage floor that the repository cannot enforce.

Pull-request and integration CI block on the established fast Java and frontend
gates. W2-04 final release acceptance is a separately serialized, manual
blocking run on `linercore-wave-a`; one evidence-preserving retry is allowed
only for an environmental failure, and the manager demo at port 8088 remains
guarded.

Java keeps the framework-free domain, application ports, adapter, and Spring
container layering with current EditorConfig conventions; TypeScript keeps
strict Next.js/React patterns and shared `@erp/ui` tokens. Domain rejection is
explicit and stable while exceptions remain mapped at REST or infrastructure
boundaries; W2-04 adds no new universal formatter mandate.

## Forbidden

<!-- Team-specific forbidden patterns -->

## Mandated

<!-- Team-specific mandates -->

## Corrections

<!-- Self-learning loop appends here. -->

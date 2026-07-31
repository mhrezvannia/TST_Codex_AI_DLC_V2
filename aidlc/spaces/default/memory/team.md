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

## Forbidden

<!-- Team-specific forbidden patterns -->

## Mandated

<!-- Team-specific mandates -->

## Corrections

<!-- Self-learning loop appends here. -->

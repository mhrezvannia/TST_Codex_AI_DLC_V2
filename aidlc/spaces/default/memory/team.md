# Team-Level Rules

> This team's affirmed practices and corrections. Overrides aidlc-org.md.
> Populated by practices-discovery affirmation gate. Edit at the gate,
> not directly.

## Way of Working
Deliver W3-01 on its short-lived intent branch as a small, risk-first vertical. Preserve W2-03 contracts and service ownership, require the named approval gates and maintainer fixture signoff, and keep every increment reviewable across domain, contract, UI, and evidence.

## Walking Skeleton
Prove the smallest real Charge-owned path first: versioned D&D terms and port-local calculator, additive provider response and signed fixtures, then LinerCore UI and live acceptance. Contract, persistence, calculation, UI, and proof travel with the slice that exercises them rather than becoming horizontal releases.

## Testing Posture
Write focused tests alongside changes, using regression-first when practical rather than claiming strict TDD. Require at least 80% changed-line coverage for touched Charge backend and Charge UI production code, plus blocking deterministic rule/boundary tests, contract fixtures, Playwright accessibility, isolated Compose, demo guards, `aidlc-audit`, and `erp-fidelity-audit` evidence.

## Deployment
CI is a blocking validation surface, not an established production deployment pipeline. W3-01 acceptance is the isolated local Compose topology only; do not infer production cloud, promotion, rollback, availability, capacity, backup, or disaster-recovery commitments.

## Code Style
Preserve Java ports-and-adapters boundaries with framework-free domain modules, service-owned persistence, immutable values, explicit identifiers/statuses, typed exceptions, correlation evidence, and boundary translation. Keep TypeScript strict and feature-local, reuse authenticated shell and `@erp/ui`, and evolve `pricing.v1` additively without a new D&D service or cross-service persistence access.

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

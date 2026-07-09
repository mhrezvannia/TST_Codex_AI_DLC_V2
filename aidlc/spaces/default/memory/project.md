# Project-Level Rules

> Project-specific overrides and corrections. Overrides aidlc-team.md
> and aidlc-org.md. Populated by practices-discovery and the
> self-learning loop.
>
> Use sparingly: most teams don't need a project layer. Reach for it
> only when this specific project deviates from team-wide practice in a
> stable, durable way (e.g., "this monorepo project rebases even though
> our team default is squash"; "this legacy project skips the test
> floor because the existing suite is unsalvageable and we accept
> that").

## Way of Working

<!-- Project-specific override. Example: -->
<!-- This monorepo project rebases instead of squash-merging because -->
<!-- the per-package commit history is the audit trail we depend on -->
<!-- for partial-rollback decisions. Override applies to this project -->
<!-- only. -->

## Walking Skeleton

<!-- Project-specific override. Example: -->
<!-- This project skips the walking skeleton because we're rewriting -->
<!-- an existing service in-place â€” there's no greenfield bootstrap -->
<!-- to gate. -->

## Testing Posture

<!-- Project-specific override. -->

## Deployment

<!-- Project-specific override. -->

## Code Style

<!-- Project-specific override. -->

## Tech Stack

<!-- Technology choices locked for this project. -->

## Decided

<!-- Decisions made in earlier stages that should not be re-asked. -->
<!-- Format: DECIDED: [decision] (Stage [slug], [date]) -->

DECIDED: After making Shared Platform locally functional and integration-ready, proceed in this order: 1) build Charge & Customer Agreement, 2) build Customer Booking, 3) build Container Movement Management, 4) run integration milestones M0-M4 to prove the full LinerCore MVP journey. (Stage intent-capture, 2026-07-02)

## Scope Overrides

<!-- Custom scope rules for this project. -->

## Forbidden

<!-- Populated by practices-discovery affirmation gate. -->
<!-- Format: NEVER [behavior] (affirmed [date]) -->
<!-- Example: NEVER throw exceptions across service layer boundaries (affirmed 2026-05-17) -->

NEVER use long-lived release branches by environment for this workflow. (affirmed 2026-06-30)
NEVER skip the walking-skeleton ceremony for this greenfield MVP. (affirmed 2026-06-30)
NEVER treat Charge, Booking, or Container Movement runtime work as part of this Shared Platform workflow. (affirmed 2026-06-30)
NEVER introduce backend domain-core dependencies on frameworks or non-Java JVM languages. (affirmed 2026-06-30)
NEVER use prohibited frontend libraries or package managers outside the Enterprise Technical Environment v1.1 frontend standard. (affirmed 2026-06-30)
NEVER expand the first Charge Agreement slice into full RMS, public tariffs, spot-rate marketplace, index-linked pricing, carrier connectivity, invoicing, or payment settlement. (affirmed 2026-07-05)
NEVER ship the Charge Agreement UI as view-only and call the module complete. (affirmed 2026-07-05)
NEVER start Customer Booking implementation before approved active-agreement lookup is implemented and verified. (affirmed 2026-07-05)
NEVER hide Docker, Kafka, Schema Registry, or Keycloak blockers as successful local readiness evidence. (affirmed 2026-07-05)
NEVER collapse the enterprise domains into one service or one shared database ownership model. (affirmed 2026-07-08)
NEVER allow one service to query another service's domain database or rely on cross-module SQL joins. (affirmed 2026-07-08)
NEVER hide Docker, Kafka, Schema Registry, Keycloak, or service health blockers as successful local readiness. (affirmed 2026-07-08)
NEVER claim completion from documents, diagrams, skeleton APIs, mock screens, hardcoded business results, or containers merely starting. (affirmed 2026-07-08)
NEVER copy fake Claude UI prototype business logic as implementation authority when it conflicts with authoritative requirements. (affirmed 2026-07-08)
NEVER start Booking construction before the approved active-agreement lookup and pricing contract readiness needed by Booking are verified. (affirmed 2026-07-08)
NEVER treat raw Claude UI HTML or screenshots as semantically Graphify-indexed exact source paths until Graphify evidence proves that indexing. (affirmed 2026-07-08)
NEVER bypass manual production approval or weaken least-privilege service security to speed local delivery. (affirmed 2026-07-08)
## Mandated

<!-- Populated by practices-discovery affirmation gate. -->
<!-- Format: ALWAYS [behavior] (affirmed [date]) -->
<!-- Example: ALWAYS use Result<T,E> for fallible operations in service layer (affirmed 2026-05-17) -->

ALWAYS use trunk-based development on `main` with short-lived feature or Bolt branches. (affirmed 2026-06-30)
ALWAYS squash-merge each completed Bolt branch into `main`. (affirmed 2026-06-30)
ALWAYS run a gated walking-skeleton Bolt first for this greenfield MVP before asking the autonomy ladder prompt. (affirmed 2026-06-30)
ALWAYS write tests alongside code and enforce CI-blocking quality gates before merge. (affirmed 2026-06-30)
ALWAYS target at least 85% line coverage for both Shared Platform backend services. (affirmed 2026-06-30)
ALWAYS follow Enterprise Technical Environment v1.1 and project configuration for backend, frontend, pipeline, and infrastructure standards. (affirmed 2026-06-30)
ALWAYS deploy merges to staging through GitHub Actions on self-hosted on-premises runners. (affirmed 2026-06-30)
ALWAYS require separate manual approval before production promotion. (affirmed 2026-06-30)
ALWAYS build Charge & Customer Agreement as a separate business module after Shared Platform and before Customer Booking. (affirmed 2026-07-05)
ALWAYS keep backend domain-core free of Spring, persistence, messaging, and frontend dependencies. (affirmed 2026-07-05)
ALWAYS add tests for agreement lifecycle, charge-term validation, API behavior, UI workflows, and active lookup before declaring the module complete. (affirmed 2026-07-05)
ALWAYS consume Shared Platform reference data by stable IDs rather than duplicating customer, charge-code, currency, location, commodity, or trade-lane records. (affirmed 2026-07-05)
ALWAYS keep local auth bypass development-only and prevent unsafe non-local bypass behavior. (affirmed 2026-07-05)
ALWAYS document Docker/Compose health separately from host-runtime readiness evidence. (affirmed 2026-07-05)
ALWAYS use Graphify query, explain, or path before broad architecture decisions or cross-module edits. (affirmed 2026-07-08)
ALWAYS preserve traceability to the completed MVP intent `aidlc/spaces/default/intents/260630-shared-platform`, the `shared-platform-mvp-complete` tag, the current enterprise intent, authoritative documents, and Graphify analysis. (affirmed 2026-07-08)
ALWAYS keep Shared Platform, Charge Calculation and Customer Agreement, Customer Booking, D&D, and Container Movement Management as explicit ownership boundaries. (affirmed 2026-07-08)
ALWAYS deliver the first Construction Bolt as an enterprise walking skeleton that proves a minimal integrated vertical slice before accelerating the remaining module ladder. (affirmed 2026-07-08)
ALWAYS keep backend domain-core modules free of Spring, persistence, messaging, frontend, and infrastructure dependencies. (affirmed 2026-07-08)
ALWAYS write tests alongside implementation and run blocking lint, typecheck, unit, integration, contract, readiness, and smoke gates before merge. (affirmed 2026-07-08)
ALWAYS convert enterprise contract documents into executable OpenAPI, Avro, AsyncAPI, HTTP Pact, and message-pact assets before claiming integration readiness. (affirmed 2026-07-08)
ALWAYS keep Docker Compose readiness evidence separate from host-runtime readiness evidence. (affirmed 2026-07-08)
ALWAYS keep local authentication bypass behavior development-only and prevent unsafe non-local bypass behavior. (affirmed 2026-07-08)
ALWAYS update Graphify after major code or document changes and report semantic indexing limitations honestly. (affirmed 2026-07-08)
## Corrections

<!-- Project-specific corrections from human feedback. -->
<!-- Format: NEVER/ALWAYS [behavior] (learned [date]) -->

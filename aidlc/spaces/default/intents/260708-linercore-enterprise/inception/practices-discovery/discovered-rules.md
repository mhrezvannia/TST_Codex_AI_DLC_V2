# Practices Discovery - Discovered Rules

## Mandated

ALWAYS use Graphify query, explain, or path before broad architecture decisions or cross-module edits.
ALWAYS preserve traceability to the completed MVP intent `aidlc/spaces/default/intents/260630-shared-platform`, the `shared-platform-mvp-complete` tag, the current enterprise intent, authoritative documents, and Graphify analysis.
ALWAYS keep Shared Platform, Charge Calculation and Customer Agreement, Customer Booking, D&D, and Container Movement Management as explicit ownership boundaries.
ALWAYS deliver the first Construction Bolt as an enterprise walking skeleton that proves a minimal integrated vertical slice before accelerating the remaining module ladder.
ALWAYS keep backend domain-core modules free of Spring, persistence, messaging, frontend, and infrastructure dependencies.
ALWAYS write tests alongside implementation and run blocking lint, typecheck, unit, integration, contract, readiness, and smoke gates before merge.
ALWAYS convert enterprise contract documents into executable OpenAPI, Avro, AsyncAPI, HTTP Pact, and message-pact assets before claiming integration readiness.
ALWAYS keep Docker Compose readiness evidence separate from host-runtime readiness evidence.
ALWAYS keep local authentication bypass behavior development-only and prevent unsafe non-local bypass behavior.
ALWAYS update Graphify after major code or document changes and report semantic indexing limitations honestly.

## Forbidden

NEVER collapse the enterprise domains into one service or one shared database ownership model.
NEVER allow one service to query another service's domain database or rely on cross-module SQL joins.
NEVER hide Docker, Kafka, Schema Registry, Keycloak, or service health blockers as successful local readiness.
NEVER claim completion from documents, diagrams, skeleton APIs, mock screens, hardcoded business results, or containers merely starting.
NEVER copy fake Claude UI prototype business logic as implementation authority when it conflicts with authoritative requirements.
NEVER start Booking construction before the approved active-agreement lookup and pricing contract readiness needed by Booking are verified.
NEVER treat raw Claude UI HTML or screenshots as semantically Graphify-indexed exact source paths until Graphify evidence proves that indexing.
NEVER bypass manual production approval or weaken least-privilege service security to speed local delivery.

## Source Context

Rules were derived from `aidlc/spaces/default/codekb/TST_Codex/code-structure.md`, `technology-stack.md`, `dependencies.md`, `code-quality-assessment.md`, `architecture.md`, and `business-overview.md`; from current memory rules in `org.md`, `team.md`, `project.md`, and `phases/inception.md`; from Graphify query, Graphify explain, and Graphify path results; and from the active enterprise scope requiring Shared Platform, Charge Calculation, Customer Agreement, Booking, D&D, CMM, full UI, integrations, local Docker runtime, and Enterprise Operation.

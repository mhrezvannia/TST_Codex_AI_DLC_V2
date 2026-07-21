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

- For brownfield service database changes, use an ordered Flyway baseline plus additive migrations and prove existing-data upgrade, backfill, restart, and restore or forward-repair behavior; destructive reset is not acceptance evidence. (learned 2026-07-15) <!-- cid:application-design:c6 -->
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
NEVER use synchronous Booking-to-CMM or CMM-to-Booking HTTP delivery as the normal path once the W1 Kafka consumers land. (affirmed 2026-07-15)
NEVER claim W1 complete from unit tests, outbox rows, local-noop publication, or container startup without the observed broker-to-database-to-UI flow and both audits. (affirmed 2026-07-15)
NEVER change a contributor module's contract surface without producer/consumer review and synchronized OpenAPI/AsyncAPI/Avro/example/provider evidence. (affirmed 2026-07-15)
NEVER import W2-01 shell/auth, W2-02 implementation scope, D&D, amendments, or broader journey behavior into the W1 thin slice. (affirmed 2026-07-15)
NEVER describe the current CI as security-complete; no SAST, dependency vulnerability, secret scanning, or automated dependency-update workflow was found. (affirmed 2026-07-15)
NEVER accept a mounted Booking path that still sends or falls back to `local-user` in production-like flows. (affirmed 2026-07-18)
NEVER treat static local auth bypass behavior as acceptable outside explicit local/test profiles. (affirmed 2026-07-18)
NEVER introduce a micro-frontend host, public-cloud deployment path, or third-party portal product for W2-01 without an approved scope change. (affirmed 2026-07-18)
NEVER rewrite prior merged W0-01, W0-02, W1-01, or W2-02 work to make the shell slice easier. (affirmed 2026-07-18)
NEVER claim completion from shell chrome, screenshots, unit tests, or container startup without real subject audit evidence and audit gates. (affirmed 2026-07-18)
NEVER create a second canonical frontend for a Phase 1 module or give a module independent shell chrome, navigation, authentication, typography, or palette. (affirmed 2026-07-21)
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
ALWAYS base and merge W1-01 Construction Bolts on `integ/main-reconciled` with short-lived branches and squash commits. (affirmed 2026-07-15)
ALWAYS make the first W1-01 Bolt prove the real bidirectional Kafka journey through a minimal Booking UI read path before accelerating later Bolts. (affirmed 2026-07-15)
ALWAYS write tests alongside W1 code, enforce at least 80 percent line coverage, and require contract, serde, idempotency, restart, and live Compose evidence. (affirmed 2026-07-15)
ALWAYS preserve service-owned databases, framework-free domain-core modules, and exact frozen contract field names across domain and wire representations. (affirmed 2026-07-15)
ALWAYS use the shared `platform-messaging` publisher, schema registrar, scheduled relay, and noop safety rather than duplicating W0 infrastructure. (affirmed 2026-07-15)
ALWAYS run the live W1 stack with PostgreSQL on a non-default host port and retain evidence under `artifacts/`. (affirmed 2026-07-15)
ALWAYS keep W2-01 constrained to shell/auth plus Booking mount unless a later approved scope change says otherwise. (affirmed 2026-07-18)
ALWAYS preserve W1-01 live-proof evidence as blocked or waived unless a new observed live run proves otherwise. (affirmed 2026-07-18)
ALWAYS use the existing auth app, Keycloak/OIDC, and identity-service authorization seams before adding new identity mechanisms. (affirmed 2026-07-18)
ALWAYS prove mounted Booking calls carry the authenticated subject through BFF and backend evidence. (affirmed 2026-07-18)
ALWAYS run W2-01 acceptance through local Compose and Nginx with Keycloak available. (affirmed 2026-07-18)
ALWAYS keep W2-02 design-system foundation and W4-01 broad module migration out of W2-01 implementation scope. (affirmed 2026-07-18)
ALWAYS invoke the project `ui-ux-pro-max` skill for every UI-bearing intent, load `design-system/linercore/MASTER.md` before design or code generation, and record any page-specific override under `design-system/linercore/pages/`. (affirmed 2026-07-21)
ALWAYS deliver Phase 1 module UI through the shared authenticated shell and verify changed screens at 375px, 768px, 1024px, and 1440px with keyboard, loading, empty, error, denied, light-theme, and dark-theme evidence. (affirmed 2026-07-21)
## Corrections

<!-- Project-specific corrections from human feedback. -->
<!-- Format: NEVER/ALWAYS [behavior] (learned [date]) -->
- Treat LinerCore vertical intents as internal carrier-platform capabilities; research operational table stakes and build-vs-buy alternatives without unsupported SaaS market-size claims. (learned 2026-07-15) <!-- cid:market-research:c1 -->
- Evaluate LinerCore vertical intents against the canonical local Compose runtime first; cloud deployment is a later operation concern unless an approved requirement makes it a release blocker. (learned 2026-07-15) <!-- cid:feasibility:c1 -->
- Prefer an explicit Kafka-only cutover for asynchronous cross-module contracts over indefinite HTTP plus Kafka dual delivery. (learned 2026-07-15) <!-- cid:feasibility:c2 -->
- Treat the worked W1-01 thin journey as the minimum release, not as a menu of independently deferrable backend and frontend pieces. (learned 2026-07-15) <!-- cid:scope-definition:c1 -->
- Prioritize a walking skeleton with risk-first contract and migration work over horizontal component batches; each increment must preserve a path to observable user value. (learned 2026-07-15) <!-- cid:scope-definition:c2 -->
- Represent repository ownership and review responsibilities as roles without inventing named human staff, capacity, or availability. (learned 2026-07-15) <!-- cid:team-formation:c1 -->
- Use one stream-aligned intent delivery mob with specialist review hats rather than horizontal teams when a thin journey crosses multiple modules and needs one accountable driver. (learned 2026-07-15) <!-- cid:team-formation:c2 -->
- Treat W1-01 UI as a Booking-local operational list/create/detail experience; global shell and authentication remain W2-01 even when broader enterprise mockups exist. (learned 2026-07-15) <!-- cid:rough-mockups:c1 -->
- Inherit the W2-02 operational-console visual language for W1-01 only; adapt it to the journey without importing global shell, full design-system migration, fake capacity, D&D, or broader equipment behavior. (learned 2026-07-15) <!-- cid:rough-mockups:c2 -->
- When a mandatory named reviewer cannot start because its fixed model is unsupported by the active Codex account, retry through an independent default sub-agent that loads the same reviewer persona and preserves the same read/write boundary. (learned 2026-07-15) <!-- cid:rough-mockups:c4 -->
- Prefer stable list, create, and detail routes over a single workbench for operational journeys that require browser navigation, state recovery, and a shareable detail location. (learned 2026-07-15) <!-- cid:rough-mockups:c5 -->
- Treat an Ideation handoff as approval of a risk-controlled initiative, not as a promise of unsupported budget, staffing, velocity, or completion date. (learned 2026-07-15) <!-- cid:approval-handoff:c1 -->
- Proceed with W1-01 targeted build on adopted W0 and standards infrastructure rather than blocking the thin journey on a program-level suite procurement decision. (learned 2026-07-15) <!-- cid:approval-handoff:c2 -->
- Treat current source and contracts as authoritative when the checked-in Graphify index omits recent service work; retain the graph as the first discovery layer and record its staleness explicitly. (learned 2026-07-15) <!-- cid:reverse-engineering:c2 -->
- Complete developer and architect work inline only after the user selects that recovery path; preserve the delegation failure in the freshness artifact instead of claiming sub-agent execution. (learned 2026-07-15) <!-- cid:reverse-engineering:c5 -->
- Resolve contradictions between checked-in executable contracts and authoritative enterprise contracts explicitly before generating requirements, because either choice changes public field names, endpoints, and test evidence. (learned 2026-07-15) <!-- cid:requirements-analysis:c3 -->
- Model live and audit acceptance through a release-review role while keeping the business user primary; this preserves business value and testability without inventing named staff. (learned 2026-07-15) <!-- cid:user-stories:c3 -->
- Keep operator-facing transport details out of primary screens and expose correlation or event identity only through a collapsed Audit surface; users need actionable pending and retry evidence rather than Kafka internals in the main journey. (learned 2026-07-15) <!-- cid:refined-mockups:c3 -->
- Use a thin transport listener that invokes one transactional application-service boundary for event receipt, business state, and resulting outbox when a second generic inbox relay would add latency and no independent recovery value. (learned 2026-07-15) <!-- cid:application-design:c5 -->
- Before proposing or reviewing Units of Work, load the binding unit template and validate that every unit is a live vertical story slice; contracts, migrations, backend, UI, and evidence must travel inside the slice that exercises them rather than becoming standalone layer units. (learned 2026-07-15) <!-- cid:units-generation:c2 -->
- When multiple vertical slices change one service database, assign the ordered migration chain and files to one explicit unit; later slices consume the prepared schema and must not co-own or rewrite those migration files. (learned 2026-07-15) <!-- cid:units-generation:c8 -->
- When economic value, time-cost, and job-size inputs are not supplied, use an explicit ordinal value, risk-reduction, time-criticality, and relative-size rationale instead of fabricating numeric WSJF precision. (learned 2026-07-15) <!-- cid:delivery-planning:c2 -->
- For local Compose acceptance, describe transaction durability as atomic effects and committed-state survival within existing volumes; do not claim zero data loss after host or volume destruction unless WAL or replication mechanisms exist. (learned 2026-07-16) <!-- cid:nfr-requirements:c1 -->
- Use explicit local tokens and least-privilege roles only under the local profile, and fail every non-local profile until W2-01 authenticated identity and transport controls are implemented. (learned 2026-07-16) <!-- cid:nfr-requirements:c2 -->

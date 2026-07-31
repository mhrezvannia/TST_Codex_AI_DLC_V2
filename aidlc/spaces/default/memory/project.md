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
- For W2-03 performance validation, execute and report the exact requirement-bound fixtures, warm-ups, concurrency, sample populations, percentile algorithms, contention rounds, and resource cycles before adding generic stress, soak, auto-scaling, or production-capacity claims. (learned 2026-07-30) <!-- cid:performance-validation:c3 -->
## Deployment

<!-- Project-specific override. -->

## Code Style

<!-- Project-specific override. -->

## Tech Stack

<!-- Technology choices locked for this project. -->
- Treat AWS specialist input as portability and operational-quality review when an approved slice targets the canonical on-premises Compose topology; do not turn it into public-cloud expansion. (learned 2026-07-21) <!-- cid:application-design:c2 -->
- Treat RTK as unavailable when the binding Enterprise Technical Environment prohibits it; use server-rendered reads and focused local client state unless the standard changes. (learned 2026-07-21) <!-- cid:application-design:c3 -->

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
NEVER target the `linercore-shared-platform` Docker Compose project from a Wave A worktree or run an unscoped `docker compose down`; that project is the continuously available manager demo. (affirmed 2026-07-21)
NEVER infer a universal squash or no-fast-forward merge rule solely from local git history. (affirmed 2026-07-21)
NEVER invent a coverage percentage, scanner pass, deployment environment, or branch-protection guarantee without executable evidence. (affirmed 2026-07-21)
NEVER use the protected linercore-shared-platform manager demo as a closure acceptance target. (affirmed 2026-07-21)
NEVER treat package tests, detached module pages, screenshots alone, or the historical W1 waiver as canonical live proof. (affirmed 2026-07-21)
NEVER create a module-local theme, duplicate authenticated shell/navigation, or second frontend for W2-02. (affirmed 2026-07-21)
NEVER replace correct native semantics merely to satisfy wrapper-counting; exceptions must remain explicit and testable. (affirmed 2026-07-21)
NEVER call the hardcoded Charge workbench, static documents, unit tests, container startup, or unavailable Docker access a W2-03 live or release PASS. (affirmed 2026-07-21)
NEVER flatten a successful W2-03 price into lossy string-only lines or represent no-rate as zero, guessed, partial, or transient-failure pricing. (affirmed 2026-07-21)
NEVER redesign `packages/ui`, shared shell, navigation, typography, palette, or another domain's pages as part of Charge-owned W2-03 UI work. (affirmed 2026-07-21)
NEVER query another service's database, bypass the existing Booking-to-Charge pricing port, or move pricing authority into a generic shared UI/service layer. (affirmed 2026-07-21)
NEVER rewrite the W1 blocked/waived history as a real PASS or weaken W0-01, W0-02, W1-01, W2-01, or W2-02 evidence to simplify this feature. (affirmed 2026-07-21)
NEVER describe the current CI as security-complete or expand W2-03 into repository-wide SAST, DAST, secret/CVE/image scanning, SBOM, signing, or deployment modernization without a separately approved scope change. (affirmed 2026-07-21)
NEVER treat a silent duplicate replay, timestamp-only ordering, outbox row, container startup, or screenshot as W2-04 acceptance. (affirmed 2026-07-21)
NEVER run ordinary pull-request CI against the single shared Wave A live stack. (affirmed 2026-07-21)
NEVER introduce a universal Java formatter or result-type migration as incidental W2-04 scope. (affirmed 2026-07-21)
NEVER redesign `packages/ui`, the shared shell, or Booking while adding Container Movement-owned composition. (affirmed 2026-07-21)
NEVER relabel an environmental block or accepted waiver as PASS. (affirmed 2026-07-21)
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
ALWAYS run Wave A Compose work through `node scripts/wave-a-compose.mjs`, serialize live acceptance on the isolated `linercore-wave-a` stack, and run `npm run demo:guard` before and after acceptance. (affirmed 2026-07-21)
ALWAYS use a short-lived program intent branch from the explicitly protected integration baseline. (affirmed 2026-07-21)
ALWAYS make final integration mode an explicit program-owner decision when written rules and observed history conflict. (affirmed 2026-07-21)
ALWAYS write focused tests alongside changes and reproduce defects with a failing regression test when practical. (affirmed 2026-07-21)
ALWAYS require canonical integrated live proof, demo safety, and mandated audits in addition to static and component checks for UI closure. (affirmed 2026-07-21)
ALWAYS use scripts/wave-a-compose.mjs and the linercore-wave-a project for W2-02 live acceptance. (affirmed 2026-07-21)
ALWAYS use @erp/ui tokens and applicable primitives for shared presentation, documenting and testing any native-semantic exception. (affirmed 2026-07-21)
ALWAYS preserve service, BFF, authenticated-shell, and package ownership boundaries during design-system closure. (affirmed 2026-07-21)
ALWAYS keep W2-03 on its Wave A intent branch and integrate through `integ/main-reconciled` according to the program backlog dependency and merge protocol. (affirmed 2026-07-21)
ALWAYS make the first W2-03 Construction slice prove one real approved Charge rate line stored and rendered by Booking before expanding the pricing journey. (affirmed 2026-07-21)
ALWAYS write tests alongside W2-03 code, enforce at least 80 percent line coverage for changed Charge and Booking code, and add Charge lint/build to blocking quality gates. (affirmed 2026-07-21)
ALWAYS require domain, additive-migration, provider-consumer contract, typed-snapshot compatibility, repricing, manual-state, Playwright, isolated Compose, demo-guard, `aidlc-audit`, and `erp-fidelity-audit` evidence before release completion. (affirmed 2026-07-21)
ALWAYS preserve Charge pricing authority, Booking snapshot/UI ownership, service-owned databases, framework-free domain cores, session-derived actors, correlation/idempotency metadata, and typed failure semantics. (affirmed 2026-07-21)
ALWAYS use `scripts/wave-a-compose.mjs` with the isolated `linercore-wave-a` project and run `npm run demo:guard` before and after live acceptance. (affirmed 2026-07-21)
ALWAYS preserve fail-closed non-local profile/session/secret controls, immutable dependency installation, least-privilege workflow permissions, and explicit local-only credentials. (affirmed 2026-07-21)
ALWAYS deliver W2-04 as vertical increments that retain domain, persistence, contract, Booking projection, UI, and observed evidence. (affirmed 2026-07-21)
ALWAYS run the PB-01 broker-to-database-to-Booking walking skeleton before deeper lifecycle increments. (affirmed 2026-07-21)
ALWAYS write risk-based tests alongside code for every legal transition and every duplicate or out-of-sequence rejection. (affirmed 2026-07-21)
ALWAYS preserve service-owned databases, framework-free domain code, exact contract names, and producer/consumer co-review. (affirmed 2026-07-21)
ALWAYS keep final Wave A live acceptance serialized, run the demo guard before and after, and retain evidence from any environmental retry. (affirmed 2026-07-21)
ALWAYS preserve the historical W1 BLOCKED record and waiver separately from the later real PASS and new W2-04 evidence. (affirmed 2026-07-21)
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
- Preserve the existing Container Movement service and aggregate seam for brownfield journey work; refactor intake through typed collaborators instead of replacing the aggregate. (learned 2026-07-21) <!-- cid:application-design:c1 -->
- Apply last-known behavior only to business and reference-data freshness, never to authorization; Identity must authorize every new read, while an authorized persisted route view may remain readable during a Reference Data outage with capture disabled. (learned 2026-07-21) <!-- cid:application-design:c4 -->
- Prefer additive evolution at verified domain, persistence, contract, projection, authorization, and UI ports over new services or synchronous shortcuts in brownfield vertical intents. (learned 2026-07-21) <!-- cid:application-design:w2-04-c6 -->
- Persist an immutable idempotency disposition plus append-only per-attempt evidence so accepted, rejected, replayed, conflicting-fingerprint, and concurrent outcomes cannot double-advance business state. (learned 2026-07-21) <!-- cid:application-design:c7 -->
- Fence outbox completion with worker identity, claim token, and monotonically increasing version so stale workers cannot corrupt at-least-once publication state. (learned 2026-07-21) <!-- cid:application-design:c8 -->
- Use the approved PB-01 broker-to-Booking journey as the W2-04 walking skeleton: booking.confirmed, journey persistence, first GTOT status publication, Booking projection, operator timeline, and one observable invalid transition travel together. (learned 2026-07-21) <!-- cid:units-generation:c1 -->
- Keep distributed transaction and cross-module contract seams inside the vertical increment whose observed behavior proves them; do not defer those seams to integration-only or final-test units. (learned 2026-07-21) <!-- cid:units-generation:c3 -->
- Keep independent program AI-DLC sessions concurrent when authorized, while still enforcing each intent's internal hard prerequisites; for W2-04, U01 gates completion of U02/U03 work. (learned 2026-07-21) <!-- cid:delivery-planning:c1 -->
- Parallelize W2-04 U02/U03 implementation only after U01, serialize every isolated live Compose reservation under one controller, and defer final visual acceptance until W2-02 has merged and W2-04 has synchronized integration. (learned 2026-07-21) <!-- cid:delivery-planning:c3 -->
- Treat service identities and release reviewers as supporting actors, not invented end-user personas, when approved upstream artifacts assign them observable outcomes. (learned 2026-07-21) <!-- cid:user-stories:c1 -->
- Favor workflow-based vertical stories over component stories; defer component allocation to Units Generation. (learned 2026-07-21) <!-- cid:user-stories:c2 -->
- Apply the LinerCore operational-console authority over generic ui-ux-pro-max output: keep dense operational, responsive, accessible guidance and reject marketing, alternate-palette/font, chart-first, and spinner-first conflicts. (learned 2026-07-21) <!-- cid:refined-mockups:c1 -->
- Interpret 'not a workbench' as prohibiting disposable standalone workbenches, not the product-grade operational workbench required inside the shared authenticated shell. (learned 2026-07-21) <!-- cid:refined-mockups:c2 -->
- Apply the LinerCore operational-console authority over generic UI guidance: retain dense, responsive, validated, accessible patterns and reject marketing, hero, alternate-palette or font, chart-first, spinner-first, and dark-default conflicts. (learned 2026-07-21) <!-- cid:application-design:w2-04-c5 -->
- Model authorization and dependency degradation as a scenario-led vertical unit when they produce a cohesive user outcome; keep global viewport, Compose coordination, demo-guard, and audit mechanics at the intent Exit Gate rather than packaging them as a release-hardening unit. (learned 2026-07-21) <!-- cid:units-generation:c4 -->
- Explicitly decline unsupported production availability, capacity, backup, and disaster-recovery claims when this intent defines only local acceptance evidence. (learned 2026-07-22) <!-- cid:nfr-requirements:c3 -->
- Keep CMM and Booking as explicit service/adapter boundaries and do not add a cache or orchestration component when the approved contracts already provide the required reliability and proof. (learned 2026-07-22) <!-- cid:nfr-design:c1 -->
- Keep NFR design evidence local-acceptance focused; do not infer production autoscaling, rate-limit, or availability commitments. (learned 2026-07-22) <!-- cid:nfr-design:c2 -->
- Prefer bounded pagination and existing connection pools over cache/CDN complexity when isolated-stack evidence remains truthful without them. (learned 2026-07-22) <!-- cid:nfr-design:c3 -->
- Retain the existing portable Compose/service-owned topology and do not add an AWS resource or shared database when the intent can be proven on the current stack. (learned 2026-07-22) <!-- cid:infrastructure-design:c1 -->
- Use existing correlated logs, metrics, traces, and reversible CI/CD evidence before introducing a new production observability platform. (learned 2026-07-22) <!-- cid:infrastructure-design:c2 -->
- Document shared Kafka/network/service-discovery ownership explicitly when it is required for the real broker-to-Booking proof. (learned 2026-07-22) <!-- cid:infrastructure-design:c3 -->
- Extend existing CMM/Booking seams in place and do not introduce a new service or redesign the shared UI shell for a vertical intent. (learned 2026-07-22) <!-- cid:code-generation:c1 -->
- Bound dependency/reactor validation explicitly and document limitations; do not claim live acceptance until the isolated stack is actually run. (learned 2026-07-22) <!-- cid:code-generation:c2 -->
- Prioritize contract-visible lifecycle, conflict, authorization, freshness, and UI evidence in brownfield remediation while preserving approved topology. (learned 2026-07-22) <!-- cid:code-generation:c3 -->
- In UI functional designs, use one discriminator vocabulary aligned with upstream contracts and explicitly model every action outcome—including recoverable, validation-blocked, denied, degraded, and fatal—with state retention, focus, announcement, and retry semantics. (learned 2026-07-21) <!-- cid:functional-design:c1 -->
- Before accepting a manager demo-guard PASS, assert and retain the effective Compose project, edge URL, and locked image tag; environment overrides must not silently retarget safety evidence. (learned 2026-07-21) <!-- cid:infrastructure-design:c1 -->
- For W2-03 live acceptance, make no-rate MANUAL_PRICING_REQUIRED the focal degraded-path demonstration while preserving timeout, 503, and circuit-open contract behavior without expanding the thin slice. (learned 2026-07-21) <!-- cid:intent-capture:c3 -->
- For W2-03, build the bounded pricing authority on the existing W0/W1 foundations now while preserving a future partner/import seam; evaluate optimization, external distribution, and broader rating dimensions only through a later approved intent. (learned 2026-07-21) <!-- cid:market-research:c2 -->
- For W2-03, treat repository seams and implementation readiness as technical feasibility only; release remains conditional on observed isolated Compose, Booking, UI, and audit evidence, and unavailable Docker access must remain an explicit dependency rather than a pass. (learned 2026-07-21) <!-- cid:feasibility:260721-c1 -->
- For W2-03, assess and accept against the canonical isolated local Compose topology; do not invent AWS accounts, regions, services, cost estimates, or cloud deployment scope without a separately approved requirement. (learned 2026-07-21) <!-- cid:feasibility:260721-c2 -->
- Treat W2-03 Charge administration, real Booking pricing consumption, repricing, manual no-rate handling, owned UI, and observed live/audit acceptance as one inseparable minimum release; separated pieces are progress evidence, not substitute releases. (learned 2026-07-21) <!-- cid:scope-definition:260721-c1 -->
- Sequence W2-03 as a walking-skeleton and risk-first vertical backlog that proves a real Charge-to-Booking itemised line early; do not batch database, backend, frontend, and evidence as isolated horizontal releases. (learned 2026-07-21) <!-- cid:scope-definition:260721-c2 -->
- For W2-03 team planning, define roles and review hats without inferring real staffing readiness; named or system-assigned owners, availability, review independence, time zones, competing priorities, and Docker-capable acceptance ownership must be verified before committing a delivery schedule. (learned 2026-07-21) <!-- cid:team-formation:260721-c1 -->
- Deliver W2-03 through one stream-aligned intent mob with rotating Charge, Booking, architecture, data, frontend/UX, quality/security, and release-review hats; do not split its vertical Definition of Done across horizontal component teams. (learned 2026-07-21) <!-- cid:team-formation:260721-c2 -->
- Implement W2-03 Charge records with stable list, create/edit, and detail routes rather than extending the root-only workbench; preserve shareable URLs, browser history, focused route states, and return-to-list context. (learned 2026-07-21) <!-- cid:rough-mockups:260721-c1 -->
- For W2-03, model rate versions as Draft to immutable Approved, with Scheduled, Effective, and Expired derived from the approved effective window; do not add a larger publication workflow. (learned 2026-07-21) <!-- cid:rough-mockups:260721-c2 -->
- For W2-03 applicability, match POL THC local charges by origin port plus equipment, while OFR base and BAF surcharge rates match origin plus destination plus equipment. (learned 2026-07-21) <!-- cid:rough-mockups:260721-c3 -->
- For W2-03 UI, reject ui-ux-pro-max marketing composition, new palette/fonts, spinners, generic bulk edit, and dashboard-card suggestions when they conflict with the binding LinerCore master, tokens, skeletons, and Charge-only ownership. (learned 2026-07-21) <!-- cid:rough-mockups:260721-c4 -->
- Manage W2-03 BASE, SURCHARGE, and LOCAL rate versions through one filterable Charge route while keeping category-specific fields, labels, and applicability semantics visible; do not create three duplicate page systems. (learned 2026-07-21) <!-- cid:rough-mockups:260721-c5 -->
- For W2-03, Approval & Handoff authorizes risk-controlled Inception work only; it does not imply implementation approval, funding, staffing, schedule, runtime readiness, or release approval, which remain explicit later-gate commitments. (learned 2026-07-21) <!-- cid:approval-handoff:260721-ah-c1 -->
- W2-03 may continue requirements and architecture work while Docker access is unavailable, but release claims remain prohibited until the isolated live Compose proof, Playwright evidence, demo guards, aidlc-audit, and erp-fidelity-audit have actually passed. (learned 2026-07-21) <!-- cid:approval-handoff:260721-ah-c2 -->
- When an AI-DLC stage writes codekb artifacts but the imported sensor wrapper rejects codekb paths, run the declared deterministic sensor implementations directly against every artifact, log the wrapper mismatch, and never report the rejected wrapper invocation itself as a pass. (learned 2026-07-21) <!-- cid:reverse-engineering:260721-re-c3 -->
- Use Graphify first for W2-03 architecture orientation, but when its snapshot predates the active baseline, cross-check material Charge, Booking, UI, contract, migration, Compose, and test findings against current source and keep static analysis separate from runtime proof. (learned 2026-07-21) <!-- cid:reverse-engineering:260721-re-c4 -->
- For Charge pricing, resolve an applicable approved agreement first and use tariff fallback only when no agreement applies; a demo centered on agreement pricing does not remove the required tariff fallback behavior. (learned 2026-07-21) <!-- cid:requirements-analysis:260721-ra-c1 -->
- Preserve provider failure meaning: no authoritative rate is HTTP 404 NO_RATE, residual ambiguity is HTTP 422 PRICING_VALIDATION, and outage, denied, and idempotency failures remain distinct even when Booking safely projects MANUAL_PRICING_REQUIRED. (learned 2026-07-21) <!-- cid:requirements-analysis:260721-ra-c2 -->
- W2-03 manual-pricing scope is persisted OPEN evidence plus Booking visibility; assignment, manual quoting, approval, resolution, and closure are separate workflow scope and must not be imported implicitly. (learned 2026-07-21) <!-- cid:requirements-analysis:260721-ra-c3 -->
- Treat pricing p99 at or below 800 ms as a provisional warm local acceptance target with host, concurrency, and sample size recorded; do not represent it as an approved production SLO without production-environment evidence. (learned 2026-07-21) <!-- cid:requirements-analysis:260721-ra-c4 -->
- For W2-03 product stories, treat Pricing Analyst, Booking Desk Operator, and Charge Reader/Auditor as the human personas; Charge and Booking services are collaborating systems and must not be invented as human personas or used to broaden authorization. (learned 2026-07-21) <!-- cid:user-stories:260721-us-c1 -->
- Prefer end-to-end outcome stories with executable UI/API/persistence evidence over component-level UI or API task stories; implementation decomposition belongs in later design and planning stages. (learned 2026-07-21) <!-- cid:user-stories:260721-us-c2 -->
- Keep migration, isolated-live, performance, coverage, audit, and architecture obligations as mandatory release quality constraints rather than inventing a release persona or claiming an omnibus constraint is an INVEST user story. (learned 2026-07-21) <!-- cid:user-stories:260721-us-c3 -->
- Treat visual exports and ui-ux-pro-max recommendations as advisory: the active intent, current shared shell, executable @erp/ui tokens/primitives, and the LinerCore master/page contract remain binding over marketing, palette, font, chart, spinner, or shell suggestions. (learned 2026-07-21) <!-- cid:refined-mockups:260721-rm-c1 -->
- W2-03 specifies all Charge-owned route patterns and may annotate only the minimum typed pricing region consumed by Booking; it does not own or redesign Booking navigation, route structure, shell, or page composition. (learned 2026-07-21) <!-- cid:refined-mockups:260721-rm-c2 -->
- When current shared Dialog, Combobox, shell, or other capabilities do not satisfy a required behavior, name the integration dependency and keep its evidence cell blocked until the exact running integrated stack proves it; design intent or another branch's claim never becomes PASS evidence. (learned 2026-07-21) <!-- cid:refined-mockups:260721-rm-c3 -->
- Map existing @erp/ui primitives first and route missing cross-domain shared primitives to W2-02 through the program merge protocol; W2-03 may compose narrow domain behavior with semantic controls and shared tokens but must not edit packages/ui or create a parallel component library. (learned 2026-07-21) <!-- cid:refined-mockups:260721-rm-c4 -->

- When Deployment Execution has produced no observable candidate, define alert severity, thresholds, role ownership, and runbook intent as evidence-only gates; do not claim external paging, notification delivery, or automated remediation until an environment, owner, and channel are approved. (learned 2026-07-30) <!-- cid:observability-setup:c3 -->
- For W2-03 incident response, automate bounded evidence capture, validation, read-only inventory, and safe stopping, but require explicit human approval before restart, restore, forward repair, cleanup, or credential rotation. (learned 2026-07-30) <!-- cid:incident-response:c3 -->
## Contract Evolution
- For additive bilateral contract enrichment, retain existing field types and required sets, declare new properties optional for legacy-consumer schema compatibility, require the enriched provider set all-or-none at runtime, and make consumers distinguish absent legacy enrichment from invalid partial enrichment. (learned 2026-07-21) <!-- cid:application-design:c3 -->

# Reverse Engineering Freshness Record — TST_Codex_W2-03

## Execution Timestamp and Repository Identity

- **Architect synthesis completed**: `2026-07-21T14:16:39Z`
- **Repository**: `D:\TST_Codex_W2-03`
- **Repository mode**: single-repository brownfield intent; whole workspace scanned
- **Branch**: `intent/W2-03-charge-tariffs-and-agreements`
- **Observed HEAD / common Wave A baseline**: `c2f13dd9c2ca2fe754a075f6688c74d7bdb90b0f` (`c2f13dd`)
- **Recorded integration base**: `integ/main-reconciled` at `c96b5b30c067c96db3f9e8696d5e8c890109cd0b` (`c96b5b3`)
- **Intent record**: `aidlc/spaces/default/intents/260721-charge-tariff-agreements`
- **Scope/depth/test strategy**: feature / Standard / Standard

## Scan Scope

The developer scan covered:

- all frontend applications and shared TypeScript packages;
- the Java/Spring Boot Maven service reactor and business modules;
- Charge and Booking domain/application/controller/client/persistence/test paths;
- OpenAPI, AsyncAPI, Avro, catalog, examples, and provider fixtures;
- Compose, nginx, database initialization/migrations, Keycloak, messaging, and observability manifests;
- root/workspace build, lint, typecheck, test, CI, quality, acceptance, demo-guard, and Wave A scripts;
- relevant design/process/intent constraints needed to distinguish ownership and intended W2-03 work.

The synthesis output is the nine-artifact repository knowledge base at `aidlc/spaces/default/codekb/TST_Codex_W2-03/`.

## Method and Evidence Order

1. Existing Graphify graph queried for architectural orientation.
2. codebase-memory MCP architecture/search/snippet evidence used for source topology, routes, symbols, and relationships.
3. Material findings verified against current filesystem manifests, source, schemas, contracts, tests, CI, Compose, and scripts.
4. Developer scan synthesized by the architect into business, architecture, structure, API, component, stack, dependency, and quality artifacts.

codebase-memory reported 76,352 nodes and 86,737 edges during this run. Counts are index metadata, not a completeness guarantee.

## Graphify Freshness Qualification

`graphify-out/graph.json` was written at approximately `2026-07-21T11:23:12Z`, about 25 minutes before the baseline commit timestamp recorded by the developer scan. Graphify was therefore treated as directional evidence only. Its query also surfaced historical AI-DLC/design nodes alongside current source. Any material claim in the nine artifacts is controlled by the source-verified developer scan; stale graph content was not promoted to baseline fact.

Rebuild/update Graphify before relying on it for post-implementation W2-03 architecture or impact analysis.

## Static-Only Limitation

Reverse Engineering was read-only. It did not:

- compile or build Java/TypeScript code;
- execute unit, integration, contract, or browser tests;
- start Docker Compose or the `linercore-wave-a` project;
- probe or mutate the manager demo on port 8088;
- execute live Charge pricing or Booking repricing;
- produce Playwright screenshots/traces;
- run `aidlc-audit` or `erp-fidelity-audit` as exit evidence.

Earlier Docker subprocess attempts in this environment were blocked by sandbox `EPERM`. This record must not be cited as a runtime PASS or substitute for the required live acceptance.

## Baseline Versus Intended Change Marker

All “current” statements in the knowledge base refer to baseline `c2f13dd`. All W2-03 tariff/rate-version, typed itemisation, explicit repricing, `MANUAL_PRICING_REQUIRED`, functional Charge UI, stable Charge mount, Playwright, and live-evidence descriptions are intended changes unless a document explicitly identifies an existing partial seam.

The protected W0-01, W0-02, W1-01, W2-01, and W2-02 capabilities remain preservation constraints. Historical W1 waiver/block language remains unchanged and is not a real PASS.

## Staleness Triggers

Rerun Reverse Engineering when any of the following occurs:

- repository HEAD advances beyond `c2f13dd` for application, contract, migration, Compose, or quality changes;
- the active integration base changes from `c96b5b3`;
- Charge/Booking pricing contracts, schemas, routes, or snapshot types change;
- shared shell/nginx mounting changes;
- the Graphify/codebase-memory indexes are rebuilt after implementation;
- live acceptance reveals behavior inconsistent with this static model.


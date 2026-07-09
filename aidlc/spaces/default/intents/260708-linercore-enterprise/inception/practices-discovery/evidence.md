# Practices Discovery Evidence

## Sources Scanned

The brownfield scan used the reverse-engineering codekb artifacts `code-structure.md`, `technology-stack.md`, `dependencies.md`, `code-quality-assessment.md`, `architecture.md`, and `business-overview.md`. It also used Graphify query, Graphify explain for `quality:gates`, Graphify path from `Docker Compose` to `quality gates`, current git history at commit `86e2105`, `.github/workflows/quality-gates.yml`, `package.json`, `compose.yaml`, AI-DLC memory files, and the active enterprise intent.

codebase-memory MCP was requested as the secondary indexed lookup layer, but no MCP resources were exposed in this session. The scan therefore used Graphify as the primary indexed layer and focused local file reads as fallback.

## Pipeline And Deployment Findings

The current branch is `enterprise/linercore`; recent git history shows the enterprise preparation commit after `shared-platform-mvp-complete`. CI evidence exists in `.github/workflows/quality-gates.yml`, which runs quality gates and local readiness evidence on pull requests targeting `main` and through manual dispatch.

Root scripts include `quality:gates`, `readiness:local`, `contracts:validate`, `contracts:verify`, `contracts:verify:live`, `skeleton:validate`, `smoke:local`, and `smoke:observability`. Compose currently includes platform infrastructure and selected apps, but it does not yet include the complete enterprise profiles or all enterprise services.

## Quality Findings

The codebase uses Java 21, Spring Boot 3.3.7, Maven, JUnit Jupiter, Yarn 4.5.3, Turbo, TypeScript strict mode, Next.js, React, Vitest, React Testing Library, and ESLint. The reverse-engineering scan found 15 Java tests and 13 TypeScript/TSX tests, but no refreshed coverage percentage was produced during this stage.

Current executable contracts cover identity, reference data, charge agreements, and reference-data Avro/event fixtures. Enterprise Booking, CMM, pricing, and D&D contracts are authoritative markdown inputs but are not yet executable OpenAPI, Avro, AsyncAPI, HTTP Pact, or message-pact suites.

## Developer Findings

The backend code uses service-specific Maven modules with domain-core, application-service, dataaccess, messaging, container, and published-language boundaries. Identity and reference-data services are brownfield; charge-agreement is partial; booking-service and container-movement-service are not present.

Frontend structure includes auth, reference-data, and charge-agreements apps plus shared `@erp/*` packages. Booking, movement, D&D outcomes, operational exceptions, and the Claude UI design baseline have not yet been implemented as real authenticated frontend workflows.

## DevSecOps Findings

Keycloak, PostgreSQL, Kafka, Schema Registry, nginx, Prometheus, Grafana, Jaeger, OpenTelemetry Collector, Elasticsearch, and Kibana are present in local runtime definitions. Evidence of full enterprise service security, Kafka ACLs, SAST, DAST, dependency vulnerability gates, secret scanning, and production-grade secrets management was not found in the current CI/runtime scan.

Local auth bypass logic exists in the shared auth layer and must remain development-only. No production readiness claim should be made until security gates, least privilege, auditability, and service-to-service controls are designed, implemented, and tested.

## Graphify Findings

Graphify query returned practice-relevant nodes around enterprise technical standards, quality gates, reference-data/auth apps, service clients, testing guidance, and prior MVP artifacts. Graphify explain resolved `quality:gates` to the root `package.json` script. Graphify path from `Docker Compose` to `quality gates` found no direct path and reported an ambiguous target match, so no direct graph relationship is claimed between those concepts.

The existing Graphify graph is usable for code and document understanding. Raw Claude UI HTML and screenshots should still not be claimed as semantically indexed exact source nodes until a supported Graphify semantic extraction flow proves it.

## Questions Asked Or Inferred

No new user interview was required because the enterprise prompt already supplied hard constraints for module boundaries, Graphify use, local runtime, contracts, UI baseline, and no fake completion. The walking-skeleton stance was inferred from enterprise scope, prior MVP history, and the need to prove cross-module integration before accelerating the workstream ladder.

## Deviations

The stage asks for four parallel agent scans. In this harness session, previous subagent dispatches failed because the configured model names are unavailable for the account, so the evidence scan was completed inline using the four required agent perspectives and recorded here for auditability.

## Source Context

This evidence file references `aidlc/spaces/default/codekb/TST_Codex/code-structure.md`, `technology-stack.md`, `dependencies.md`, `code-quality-assessment.md`, `architecture.md`, and `business-overview.md` as consumed reverse-engineering inputs.

# Functional Design Memory

## Interpretations

- 2026-07-09T11:00:17+03:30 - Classified `contract-platform-catalog` as a cross-cutting executable contract foundation, not a runtime business service. Functional design should model catalog ingestion, validation, compatibility, fixture generation, and evidence publication rather than domain pricing, booking, or movement logic.
- 2026-07-09T11:06:50+03:30 - Classified `local-runtime-foundation` as infrastructure substrate and command/evidence design, not domain implementation or seed-data ownership. Its Functional Design should define Compose profiles, service topology, environment/secrets handling, health checks, and independent IDE modes while deferring business fixtures to `enterprise-seed-migrations-devex`.
- 2026-07-09T11:13:02+03:30 - Classified `shared-platform-identity-security` as brownfield hardening of existing Identity/Keycloak capability. Functional design should preserve MVP identity code while adding enterprise role/capability coverage, denied-path evidence, service-to-service JWT/RS256 validation, Kafka ACL hooks, and authorization audit behavior.

## Deviations

- 2026-07-09T11:00:17+03:30 - Graphify CLI shim returned access denied, so the graph query was run through `python -m graphify` using the recorded Graphify Python interpreter. The query result was used as supporting graph evidence alongside focused reads of `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`.

## Tradeoffs

- 2026-07-09T11:00:17+03:30 - Kept Functional Design questions narrow because prior Inception artifacts already decide the contract asset types and integration seams. The remaining uncertainty is implementation policy: catalog source of truth, compatibility gates, fixture ownership, and UI/API exposure.
- 2026-07-09T11:06:50+03:30 - Kept runtime questions focused on local deterministic execution rather than cloud or production promotion because Operation stages will refine deployment, provisioning, rollback, and incident detail.
- 2026-07-09T11:16:32+03:30 - Generated remaining Functional Design unit artifacts using explicit stage-level approval for recommended answers; covered shared-platform-reference-events through observability-quality-operation-readiness with per-unit source traceability and boundary guardrails.
- 2026-07-09T08:04:49Z - Repaired resumed observability-quality-operation-readiness artifacts before gate; the existing files contained placeholder entity names and malformed text fences, so the design was rewritten narrowly to preserve the approved scope while making evidence collection, quality gates, readiness handoff, and UI behavior implementable.

## Open questions

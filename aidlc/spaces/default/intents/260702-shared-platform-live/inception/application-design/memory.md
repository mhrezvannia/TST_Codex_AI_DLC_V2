# Application Design Memory

## Interpretations

- 2026-07-03T09:00:04Z - Treated Application Design as Shared Platform architecture only; the active intent and approved `requirements` exclude Charge, Booking, Container Movement, public cloud, and production deployment.
- 2026-07-03T09:00:04Z - Treated the current Reference Data BFF static arrays as implementation gaps, not the target architecture; service-backed BFF routes are required to make the UI functional.
- 2026-07-03T09:00:04Z - Treated identity-service and reference-data-service as existing bounded contexts to preserve; the design adds adapters/clients rather than collapsing services into the BFF.

## Deviations

- 2026-07-03T09:00:04Z - Inferred application-design question answers from approved artifacts because the user asked to continue without optional prompts until Shared Platform is functional.
- 2026-07-03T09:00:04Z - Used inline fallback review because prior reviewer subagent execution was blocked by model/account limitations.
- 2026-07-03T09:02:11Z - Learnings surface tool could not find `application-design` in `runtime-graph.json`; stage artifacts passed validation, so the approval gate continued with this caveat recorded.

## Tradeoffs

- 2026-07-03T09:00:04Z - Chose PostgreSQL-backed adapters behind existing ports over BFF-owned persistence; this adds backend work but preserves service ownership and restart-safe state.
- 2026-07-03T09:00:04Z - Kept local auth bypass during completion but designed it as visibly local-only; this supports near-term progress while limiting security risk.

## Open questions

- 2026-07-03T09:00:04Z - Functional Design should decide exact table schemas/migration mechanism for local PostgreSQL adapters.
- 2026-07-03T09:00:04Z - Delivery Planning should decide whether app/service Dockerfiles or Compose dev profiles are the fastest reproducible runtime path.

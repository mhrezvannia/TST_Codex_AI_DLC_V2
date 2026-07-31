# Logical Components - U01 Rate Authority

## Purpose and design inputs

This inventory bridges U01 into Infrastructure Design without changing the
approved topology. It consumes `performance-requirements.md`,
`security-requirements.md`, `scalability-requirements.md`,
`reliability-requirements.md`, `tech-stack-decisions.md`, and
`business-logic-model.md`. Components below are logical responsibilities inside
existing deployables and databases unless explicitly marked external.

## Component inventory

| Component | Runtime boundary | Responsibility | State/resource | Failure isolation |
| --- | --- | --- | --- | --- |
| Charge Rate pages | existing Charge Next.js app | list/detail/create/edit/approve/successor presentation using existing shell/tokens | route/form-local state only | browser failure cannot bypass BFF/service authorization |
| Charge Rate BFF routes | existing Charge Next.js app | signed-session subject/capability extraction, correlation, validation/forwarding | no commercial authority | same-origin boundary; U02 owns concrete routing/session integration |
| Rate API controller | Charge service container | typed HTTP query/command envelopes and safe error mapping | request-local | malformed input rejected before application service |
| Rate authorization adapter | Charge service container | one exact `charge-rates` action decision per service command/query through local map or Identity HTTP | 10 permits, 100 ms permit wait, 250 ms connect, 2 s total, 16 KiB body | separate named bean; legacy permissive agreement bean is ineligible |
| Rate reference adapter | Charge service container | up to five concurrent exact active ID/set/code checks through Reference Data | 50 global/5 per-command permits, 100 ms overload wait, 250 ms healthy call/connect ceiling, 300 ms healthy fan-out, one 2 s failure deadline, 64 KiB/check | ten five-check commands use all 50 without waiting; outage returns typed 503; no cached/default authority |
| Rate application services | Charge application-service module | authorize, validate, orchestrate transactions, build read models | stateless between calls | no automatic mutation replay; one transaction per command |
| Rate domain model/policies | Charge domain-core module | stable identity, immutable version history, lifecycle/applicability/money invariants | in-transaction objects | no framework/network dependency |
| JDBC Rate repositories | Charge dataaccess module | page-bounded queries, advisory/row locks, optimistic predicates, activity append | Hikari pool 2/10/2s local posture | DB errors roll back whole command; no cross-database access |
| Flyway catalog guard/migrations | Charge container/dataaccess | exact legacy comparison, V1 baseline, additive V2-V4 validation/migration | Charge Flyway history and catalog | drift keeps service unready; applied files never edited |
| Charge PostgreSQL | existing service-owned database | sole Rate/version/activity authority and invariant enforcement | durable catalog/data/WAL/backup | database failure affects Charge Rate paths; no alternate authority |
| Identity service | existing external service | authenticated exact authorization decisions | Identity-owned catalog/data | separate bounded adapter; fail closed |
| Reference Data service | existing external service | canonical active reference records | Reference-owned database | separate bounded adapter; fail closed |
| Telemetry/correlation seam | existing Spring/Micrometer/log/trace stack | low-cardinality metrics and safe correlated diagnostics | existing telemetry stores | telemetry failure cannot authorize or synthesize business success |
| U01/U06 evidence harness | test process plus isolated wrapper | fixture, load, race, restart, migration, restore, redaction evidence | disposable test contexts and retained evidence | no new deployable; manager 8088 remains probe-only |

## Interaction and ownership boundaries

The normal command path is browser to Charge BFF to Rate controller/application
service, then fail-closed Identity and Reference validation before the Charge
transaction writes PostgreSQL and RateActivity. Queries follow the same session
and service authorization boundary, then execute page-bounded repository reads.
No browser component calls Identity, Reference Data, or Charge service directly.

U01 owns the Rate domain/application/persistence/migration contracts and the
Charge-specific page behavior. U02 owns concrete Charge BFF/session routing.
U03/U04 consume the prepared V3/V4 structures without mutating applied
migrations. Booking consumes pricing only later through U04/U05; it does not
read the Charge database. W2-02 retains ownership of `packages/ui`, the shared
shell, navigation, typography, and palette.

## Shared resources and failure domains

| Resource/failure | Direct blast radius | Required containment |
| --- | --- | --- |
| Identity outage/invalid response | authenticated Rate reads and commands needing a decision | 2 s bounded fail-closed adapter; no stale allow |
| Reference Data outage | Rate create/edit/approve validation | 2 s bounded fail-closed adapter; no partial write |
| Charge pool/database outage | Charge Rate query/command and migration readiness | bounded acquisition, atomic rollback, readiness false; no other DB fallback |
| same-key approval contention | one normalized commercial authority key | advisory/row lock; exact 409 loser; unrelated keys progress |
| Charge process restart | in-flight Charge requests | pre-commit rollback or post-commit exact persistence; ready/read <=120 s locally |
| drifted migration catalog | Charge service startup | abort and forward repair/restore; never baseline silently |
| Charge UI/BFF failure | Charge management workflow | no effect on manager 8088 or service/database authority |

The Hikari pool, PostgreSQL catalog, HTTP permits, and telemetry stores are
shared only within their existing boundaries. IDs, amounts, subjects, and
correlation values are prohibited metric dimensions, preventing cardinality
from becoming a shared-resource failure.

## Infrastructure handoff

Infrastructure Design must configure the existing Charge service/database and
isolated acceptance stack, not invent production cloud topology. It must expose
environment-backed datasource, service identity/token, fixed dependency URLs,
timeouts/permit bounds, Flyway validation, process-local liveness, and deep
configuration/database readiness. It must preserve wrapper-only control of
`linercore-wave-a` on 18088 and treat manager 8088 as read-only/probe-only.

The handoff must also retain the original W1 blocked/waived evidence artifact
unchanged and explicitly non-PASS. U01/U06 and later green W2-03 proof are stored
as separate evidence; no acceptance report, audit, summary, or status rewrite
may relabel the historical W1 waiver as PASS.

No Redis, Kafka command path, replica, shard, second Charge database, new
gateway, new frontend app, shared UI package change, or AWS resource follows
from this component inventory. Any later topology expansion requires new
measured evidence and an explicit architecture decision.

## Verification allocation

Backend unit/integration tests own domain, adapter, JDBC, migration, and
two-context contention proof. Charge frontend/BFF tests own session/capability,
safe error/value retention, and page behavior. U06 owns the integrated wrapper,
performance samples, restart/restore, correlation, manager preservation,
Booking-visible pricing, Playwright evidence, and final audits. A green health
endpoint or source-only test cannot substitute for its assigned evidence.
The U06 manifest includes a separate preservation assertion that identifies the
unchanged W1 blocked/waived artifact and rejects any synthesized historical PASS.

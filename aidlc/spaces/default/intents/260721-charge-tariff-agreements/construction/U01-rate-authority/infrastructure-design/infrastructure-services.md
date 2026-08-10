# Infrastructure Services - U01 Rate Authority

## Service selection

U01 reuses the existing services below and introduces no managed cloud service
or new deployable.

| Service | Role | Data/traffic ownership | U01 change |
| --- | --- | --- | --- |
| PostgreSQL 15 | transactional source of truth | Charge-owned `linercore_pricing` database | Add and validate Flyway V1-V4; add Rate indexes, constraints, locks, activity, backup/restore proof |
| Charge Spring container | Rate API and business orchestration | Rate commands/queries and service-side authorization | Add Rate components inside existing modules |
| Charge Next.js container | same-origin pages and BFF | human session/capability and view models | Add Rate pages/routes inside existing app |
| Identity service | exact authorization decision | Identity-owned subject/capability data | Add exact `charge-rates` permissions; consume through bounded adapter |
| Reference Data service | canonical active reference validation | Reference-owned records | Consume exact set/ID/code through bounded adapter |
| nginx | stable application edge | path routing only | Add path-preserving Charge mount without changing shared shell |
| Prometheus/Grafana/Jaeger/OTel | optional local observability | safe metrics/traces only | Add U01 instruments/dashboards; no commercial authority |
| Kafka/Schema Registry | existing shared platform capability | existing topics only | No U01 Rate command/read path and no new topic |

## PostgreSQL design

### Ownership and connectivity

`charge-agreement-service` connects only to database `linercore_pricing` using
the Charge-specific role and secret. It cannot read Identity, Reference Data,
Booking, or other service databases. The shared PostgreSQL process is a local
cost/footprint optimization, not a shared data-ownership boundary.

The datasource starts with Hikari minimum idle 2, maximum 10, and acquisition
timeout 2 seconds. These are environment parameters. Increasing the pool
without observing PostgreSQL connection capacity, pool waits, transaction time,
and sibling-service impact is prohibited.

### Schema and indexes

Flyway owns exact catalog adoption and immutable V1-V4 ordering. V2 supplies:

- stable Rate and immutable RateVersion primary keys;
- unique `(rate_id, version_no)` and one-Draft protection;
- category, lifecycle, decimal, date-window, and applicability checks;
- activity attribution tied to the same transaction;
- indexes for category/code, applicability, validity/lifecycle, latest-update
  order, per-Rate history, activity, and overlap candidate selection.

V3/V4 retain the complete prepared downstream contracts, including the
LEGACY/W2 discriminator, nullable legacy commodity seam, append-only agreement
activity, and deterministic terminal/manual dedupe structures. U01 provisions
their physical contract but does not expose U03/U04 behavior.

Approval uses `pg_advisory_xact_lock(hashtextextended(key, 0))`, reloads the
Draft with a row lock, and executes the authoritative inclusive-overlap query.
Successor allocation locks the stable Rate. There is no extension, replica,
cache, full-text service, or database-triggered cross-service integration.

### Backup and restore

The isolated acceptance wrapper uses version-compatible PostgreSQL backup and
restore tools. Backups contain catalog, Flyway history, Rate/version/activity,
and relevant legacy rows; retained evidence contains only safe metadata,
counts, and hashes. Restore creates a new wrapper-owned database after exact
source/target identity, name, owner, process, reparse-point, and containment
checks. Wrapper cleanup targets only resources it created.

## Caching, messaging, and search

There is no Rate cache. Page-bounded indexed PostgreSQL reads preserve
read-after-write, immutable history, derived lifecycle, overlap authority, and
one-Draft correctness without distributed invalidation.

Kafka and Schema Registry remain in the Wave A application profile because
other platform flows require them. U01 neither publishes nor consumes Rate
commands/events and creates no topic. A later event requirement must define an
outbox, schema, consumer ownership, replay, ordering, retention, and recovery
contract; none is implied here.

Free-text Rate filtering remains a bounded PostgreSQL query. Elasticsearch is
optional observability-profile infrastructure for existing log tooling, not a
Rate search authority. Redis, OpenSearch, CDN, object storage, and message
queues are not selected.

## Identity and Reference Data integrations

The Charge service resolves dependencies by fixed Compose DNS:
`http://identity-service:8082` and `http://reference-data-service:8083`.
Host mappings are not used for container-to-container traffic.

Identity receives one exact `charge-rates` action decision per service
query/command. Its adapter has 10 permits, <=100 ms permit wait, <=250 ms
connect, <=2 s total deadline, and <=16 KiB response. Only an authenticated
`ALLOW` echoing the exact resource/action succeeds.

Bean selection is explicit and mutually exclusive:
`CHARGE_RATE_AUTHORIZATION_MODE=local-map|identity-http`, with no default.
Wave A requires `identity-http`; developer-local use of `local-map` must be
explicit. A startup runner asserts exactly one typed Rate authorization bean,
rejects a local-map bean in Wave A, and validates the fixed Identity URL and
caller. Safe actuator/startup evidence exposes only the selected adapter kind,
not credentials or policy data.

Reference Data receives at most five checks per Rate command. Its adapter has
50 global permits, at most five held per command, <=100 ms overload wait,
<=250 ms connect/provider healthy budget, <=300 ms healthy fan-out, one <=2 s
shared deadline, and <=64 KiB per response. It validates exact set, canonical
ID, active state, and optional code.

Both clients reject redirects, unexpected content type, oversize/malformed
payloads, missing non-local credentials, and transport failures. They have no
automatic mutation retry, stale cache, default allow, or fallback authority.
Dependency unavailability commits no Rate mutation.

## Edge routing and service discovery

nginx preserves `/charge-agreements` as the Next.js `basePath`; it does not
strip the prefix. The exact bare-path redirect, deep links, static assets, BFF
routes, and `/charge-agreements/api/health` are regression-tested alongside
existing `/auth`, `/reference-data`, `/booking(s)`, and shell routes.

Compose DNS supplies service discovery. No registry, mesh, ingress controller,
API gateway, CDN, or external DNS record is added. The Charge service host port
is diagnostic/acceptance-only; the browser uses the nginx same-origin edge.

## Secrets and configuration registry

| Setting class | Source | Validation |
| --- | --- | --- |
| datasource URL/user | non-secret environment config | fixed service-owned database; unsafe/missing value fails readiness |
| datasource password | runtime secret | never defaulted outside local profile; excluded from logs/evidence |
| Rate authorization mode | required enum | Wave A must be `identity-http`; missing, unknown, local-map, or multiple beans abort startup |
| Identity URL/caller | fixed config | Wave A uses Compose DNS and caller `charge-agreement-service`; unsafe/missing wiring fails readiness |
| Reference URL/service credential | fixed config + runtime secret | same fail-closed posture |
| permit/deadline/body limits | typed environment config | positive bounded values; startup rejects invalid combinations |
| Flyway mode/catalog expectations | image + typed config | checksum/catalog mismatch keeps service unready |
| telemetry endpoints | optional observability config | telemetry failure cannot authorize or synthesize success |

The current internal Identity decision endpoint authenticates the subject
reference but does not yet implement a separate caller token or mTLS boundary;
Wave A therefore proves real Identity decision semantics and fail-closed
transport behavior without overstating production service authentication.
Production use is blocked until a separately approved endpoint credential/TLS
control exists. Local example credentials are explicitly development-only. CI
injects isolated values through its secret mechanism. No secret is passed as a browser value,
Docker build argument, image layer, metric label, trace attribute, or retained
artifact.

## Capacity and cost controls

U01 spends no new cloud cost and adds no always-on service. Initial container
memory limits and shared platform services remain unchanged. The accepted
capacity is 10,000 Rates, 50,000 versions, 10 administrative clients, and 20
independent approval bursts. Query/index tuning and measured right-sizing
precede any topology expansion.

The acceptance run records container memory/CPU, JVM heap/GC, Node memory,
PostgreSQL connections/locks, adapter permit saturation, request percentiles,
image sizes, and evidence volume. A capacity trigger starts an architecture
review; it never automatically provisions infrastructure.

## Upstream traceability

This service map consumes `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`. It preserves
their service ownership, exact authorization/reference seams, database
authority, no-cache/no-new-topic decision, and forward-only recovery model.

# Shared Infrastructure - U01 Rate Authority

## Shared-resource scope

Multiple W2-03 units reuse the same Wave A Compose network, PostgreSQL process,
nginx edge, Identity and Reference Data services, Charge/Booking deployables,
and optional observability profile. Sharing is physical only where stated; it
does not merge service ownership or authorize U01 to redesign cross-unit
resources.

U01 may add Rate-specific schema, adapters, routes, health, and telemetry
inside Charge-owned boundaries. U02 owns concrete Charge BFF/session routing,
U03 owns agreement behavior, U04 owns pricing/manual behavior, U05 owns Booking
consumption, and U06 owns integrated preservation/acceptance. W2-02 continues
to own `packages/ui`, shared shell, navigation, typography, and palette.

## Resource registry and ownership

| Shared resource | Owner | U01 access | Cross-unit rule |
| --- | --- | --- | --- |
| Compose project `linercore-wave-a` and wrapper | U06/integration harness | consume for isolated U01 proof | only wrapper controls it; unique project/network/ports |
| named Compose network | platform runtime | connect existing Charge containers | Compose DNS only; no new ingress/mesh |
| Wave A loopback override | U06/integration harness | consume for diagnostic host mappings | wrapper-applied only; all host bindings `127.0.0.1`; base manager config untouched |
| PostgreSQL 15 process | platform runtime | Charge-specific database/role only | no cross-database joins; sibling DB capacity must be measured |
| `linercore_pricing` Charge DB | Charge service | U01 owns V1-V4 physical migration chain | U03/U04 consume prepared structures; never edit applied files |
| nginx edge | shared platform/Wave A integration | additive preserving Charge mount | regression-protect all existing routes |
| `charge-agreement-service` image | Charge domain | add U01 modules | later Charge units extend same deployable; one compatible image |
| `apps-charge-agreements` image | Charge UI | add Rate pages | U02/U03 extend Charge-owned routes only |
| Identity service | Identity domain | exact `charge-rates` decisions | no copied policy or fallback authority |
| Reference Data service | Reference domain | exact active-record validation | no copied master-data authority |
| Kafka/Schema Registry | messaging platform | no U01 Rate path | no new topic without explicit owner/schema/replay design |
| Prometheus/Grafana/Jaeger/OTel | observability platform | safe U01 instruments | shared low-cardinality naming and redaction rules |
| manager demo on `8088` | protected external baseline | probe-only via `demo:guard` | never control, seed, rebuild, stop, clean, or relabel |

## Database and migration coordination

U01 is the sole writer of the Charge V1-V4 migration files because it adopts
the existing catalog and prepares schemas needed by downstream units. U03/U04
may implement repositories and behavior against those structures but cannot
change an applied migration. Any discovered defect becomes a new ordered
forward-repair migration owned through Charge schema review.

The shared PostgreSQL process has separate service databases and credentials:
Identity, Reference Data, Charge, Booking, and Container Movement remain
isolated. Backup/restore proof for U01 targets only the Charge database. A
process-wide resource change such as memory, connection limit, volume, image
version, or host port requires impact evidence for every sibling database and
cannot be made unilaterally by U01.

Charge Hikari maximum 10 is included in the shared connection budget.
Acceptance records total PostgreSQL connections and sibling health while
running the U01 20-approval proof. A U01 pool increase is blocked until the
shared owner verifies connection headroom and non-regression.

## Network and service-discovery coordination

Internal endpoints use service names and fixed container ports. Host port
remapping is confined to the Wave A env file. nginx is the only human
application edge, mapping host `18088` to the existing app graph.

The `/charge-agreements` mount preserves the Next.js base path. It must not
shadow or rewrite `/auth`, `/reference-data`, `/booking`, `/bookings`, or `/`.
Direct deep links, reloads, assets, BFF routes, and health are tested. No
service exposes a new public origin, and no browser gains Identity, Reference
Data, or Charge service credentials.

## Shared secrets and access boundaries

Each service keeps a distinct database credential and service credential.
Charge Rate authorization and Reference validation credentials are injected
only into the Charge backend. Human sessions remain in the signed-session BFF
boundary. Browser bundles, nginx config, images, logs, traces, and evidence
contain no credentials.

Local example secrets are development-only and scoped to the isolated stack.
Non-local missing credentials fail readiness. Credential rotation and
production secret managers require an approved environment design; U01 does
not invent a cloud vault or claim production rotation.

Wave A pins the Rate authorization bean to `identity-http` with no fallback.
The current Identity internal endpoint proves real subject decision semantics
but has no separate production-grade caller token/mTLS control; acceptance
records that limitation rather than claiming it. A future production design
must close that boundary before deployment.

## Shared observability contract

All units use correlation IDs and closed low-cardinality dimensions. Shared
metric names must identify service and operation without stable IDs, subject
IDs, customer values, amounts, error text, or correlation IDs as labels.
Prometheus scrapes internal actuator endpoints; nginx does not publish them.

Dashboards may combine Charge, Booking, Identity, Reference Data, PostgreSQL,
and container signals for integrated evidence, but data ownership remains
explicit. A telemetry outage cannot change business outcomes. U06 sanitizes
and indexes retained evidence and preserves the historical W1 blocked/waived
record as non-PASS.

## Capacity, failure domains, and cost

| Failure/resource pressure | Direct shared impact | Required containment |
| --- | --- | --- |
| PostgreSQL process exhaustion | all local service databases | bounded pools, connection evidence, no unilateral pool increase |
| Charge DB/catalog drift | Charge units only | readiness false, forward repair/isolated restore |
| Identity outage | operations needing authorization | bounded fail-closed adapter; no stale allow |
| Reference outage | validating mutations | bounded fail-closed adapter; no partial write |
| nginx/Charge app failure | Charge human workflow | no change to service authority or manager project |
| observability failure | local diagnosis/evidence | no business success synthesis; acceptance may fail |
| Kafka failure | existing messaging flows | U01 Rate path remains independent; no new fallback |
| Wave A wrapper error | isolated acceptance | containment checks stop before broad cleanup |

No new always-on service means no new cloud cost center. Shared container
right-sizing is evidence-driven. The 10k/50k fixture, 10 clients, and 20
independent approvals are acceptance capacities, not production forecasts.

## Change and cleanup protocol

Every shared-infrastructure mutation is version-controlled and reviewed by its
owner. The pipeline records rendered Compose configuration before action.
Cleanup is permitted only for exact wrapper-created project, network, container,
volume, and restore database identities. Broad names, unresolved variables,
manager resources, reparse points, hardlinks, or cross-volume ambiguity stop
cleanup.

CI does not create another full-stack Compose project. Unit/integration
isolation uses test-owned Testcontainers; all full-stack proof is serialized
through the guarded Wave A wrapper.

`npm run demo:guard` runs before and after acceptance. A mismatch aborts the
workflow and retains diagnostics. Neither passing U01 evidence nor later
passing W2-03 evidence may alter or replace the original W1 waiver record.

## Upstream traceability

This shared-resource contract consumes `performance-design.md`,
`security-design.md`, `scalability-design.md`, `reliability-design.md`,
`logical-components.md`, `components.md`, `services.md`, and
`business-logic-model.md`. It preserves their component/unit ownership,
service-specific data authority, bounded dependencies, no-new-topology
decision, Charge migration handoff, isolated acceptance, and manager
preservation.

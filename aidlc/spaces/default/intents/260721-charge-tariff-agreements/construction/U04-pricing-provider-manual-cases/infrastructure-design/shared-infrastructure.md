# Shared Infrastructure — U04 Pricing Provider and Manual Cases

## Input contract and ownership

This registry consumes `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`.

| Shared resource | Owner | U04 rights |
| --- | --- | --- |
| Charge image/application | Charge domain | add U04 modules to the one compatible image |
| `linercore_pricing` and V1–V4 | U01/Charge schema | consume V4; never edit applied migration |
| Rate authority | U01 | bounded Approved candidate reads only |
| Agreement authority | U03 | bounded W2 Approved candidate/link reads only |
| receipt/manual behavior | U04 | claim, resolve, complete, replay, evidence reads |
| Booking orchestration/storage | U05 | provider contract only; no Booking DB access |
| Wave A/restore evidence | U06 | supply probes/fixtures |
| app shell and `packages/ui` | W2-02 | consume unchanged |
| Identity/Reference Data | owning services | bounded authorization/validation only |

## Database and pool coordination

U04 shares the U01 maximum-10 Hikari pool and holds one connection at a time.
Short claim and terminal transactions surround—but never overlap—the bounded
read-only candidate snapshot. Conditional SQL and uniqueness coordinate
instances; JVM locks are forbidden.

The Charge role alone accesses Charge tables. Booking, Identity, Reference
Data, and app roles cannot read or mutate them. U04 requires no new database,
role, extension, cache, or queue. Cross-service joins and copied master-data
authority remain prohibited.

## Contract coordination

`contracts/openapi/pricing.v1.yaml` remains the bilateral provider/consumer
source. Existing fields/types remain compatible; W2 successes emit the complete
enriched set. Stored status and exact body are replay authority, while content
type is derived by terminal status. U04 never asks Booking to reconstruct
commercial lines or totals.

Manual list/detail is Charge-owned default JSON through the authenticated BFF.
The page is evidence-only and cannot assign, quote, resolve, approve, close, or
edit money. Shared UI gaps remain W2-02 dependencies and cannot be locally
declared passed.

## Runtime and network coordination

All services join the existing `linercore-wave-a` network and use Compose DNS.
Nginx preserves `/charge-agreements`; host port 18088 is the isolated acceptance
entry. Manager port 8088 and its project are guarded before/after. No U04
component binds a new host port or creates an alternate full-stack topology.

Pricing trusted-service secrets, human session secrets, and database
credentials are distinct and service-scoped. They are supplied through the
existing Wave A secret/env boundary, never shared with the browser or stored in
artifacts.

## Capacity and failure isolation

The U04 fixtures exercise 100,000 receipts, 10,000 OPEN cases, 10 pricing
clients, and manual pages capped at 100. Query, pool, heap/RSS, and route
regression evidence proves U04 does not starve Rate/Agreement commands or
sibling services in the local stack.

Charge failures remain inside the provider boundary. An unacknowledged claim
can be taken over after 10 seconds; acknowledged terminal bytes are immutable.
U05 decides Booking retry/circuit/manual outage projection, while U04 creates a
Charge OPEN case only for its terminal no-rate/ambiguity outcomes.

## Change and recovery protocol

Changes to U01 V4, U03 authority contracts, pricing-v1, shared app shell, nginx,
or Wave A require the named owner’s review and cross-unit regression evidence.
No unit edits another unit’s applied migration or durable evidence.

After durable U04 state exists, recovery is forward repair or U06’s verified
isolated restore. Reconciliation reports inconsistencies without rewriting
terminal bytes or historical legacy winners. Production retention, replication,
DR, paging, and cost policy require a future environment-specific design.

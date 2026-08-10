# Constraint Register - W1-01 Booking Quote-to-Cash

## Source Trace

Constraints derive from `ideation/intent-capture/intent-statement.md`, `ideation/market-research/competitive-analysis.md`, `ideation/market-research/market-trends.md`, and `ideation/market-research/build-vs-buy.md`, plus the enterprise contracts, repository rules, and current source.

## Binding Constraints

| ID | Category | Constraint | Design consequence | Verification |
|---|---|---|---|---|
| CON-01 | Contract | Field names and types must match the authoritative `.avsc` files exactly | Domain/API differences require explicit tested mappings; no silent aliases | Schema, serde, contract, and live topic evidence |
| CON-02 | Architecture | Booking, Charge, CMM, and Reference Data own separate data stores | All cross-context access uses HTTP or Kafka contracts; no cross-database query | Architecture test and source review |
| CON-03 | Platform | W0 shared publisher, Schema Registry registrar, relay, scheduler, and guards must be reused | Consumer additions may extend shared patterns but cannot duplicate producer infrastructure | Dependency/source audit |
| CON-04 | Delivery | Booking-to-CMM confirmation and CMM-to-Booking status are Kafka-authoritative | Remove synchronous delivery from live request paths after consumer proof; no steady-state dual delivery | Source detector plus outage test |
| CON-05 | Atomicity | Booking confirmation commits state and outbox atomically | Preserve `@Transactional`; no outbound network call in the transaction/request path | Integration failure test |
| CON-06 | Consumer atomicity | Status/journey projection and dedupe commit before acknowledgement | Consumer application methods require transaction boundaries and retry-safe errors | Redelivery and rollback tests |
| CON-07 | Migration | Existing Booking records must remain readable | Versioned migration or snapshot upcaster required; destructive reset is not acceptance | Migration fixture test |
| CON-08 | Runtime | Compose is the canonical W1 proof environment | Use PostgreSQL host `${POSTGRES_HOST_PORT:-55432}` because host 5432 is reserved | Compose evidence bundle |
| CON-09 | Reliability | Delivery is at least once and ordered only by contract partition key | Consumers dedupe envelope IDs and handle stale revisions/events | Duplicate/out-of-order tests |
| CON-10 | Pricing | Frozen Booking/Charge timeout, retry, idempotency, and error behavior remains | New request mapping cannot weaken bilateral semantics | Consumer/provider tests and live quote |
| CON-11 | Standards | UN/LOCODE, ISO 6346/equipment codes, DCSA booking identity, and event vocabulary remain canonical | Typed values and contract-exact names replace generic attribute-bag fields | Domain and fidelity audit |
| CON-12 | Data | Events carry minimal references and shipment context, not customer attributes | Avoid PII expansion; restrict logs and topics in deployed profiles | Payload inspection and security review |
| CON-13 | Scope | Global shell/auth, full design-system migration, D&D, invoices, amendments, multi-leg, and external OHS remain deferred | W1 UI is Booking-local list/detail; no unrelated module breadth | Backlog/changed-file review |
| CON-14 | Quality | Tests, live Compose DoD, `aidlc-audit`, and `erp-fidelity-audit` are mandatory | No placeholder or environment exemption can close W1 | Evidence files and detector exits |

## Environmental Constraints

| ID | Constraint | Current state | Required handling |
|---|---|---|---|
| ENV-01 | Host PostgreSQL port 5432 is occupied | Known user environment condition | Keep Compose host default at 55432 or another explicitly free port |
| ENV-02 | Docker images must be available on the local Docker Desktop data path | Images were successfully pulled for W0/W0-02 | Reuse cache; report pull/runtime failures honestly |
| ENV-03 | Kafka and Schema Registry are single-node local proof components | Appropriate for local acceptance, not a production HA claim | Do not infer production availability from Compose |
| ENV-04 | No approved AWS target is supplied | Cloud topology unknown | Defer concrete AWS service/account claims until Operation requirements |
| ENV-05 | Booking frontend source is incomplete on this branch | Missing imported data/page/test/detail files | Treat frontend restoration as required W1 work and baseline it before UI changes |

## Organizational Constraints

- Booking is the Driver; Charge and CMM owners review changes in their modules and contract surfaces.
- Contract changes require producer and consumer sign-off.
- Shared Platform owns the reusable messaging infrastructure.
- The intent branch is short-lived and merges only after the live exit gate.
- No date or token budget authorizes skipped tests, fake evidence, or a placeholder integration.

## Compliance Constraints

- Classify Booking operational data as internal/confidential by default.
- Do not place customer names, contact details, payment data, or unrelated commercial attributes on internal events.
- Preserve actor, correlation, event ID, source, and timestamps needed for audit and incident analysis.
- Keep local authentication bypass development-only; it cannot justify production access-control claims.
- Define production geography, retention, and regulatory obligations before external deployment.

## Constraint Validation

Every construction unit must identify the constraints it satisfies. A unit is not complete when it only adds shape; its relevant constraint must have executable or observed evidence. CON-01, CON-04, CON-06, CON-07, and CON-14 are release-blocking for W1.

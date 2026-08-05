# Component Inventory — TST_Codex_W2-03

## Frontend Applications

| Component | Responsibility | Principal dependencies | W2-03 status |
|---|---|---|---|
| `apps/auth` | OIDC/local authentication, signed session lifecycle, access flows | Keycloak, identity service, `packages/auth`, `jose` | Preserve |
| `apps/shell` | Authenticated shared frame and mounted domain routes | `packages/auth`, shared types, Booking BFF seams | Protected shared ownership; minimal integration only |
| `apps/reference-data` | Controlled reference-data administration | Identity/reference services, React Query, Zustand, Zod, shared UI | Preserve and consume authorities |
| `apps/charge-agreements` | Charge domain web application | Baseline module-info/health proxy; shared UI at runtime | W2-03-owned page/BFF implementation surface |
| `apps/booking` | Booking create/list/detail, validate, price, confirm | Booking service, shared auth/types, Charge via Booking service | Extend breakdown/repricing narrowly |

## Shared Frontend Packages

| Component | Responsibility | Consumers | Boundary |
|---|---|---|---|
| `packages/auth` | Signed cookie, actor extraction, authorization helpers | Auth, shell, BFFs | Reuse; no alternate Charge auth |
| `packages/ui` | Shared UI primitives and styles | Operational apps | W2-02-owned; no W2-03 redesign |
| `packages/api-core` | Axios API foundation | Frontend clients | Reuse where suitable |
| `packages/config` | Shared frontend configuration | Workspace apps/packages | Preserve |
| `packages/shared-types` | Shared TypeScript contracts | Apps/packages | Add only if cross-owner contract requires it |
| `packages/transformers` | Shared mapping logic | Apps/packages | Preserve |
| `packages/utils` | Shared utilities | Apps/packages | Preserve |

## Backend Services

| Service | Responsibilities | Owned data | Important dependencies |
|---|---|---|---|
| `identity-service` | Subjects, roles, permissions, authorization, Keycloak integration | Identity PostgreSQL | Keycloak, Spring web/actuator |
| `reference-data-service` | Versioned reference records, validation, history, outbox events | Reference PostgreSQL | Spring JDBC, Kafka/Avro |
| `charge-agreement-service` | Agreement lifecycle, terms, active lookup, pricing, manual cases, idempotency, lifecycle events | Charge/pricing PostgreSQL | Identity, Reference Data, Booking consumer seam, Kafka/Avro |
| `booking-service` | Booking aggregate, validation, pricing snapshots, lifecycle/events | Booking PostgreSQL/Flyway | Identity, Reference Data, Charge HTTP, Kafka/Avro |
| `container-movement-service` | Container journey/movement state and Booking linkage | Movement PostgreSQL | Booking, Reference Data, Kafka/Avro |
| `platform-messaging` | Shared event/schema-registry support | None | Spring Kafka, Avro, Confluent serializers |

## Charge Domain Components

| Component group | Baseline responsibility | Confirmed gap/intended extension |
|---|---|---|
| Agreement aggregate/value objects | Draft/Approved/Suspended/Expired rules, terms, mutation version | Separately addressable immutable approved versions absent |
| Agreement application service | Create, update, replace terms, approve, suspend, expire, active lookup | Retain lifecycle while introducing versioned authority |
| Pricing request/result/line models | Request context and internal itemised calculation | Public response drops basis/quantity/rate |
| Pricing application logic | Select agreement, calculate terms, handle no-rate/ambiguity | Distinct tariff/rate cards and line-level applicability absent |
| Agreement repositories | JDBC and in-memory latest agreement/terms/activity persistence | Append-only approved-version persistence absent |
| Manual case repository | Record manual-pricing cases | End-to-end result vocabulary needs `MANUAL_PRICING_REQUIRED` |
| Pricing request repository | Idempotency and lease state | Preserve during contract evolution |
| Agreement/pricing controllers | Agreement lifecycle endpoints and `/pricing-requests` | Add version/rate endpoints and typed result compatibly |
| Messaging/outbox | Agreement lifecycle event serialization/publication | Preserve; verify concrete claiming/lifecycle adapter methods |

## Booking Pricing Components

| Component | Baseline responsibility | Confirmed gap/intended extension |
|---|---|---|
| `PricingPort` | Booking application pricing abstraction | Keep as primary seam |
| `ChargePricingPortAdapter` | Translate Booking pricing request/result | Extend typed lines and manual code |
| `HttpChargePricingClient` | Call Charge pricing endpoint and map HTTP outcomes | Removes line detail; uses wall clock; defaults lane/commodity |
| Booking aggregate/pricing snapshot | Retain pricing state with Booking | Schemaless flat map; typed/versioned itemisation needed |
| Booking controllers/BFFs | Price, amend, reconfirm and serialize detail | No explicit reprice UX/operation |
| Booking detail UI | Show generic quoted amounts/manual state | Add typed Charge breakdown without redesigning shared shell/UI |

## Contracts and Integration Components

| Component | Responsibility | Qualification |
|---|---|---|
| `pricing.v1.yaml` | Canonical cataloged `/pricing-requests` contract | Best match to implementation; needs W2-03 evolution |
| `charge-agreements.yaml` | Legacy agreement and pricing/D&D surface | Pricing paths drift from implementation |
| AsyncAPI/Avro schemas | Business event contracts | Charge lifecycle, Booking, Reference Data, movement |
| Pact-style fixtures | Provider/consumer examples | Booking↔Charge and other service seams |
| Contract catalog | Ownership, compatibility, verification classification | Version `0.2.0`, `candidate_executable` |

## Runtime and Platform Components

| Component | Responsibility | W2-03 relevance |
|---|---|---|
| `infrastructure/compose.yaml` | Full local service/app/platform topology | Acceptance substrate |
| nginx 1.27 | Edge routing on port 8088 | Baseline lacks explicit Charge route |
| PostgreSQL 15 | Dedicated service databases | Charge/Booking schema evolution |
| Keycloak 24.0 | OIDC identity provider | Actor/auth preservation |
| Kafka/Schema Registry 7.7.1 | Event transport/schema registry | Existing outbox contracts |
| Prometheus/Grafana | Metrics and visualization | Runtime evidence support |
| Jaeger/OTel Collector | Tracing/telemetry | Runtime evidence support |
| Elasticsearch/Kibana | Local log/search tooling | Runtime evidence support |

## Automation and Evidence Components

| Component | Responsibility | Qualification |
|---|---|---|
| `scripts/wave-a-compose.mjs` | Start/stop/status/log/exec isolated Wave A stack | Required W2-03 acceptance wrapper; project `linercore-wave-a` |
| `scripts/demo-guard.mjs` | Verify protected manager stack/image/routes | Must run before and after; must not mutate demo |
| `scripts/run-quality-gates.mjs` | Aggregate unit/contract/evidence checks | Charge lint/build missing from baseline aggregation |
| Contract verification scripts | Validate catalog and provider fixtures | Preserve and extend for typed pricing |
| Existing W1/W2-01 evidence scripts | Prior-wave proof | Preserve wording/results, including explicit waiver/block |
| Playwright | Browser test capability | Dependency present; baseline config/spec absent |
| AI-DLC and ERP-fidelity detectors | Delivery/process fidelity audits | Required exit evidence |

## Design and Documentation Components

- `design-system/linercore/MASTER.md` and `SESSION-PROMPT.md` define the shared UI authority.
- `design-system/linercore/pages/charge-and-agreements.md` is the only Charge-specific design record W2-03 owns.
- `docs/intents/00-INTENT-BACKLOG.md` and `docs/aidlc-v2-slicing-playbook.md` define dependency and slice discipline.
- The active intent record contains ideation/Inception evidence and is distinct from application source.

## Inventory Gaps

Baseline has no separate rate-card/tariff-version component, no immutable approved-version store, no typed Booking charge-line snapshot, no stable Charge edge route, and no W2-03 live/Playwright evidence component. Those are intended additions, not missing items from this inventory.


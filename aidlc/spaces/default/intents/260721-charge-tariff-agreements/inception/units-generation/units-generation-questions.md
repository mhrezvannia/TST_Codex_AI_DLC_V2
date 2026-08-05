# Units Generation Questions — W2-03 Charge Tariffs & Agreements

## Upstream Basis

The decomposition consumes approved Application Design `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, and `decisions.md`, plus `requirements.md` and `stories.md`. It preserves the existing Charge/Booking deployments and decomposes the W2-03 vertical slice by independently testable business capability, not by generic backend/frontend layers.

## Interaction Mode

### Q0 — Collection Mode

- A. Accept/revise recommended answers in two concise batches, then review the complete decomposition plan **(Recommended)**
- B. Walk through one question at a time with deeper explanation

[Answer]: A — Accept/revise recommended answers in two concise batches, then review the complete decomposition plan.

## Decomposition Questions

### Q1 — Unit Boundary Strategy

- A. Business-capability vertical units spanning the existing Charge/Booking/UI seams **(Recommended)** — rate authority, agreement authority, pricing/manual outcomes, Booking consumption/reprice, and assurance stay independently testable without new deployables.
- B. Service-based units — separate Charge, Booking, UI, and runtime units; simpler ownership but creates horizontal partial deliveries.
- C. Deployment-target units — one unit per current container/app; maximizes deployment alignment but fragments user outcomes.

[Answer]: A — Use business-capability vertical units spanning the existing Charge/Booking/UI seams.

### Q2 — Unit Granularity

- A. Six medium units **(Recommended)** — enough separation for clear contracts and review while keeping each end-to-end capability coherent.
- B. Three coarse units — fewer handoffs but large cognitive/test scope.
- C. Ten or more fine units — more parallel tasks but heavy integration and traceability overhead.

[Answer]: A — Use six medium units.

### Q3 — Dependency Topology

- A. Enumerate every cycle-free independence relation the contracts permit **(Recommended)** — the DAG records topology without choosing concurrency or economic implementation order.
- B. Strict linear dependency chain — easier coordination but encodes unnecessary coupling.
- C. Parallelize by deployment target — maximizes concurrency but risks contract drift and horizontal incompleteness.

[Answer]: A — Enumerate every cycle-free independence relation the contracts permit without choosing concurrency or economic implementation order.

### Q4 — Integration Contracts

- A. Explicit versioned domain/API/migration/BFF seams **(Recommended)** — exact pricing v1, service-owned schemas, Booking PricingPort/snapshot codec, authenticated BFFs, and nginx base path are unit boundaries.
- B. Shared internal models across units — less mapping but couples Charge, Booking, and UI implementations.
- C. Event-first integration — asynchronous separation but contradicts the approved synchronous critical path.

[Answer]: A — Use explicit versioned domain/API/migration/BFF seams.

### Q5 — Deployment Model

- A. Hybrid embedded units in existing deployables **(Recommended)** — units deliver independently testable capability but merge into current Charge service/app, Booking service/app, and isolated Compose wiring.
- B. Independently deploy every unit — creates unapproved services/apps.
- C. One monolithic W2-03 deployment — conflicts with service ownership and existing topology.

[Answer]: A — Embed independently testable units in the existing Charge, Booking, UI, and isolated Compose deployables.

## Ambiguity Check

All answers select concrete Option A boundaries. No vague deployment target, contract ownership, accidental economic sequencing, hidden shared-UI ownership, or new-service implication remains.

## Proposed Decomposition Plan

| Unit | Capability boundary | Direct dependencies | Embedded deployment |
| --- | --- | --- | --- |
| `U01-rate-authority` | Versioned BASE/OFR, SURCHARGE/BAF, LOCAL/THC domain, single-owner Charge Flyway V1-V4 chain, approval concurrency, admin API and Charge-owned rate pages. | none | Existing Charge service/app. |
| `U02-charge-domain-routing-bff` | Charge `basePath`, nginx 18088 mount, authenticated BFF/session/correlation/reference seams, route-state/accessibility foundation; no shared shell/UI source changes. | none | Existing Charge app/nginx Compose config. |
| `U03-agreement-authority` | Versioned approved agreement behavior consuming U01-owned V3 schema, exact three rate-version links, successor/suspend/expire, admin API and Charge-owned agreement pages. | U01, U02 | Existing Charge service/app. |
| `U04-pricing-provider-manual-cases` | Exact additive pricing v1 and behavior consuming U01-owned V4 schema, agreement-first/tariff fallback, three-line calculator, receipt/idempotency, no-rate/ambiguity OPEN cases and evidence API/page. | U01, U02, U03 | Existing Charge service/app and contract catalog. |
| `U05-booking-consumption-repricing` | Existing PricingPort adapter, typed immutable snapshots/legacy decode, explicit Reprice, success/history breakdown, bounded outage/manual projection and failure fidelity. | U04 | Existing Booking service/app. |
| `U06-isolated-acceptance-preservation` | Cross-service regression, migration/restart/performance proof, responsive/a11y Playwright evidence, manager-demo guards, Wave A Compose, `aidlc-audit`, and `erp-fidelity-audit`. | U01, U02, U03, U04, U05 | Existing test/evidence tooling and isolated `linercore-wave-a`. |

The DAG records `U01` and `U02` as an independent antichain. It intentionally does not choose whether to run them concurrently, which to implement first, identify a critical path, or apply value/risk sequencing; Stage 2.8 owns those decisions.

## Plan Approval

[Answer]: Approve Plan — generate the six units and dependency DAG without selecting an economic build order.

# Constraint Register - W2-04 Container Journey and Track-Trace

## Traceability and status model

This register constrains the approved `intent-statement.md` using the sourcing
and standards conclusions in `competitive-analysis.md`, `market-trends.md`, and
`build-vs-buy.md`. Status values are **Binding**, **Pending dependency**, or
**Open policy input**. A constraint may narrow delivery but cannot silently
broaden the approved intent.

## Technical constraints

| ID | Constraint | Status | Consequence / evidence |
|---|---|---|---|
| TC-01 | Booking-to-CMM and CMM-to-Booking normal delivery remains Kafka-based through the established outbox/consumer seams | Binding | Synchronous HTTP or local-noop evidence cannot satisfy acceptance |
| TC-02 | Each service owns and writes only its database | Binding | Booking consumes a projection event; it does not query CMM tables, and CMM does not write Booking tables |
| TC-03 | Existing Avro/AsyncAPI field names and envelope meaning remain frozen for W2-04 | Binding | Domain language may be richer, but the status contract keeps producer-owned `moveCode` unless compatibility governance approves a change |
| TC-04 | The thin domain vocabulary is GTOT, LOAD, DISC, GTIN with ACT and explicit equipment/location values | Binding | Unknown classifiers/codes fail validation; no broader event catalog is implied |
| TC-05 | Routing is one confirmed booking, one assigned container, one leg, expected POL LOAD and POD DISC | Binding | Transshipment and multi-leg planning remain P2-04 |
| TC-06 | Accepted movement, lifecycle state, audit record, and outgoing status must share the established atomic transaction/outbox boundary | Binding | A publish failure must be recoverable without losing committed business intent or double-advancing state |
| TC-07 | Both consumers must tolerate at-least-once delivery and distinguish duplicate/stale input | Binding | Stable dedupe keys and observable audit outcomes are required |
| TC-08 | Database evolution is additive and ordered | Binding | Existing-data upgrade, restart, and repair evidence is required; destructive reset is not migration proof |
| TC-09 | Domain-core code remains free of Spring, persistence, messaging, and frontend dependencies | Binding | Lifecycle rules and value objects stay independently testable |

## UI and ownership constraints

| ID | Constraint | Status | Consequence / evidence |
|---|---|---|---|
| UI-01 | W2-04 owns Container Movement pages and page-specific design record only | Binding | Do not redesign `packages/ui`, tokens, navigation, authentication, typography, palette, or shared shell |
| UI-02 | UI work follows `design-system/linercore/MASTER.md`, `SESSION-PROMPT.md`, and the Container Movement page file | Binding | Operational console patterns override marketing/hero/decorative advice |
| UI-03 | Final visuals use the W2-02 merged baseline | Pending dependency | Owned work may proceed, but 375/768/1024/1440 and light/dark evidence waits for integration synchronization |
| UI-04 | Status never relies on color alone | Binding | DCSA code and readable label remain visible with focus, error, loading, empty, denied, validation, and success states |

## Runtime and acceptance constraints

| ID | Constraint | Status | Consequence / evidence |
|---|---|---|---|
| AC-01 | Manager demo port 8088 remains protected | Binding | `npm run demo:guard` must pass before and after; no acceptance command may target its Compose project |
| AC-02 | Wave A acceptance uses `scripts/wave-a-compose.mjs` and project `linercore-wave-a` | Binding | Unscoped Compose shutdown or alternate project evidence is invalid |
| AC-03 | Only one concurrent Wave A intent controls the live acceptance stack | Binding | Acquire/coordinate the serialized slot before final Compose and Playwright proof |
| AC-04 | W2-02 merges before W2-04 final visual/live acceptance | Pending dependency | Synchronize integration immediately before final acceptance and re-run affected checks |
| AC-05 | Real proof spans broker, Schema Registry, service databases, Booking projection/UI, and rejection outcomes | Binding | Unit tests, outbox rows, startup health, or screenshots alone are insufficient |
| AC-06 | `aidlc-audit` and `erp-fidelity-audit` are green | Binding | ERP detector 4 must observe DCSA at the real code seams |

## Scope, evidence, and organizational constraints

| ID | Constraint | Status | Consequence / evidence |
|---|---|---|---|
| SC-01 | EDI ingestion, public DCSA APIs, multi-leg routing, fleet registry, depot stock, condition/lease breadth, and M&R are excluded | Binding | Route requests to their owning future intents |
| SC-02 | Existing W0/W1 and parallel Wave A work is preserved | Binding | Avoid broad rewrites and resolve overlaps through the backlog merge protocol |
| SC-03 | The historical W1 waiver and original BLOCKED manifest remain unchanged and distinct from the later W1 PASS | Binding | W2-04 creates new evidence; it does not revise history |
| SC-04 | No unsupported staffing, budget, procurement price, market size, or delivery date is asserted | Binding | Use ordinal risk/size and observed repository evidence until owners supply figures |

## Security and compliance constraints

| ID | Constraint | Status | Consequence / evidence |
|---|---|---|---|
| CC-01 | Movement capture and reads use authenticated, least-privilege roles | Binding | Denied behavior and actor propagation need test and live evidence |
| CC-02 | Operational identifiers and audit data are minimized and access-controlled | Binding | Store only identifiers necessary for traceability; never include secrets in evidence |
| CC-03 | Audit history records actor, action, target, time, correlation, and outcome | Binding | Duplicate and out-of-sequence rejection must be reviewable |
| CC-04 | Retention and privacy-response duration follow organization policy | Open policy input | Resolve during NFR requirements; absence of a supplied duration is not permission for indefinite retention |
| CC-05 | PCI-DSS, HIPAA, and AWS residency controls are not asserted without applicability evidence | Binding | Reassess only if data types, jurisdictions, or deployment requirements change |

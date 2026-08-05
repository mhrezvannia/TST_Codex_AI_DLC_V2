# Prioritized Intent Backlog - W2-03 Charge Tariffs & Agreements

This proto-backlog decomposes the [`scope-document.md`](scope-document.md) while remaining traceable to the upstream [`intent-statement.md`](../intent-capture/intent-statement.md), [`feasibility-assessment.md`](../feasibility/feasibility-assessment.md), and [`constraint-register.md`](../feasibility/constraint-register.md). It guides later story and Unit generation; it is not permission to create horizontal component-only Units.

## Prioritization Method

All five entries are **Must Have** for the release. Order uses walking-skeleton plus risk-first reasoning within the dependency chain. No numeric WSJF/RICE score is assigned because economic value, time criticality, staffing, calendar duration, and reach inputs were not supplied.

Ordinal decision factors are:

- **Value:** ability to produce observable carrier-pricing value.
- **Risk reduction:** contract, versioning, migration, cross-module, or degraded-path uncertainty retired.
- **Dependency leverage:** amount of later work unblocked.
- **Relative size:** small/medium/large as a planning signal, not a duration promise.

## Ordered Proto-Backlog

| Rank | ID | Vertical outcome | Value | Risk reduction | Dependency leverage | Relative size | Completion evidence |
|---:|---|---|---|---|---|---|---|
| 1 | PB-01 | Walking skeleton: one versioned applicable charge basis and approved agreement prices one Booking with a real itemised snapshot visible through existing UI seams | High | Highest | Highest | Medium | Contract/provider/consumer tests, migration proof, one isolated known-rate flow, Booking-visible line |
| 2 | PB-02 | Commercial depth: authorized Charge pages maintain distinct tariff, surcharge, local charge, and immutable agreement versions with approval/audit behavior | High | High | High | Large | Domain/API/UI tests, actor evidence, version immutability, applicable-rate detail |
| 3 | PB-03 | Complete known-rate calculation: OFR/BAF/THC quantity math, totals, source attribution, idempotent replay, and complete Booking breakdown | High | Medium | Medium | Medium | Deterministic calculation matrix, exact contract evidence, retained Booking snapshot/UI proof |
| 4 | PB-04 | Repricing: an amended Booking obtains a new price snapshot while the original pricing basis and audit history remain intact | High | High | Medium | Medium | Initial/reprice API, database, and UI evidence across amendment sequences |
| 5 | PB-05 | No-rate/manual and release closure: unmatched input creates the manual case and Booking state, while transient failures remain distinct; the full slice passes responsive Playwright, demo guards, and both audits | High | Highest | Release gate | Medium | Manual-case/Booking evidence, timeout/503/circuit tests, four viewports, pre/post guards, green audits |

## Dependency Graph

- PB-01 establishes the minimal executable contract/version/migration path.
- PB-02 consumes that path and establishes full owned commercial administration.
- PB-03 consumes PB-01 and PB-02 to complete the approved known-rate calculation.
- PB-04 consumes the persisted snapshot/version semantics proven by PB-03.
- PB-05 consumes the same contract and UI seams, adds the focal no-rate path, and closes integrated acceptance.

Permitted overlap is limited to work that does not create two owners for the ordered migration chain, contract files, or shared Charge pages. Later Unit generation must allocate those shared files explicitly.

## MoSCoW Boundary

### Must Have

PB-01 through PB-05 in full, including their live and audit evidence.

### Should Have

None separately. Omitting any stated behavior breaks the vertical release.

### Could Have

Minor Charge-local usability improvements that use existing components and do not delay Must-Have evidence.

### Won't Have This Time

Optimization, public/external rate distribution, D&D, settlement, multi-currency conversion, generic rating dimensions, external provider integration, global shell/design-system work, and cloud deployment.

## Release and Stop Rules

- Do not declare an intermediate PB item to be the W2-03 release; partial progress is evidence toward the complete slice.
- Stop for scope review if a backlog item requires a new domain authority, public contract break, manager-demo mutation, or global UI ownership.
- Stop final acceptance if Docker access is unavailable, the pre-guard fails, the stack is not `linercore-wave-a`, Booking lacks source-attributed lines, or either audit is red.

## Upstream Coverage

The `intent-statement` makes the cross-domain thin journey indivisible. The `feasibility-assessment` drives the skeleton/risk-first order and live-environment release condition. The `constraint-register` supplies the hard contract, migration, UI, preservation, runtime, and evidence checks attached to each backlog outcome.

# Ideation Decision Log — W3-04 Booking Request Completeness

## Decision provenance

This log consolidates decisions from `intent-statement.md`, `scope-document.md`, `intent-backlog.md`, `competitive-analysis.md`, `feasibility-assessment.md`, `constraint-register.md`, `team-assessment.md`, and `wireframes.md`. Detailed question/answer evidence remains in each stage’s question artifact and the deterministic audit log.

## Intent Capture decisions

| ID | Decision | Result |
|---|---|---|
| IC-01 | Commercial baseline | Full approved customer/party, cargo, package, weight and optional volume baseline |
| IC-02 | Schedule model | Requested departure editable as POL-local date; carrier voyage/ETD/ETA/cutoffs/deadline derived, read-only and snapshotted |
| IC-03 | Party requiredness | Booking customer and shipper required; consignee and notify optional |
| IC-04 | Cargo requiredness | Description, commodity, package count/type and gross weight required; volume optional |
| IC-05 | Temporal semantics | Requested date is local calendar date; derived voyage facts are timezone-aware instants |
| IC-06 | Legacy behavior | Upcast only authoritative facts; classify unsupported facts explicitly incomplete |
| IC-07 | Equipment/request boundary | One FCL-dry equipment request with positive quantity; no physical identifier initially |

## Market Research decisions

| ID | Decision | Result |
|---|---|---|
| MR-01 | Comparison set | Carrier portals, TMS/forwarding suites, and DCSA ecosystem |
| MR-02 | Evaluation lens | Operational fidelity and trustworthy recovery, not marketing feature count |
| MR-03 | Product posture | Differentiate on trustworthy operations for internal Booking users first |
| MR-04 | Build/buy | Build Booking-owned core on LinerCore; selectively reuse standards/connectivity |
| MR-05 | Financial claims | Qualitative TCO only; no invented vendor price or ROI |

## Feasibility decisions

| ID | Decision | Result |
|---|---|---|
| FE-01 | Feasibility verdict | CONDITIONAL GO |
| FE-02 | Schedule contract | Shared Platform must add typed cutoff/deadline authority or scope returns to a gate |
| FE-03 | Migration | Additive, rolling-compatible, restartable/idempotent, observable, no invention |
| FE-04 | Infrastructure | Reuse on-prem Compose/PostgreSQL/Kafka/Keycloak/observability; no AWS scope |
| FE-05 | Contracts | Exact Charge mapping and BACKWARD-compatible confirmation with nullable/absent identifier |
| FE-06 | Security/privacy | Treat party/customer references as Confidential and PII-linked; retain existing controls and defer program geography decisions |

## Scope Definition decisions

| ID | Decision | Result |
|---|---|---|
| SC-01 | Minimum release | Full create→reopen/correct→validate→price→confirm→event/detail vertical path |
| SC-02 | Backlog shape | Five vertical proto-increments; no layer-only delivery |
| SC-03 | Sequence | Risk-first within dependency order |
| SC-04 | Optional fields | Capture consignee/notify/volume but do not block confirmation when blank |
| SC-05 | Change control | Adjacent breadth routes to future intents unless the user reopens scope at a gate |
| SC-06 | Calendar | No hard deadline documented; later constraint must be surfaced explicitly |

## Team Formation decisions

| ID | Decision | Result |
|---|---|---|
| TF-01 | Staffing basis | Role-based accountable plan; names/allocations deferred to Delivery Planning |
| TF-02 | Topology | Booking stream-aligned Driver with time-boxed contributors and enabling support |
| TF-03 | Capacity | TBD; no utilization guesses |
| TF-04 | Collaboration | Focused mobs/pairs for high-risk seams; reviewed solo work for bounded tasks |
| TF-05 | Locations | Async-first; no co-location assumption |
| TF-06 | External support | None required unless a verified gap remains |
| TF-07 | Decision rights | Product/user gates; accountable Booking/contract/UI owners; assurance validates exit evidence |

## Rough Mockups decisions

| ID | Decision | Result |
|---|---|---|
| UX-01 | Request composition | One page with five semantic groups and desktop/inline mobile review summary |
| UX-02 | Lifecycle separation | Explicit Save draft; one next action on detail; same-record correction |
| UX-03 | Detail hierarchy | Preserve Overview, Charges, Journey, Activity; enrich Overview with full request/provenance |
| UX-04 | Artifact breadth | Core desktop/mobile concepts plus correction/confirmation; complete state matrices |
| UX-05 | UI authority | LinerCore overrides generic skill marketing, palette/font, chart, spinner and alternate-shell recommendations |

## Approval & Handoff decisions

| ID | Decision | Result |
|---|---|---|
| AH-01 | Resource commitment | Enter Inception discovery only; budget/schedule/named capacity remain uncommitted |
| AH-02 | Mob readiness | Topology designed, not staffed/scheduled; dependent work awaits names, backups and windows |
| AH-03 | Recommendation | CONDITIONAL PROCEED to Inception; retain Conditional GO and all later gates |
| AH-04 | Authorization boundary | No implementation, funding, release or production claim follows from Ideation approval |

## Open commitments carried into Inception

1. Freeze field names, requiredness, allowed values, lengths, precision, units, temporal/provenance semantics, validation errors, authorization and PII handling.
2. Confirm the Shared Platform owner and delivery window for voyage cutoff/documentation-deadline authority.
3. Prove safe legacy classification/upcast and correction on representative old records.
4. Freeze and prove exact Booking→Charge mapping and provider failure/repricing behavior.
5. Preserve and prove compatible confirmation with full routing/equipment quantity and absent unassigned identifier.
6. Confirm LinerCore/UX/accessibility ownership and use the prescribed Refined Mockups prompt only after Requirements Analysis and User Stories approval.
7. Confirm named owners, backups, capacity, time zones, budget/schedule constraints, and live Compose acceptance ownership in Delivery Planning.

## Change and supersession rule

A later artifact may refine an Ideation decision within its approved boundary. Reversing scope, authority, requiredness, lifecycle, event privacy, shared-shell ownership, live evidence, or resource assumptions requires an explicit user approval gate and an updated decision entry; silent supersession is invalid.


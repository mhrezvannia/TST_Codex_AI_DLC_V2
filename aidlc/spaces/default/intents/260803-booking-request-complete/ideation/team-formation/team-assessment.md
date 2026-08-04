# Team Assessment — W3-04 Booking Request Completeness

## Assessment basis

This role-based assessment is derived from `scope-document.md`, `intent-backlog.md`, and `feasibility-assessment.md`. It does not claim a named roster, allocation percentage, location, or fixed delivery date. Those facts remain TBD and must be confirmed in Delivery Planning before work is committed.

## Readiness determination

**Conditionally ready.** W3-04 can proceed with Booking as the stream-aligned Driver and time-boxed contributions from existing domain owners. No new permanent team, vendor, contractor, AWS service, or AWS Professional Services engagement is justified. Readiness becomes delivery-committable only when named people, backups, and capacity are confirmed.

The operating shape follows the five dependency-valid proto-increments in `intent-backlog.md`: authoritative request spine, commercial completeness, legacy correction, exact pricing, and compatible confirmation/live proof.

## Role availability assessment

| Accountable role | Required contribution | Current evidence | Availability status | Confirmation checkpoint |
|---|---|---|---|---|
| User / Booking product owner | Scope, field semantics, user outcome, stage gates | Active user gates and approved scope | Accountable role known; named delegate TBD | Before Requirements Analysis commitment |
| Booking technical/domain owner | Booking model, API, persistence, seams, design decisions | Booking is the Driver in `feasibility-assessment.md` | Owning team known; named person and backup TBD | Delivery Planning |
| Booking frontend/BFF engineer | New Booking/detail flows inside LinerCore | Existing Booking UI and BFF are feasible | Skill needed; named coverage TBD | Delivery Planning |
| Booking backend/domain engineer | Aggregate, completeness, pricing/confirmation orchestration | Existing typed aggregate and service seams | Skill needed; named coverage TBD | Delivery Planning |
| Booking data/migration engineer | Snapshot version, safe upcast, ledger evidence | Versioned snapshots and migration ledger exist | Capability evidence exists; roster coverage unproven | Before PB-03 commitment |
| Shared Platform voyage/reference owner | Typed cutoff/deadline contribution and canonical validation | Explicit Conditional GO dependency | Required contributor; named availability unproven | Before PB-01 commitment |
| Charge contract owner | Exact pricing mapping, Pact/provider fixtures | Existing live quantity-aware provider | Required reviewer/contributor; named availability unproven | Before PB-04 commitment |
| CMM event consumer owner | Review compatible `booking.confirmed` behavior | Existing optional identifier contract | Required contract reviewer; named availability unproven | Before PB-05 commitment |
| LinerCore/W2-02 design-system owner | Shared UI governance and `@erp/ui` review | Ownership established in scope and project rules | Required reviewer; named availability unproven | Before UI implementation commitment |
| UX/product designer | Rough/refined interaction states and accessibility intent | UI-bearing stages are in scope | Skill needed; named coverage TBD | Before Rough Mockups execution |
| Quality/contract/accessibility engineer | Vertical, Pact, Avro, migration, a11y/responsive and live evidence | Release gates are binding | Skill needed; named coverage TBD | Delivery Planning |
| Security/privacy/compliance reviewer | Confidential/PII-linked controls and audit evidence | Existing controls apply; geography remains program-level | Time-boxed review needed; named coverage TBD | Requirements/NFR gates |
| Operations/platform engineer | Compose deployment, telemetry, live proof | Existing on-prem stack is sufficient | Time-boxed support needed; named coverage TBD | Before PB-05 live proof |
| Delivery facilitator | Dependency, capacity, gate and owner coordination | AI-DLC workflow active | Role required; named facilitator TBD | Delivery Planning |

No known capacity blocker is documented, but absence of a blocker is not proof of availability.

## Team topology

- **Driver:** one Booking stream-aligned team owns the end-to-end customer outcome and remains accountable across UI, BFF/API, domain, persistence, pricing orchestration, confirmation, and live proof.
- **Contributors:** Shared Platform and Charge contribute through explicit owned contracts; CMM reviews the event contract; LinerCore/W2-02 governs shared UI changes.
- **Enabling support:** UX, quality, security/privacy/compliance, operations, and AI-DLC specialists join at defined risk and gate checkpoints.
- **Prohibited topology drift:** no frontend/backend/database testing silos, no permanent cross-module mega-team, no second Booking shell or local theme, and no copied reference-data ownership.

## Capacity allocation agreement

1. No utilization percentage, velocity, or calendar commitment is inferred at Team Formation.
2. Work is sequenced risk-first within the dependency order in `intent-backlog.md`; PB-01 contract risks are confirmed before dependent commitments.
3. Each proto-increment requires one named accountable owner, one delivery owner, a backup for critical seams, and explicit contributor windows before it enters committed Delivery Planning.
4. Cross-team contributions are time-boxed around contract definition, implementation review, provider/consumer proof, and exit evidence rather than treated as open-ended shared ownership.
5. Any unavailable critical role or unresolvable capacity collision returns to an approval gate with impact on scope, sequence, and DoD; it must not be hidden by weakening evidence.

## Decision rights and RACI

R = Responsible, A = Accountable, C = Consulted, I = Informed.

| Decision or outcome | Product/user | Booking owner | Shared Platform | Charge | CMM | LinerCore/UX | Quality/security/compliance | Delivery |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Scope and stage approval | A | C | I | I | I | I | C | R |
| Booking domain/API/persistence design | C | A/R | C | C | C | C | C | I |
| Voyage/reference contract | I | C | A/R | I | I | I | C | I |
| Pricing contract and provider proof | I | R | I | A/R | I | I | C | I |
| Confirmation consumer compatibility | I | R | I | I | A/C | I | C | I |
| Shared-shell/UI-system change | C | R | I | I | I | A/R | C | I |
| Exit evidence and release quality | C | R | C | C | C | C | A/R | I |
| Capacity and dependency commitment | C | C | C | C | C | C | C | A/R |

## Constraints and risks

| Risk | Consequence | Treatment | Owner |
|---|---|---|---|
| Named availability remains unknown | Plan cannot become a credible calendar commitment | Confirm people, backups, and capacity in Delivery Planning | Delivery facilitator |
| Shared voyage cutoff/deadline ownership is unavailable | PB-01 and approved schedule completeness are blocked | Secure Shared Platform contribution or reopen schedule scope at a user gate | Shared Platform + product |
| Migration expertise is not staffed | Legacy bookings could be corrupted or invented | Assign proven snapshot/upcast owner and pair with quality on representative corpus | Booking owner |
| Contract specialists are engaged late | Pricing or confirmation compatibility can fail at convergence | Reserve Charge and CMM review windows before dependent increments | Booking owner + delivery |
| UI governance/a11y coverage is missing | Shared-shell or release gate violations | Confirm LinerCore/UX and accessibility reviewers before UI commitment | Booking owner + design owner |
| Time-zone assumptions cause missed reviews | Cross-team decisions stall | Use async-first artifacts; schedule synchronous sessions only for risk seams and gates | Delivery facilitator |

## Team readiness exit criteria

- Role topology and decision rights are approved.
- Named individuals, backups, actual capacity, locations, and collaboration windows are confirmed in Delivery Planning.
- Shared Platform accepts the cutoff/deadline contribution or the user explicitly revises scope.
- Charge, CMM, LinerCore/UX, quality, security/privacy/compliance, and operations checkpoints have named owners.
- No external partner is introduced without a verified gap and a new approval decision.


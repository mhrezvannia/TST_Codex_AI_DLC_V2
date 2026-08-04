# Stakeholder Map — W3-04 Booking Request Completeness

## Decision Structure

| Stakeholder | Role | Primary interest | Decision right |
|---|---|---|---|
| Booking product owner / intent approver | Decision-maker | Commercially usable FCL-dry request, bounded scope, observable user outcome | Approves intent, field baseline, confirmation completeness, and stage gates |
| Booking team | Driver and decision-maker | Coherent Booking UI/domain/persistence behavior and operable confirmation rules | Owns Booking composition, aggregate semantics, migrations/upcasting, and delivery |
| Booking-desk and customer-service users | Primary customer and influencer | Fast, accurate entry; preserved input; clear correction/retry paths; no invented container assignment | Validate workflow usability and operational acceptance evidence |
| Shared Platform / Reference Data | Contract reviewer and contributor | Canonical party, commodity, location, voyage, and equipment-type ownership | Approves reference lookup/validation use and canonical semantics |
| Charge / Pricing team | Contract reviewer and contributor | Exact pricing basis, quantity/date correctness, stable failures and repricing behavior | Approves `pricing.request` consumer/provider compatibility |
| CMM team | Downstream consumer and influencer | Stable, minimal, non-fabricated routing/equipment confirmation state | Reviews `booking.confirmed` compatibility; owns later equipment assignment behavior |
| LinerCore design-system owner / W2-02 owner | Governance decision-maker | One shared shell, tokens, patterns, accessibility, and responsive consistency | Approves shared UI primitive or master-pattern changes; domain page overrides stay bounded |
| Quality / ERP fidelity reviewers | Gatekeepers | Live-stack evidence, contract fidelity, accessibility, regression safety | Accept or reject exit evidence and audit gates |
| Security, privacy, and compliance reviewers | Influencers / conditional approvers | PII minimization, authorization, auditability, no unnecessary contract widening | Review party/customer storage, exposure, and retention implications |
| Operations and support | Influencers | Diagnosable provider failures, safe retries, explicit legacy incompleteness | Validate operational states, telemetry needs, and recovery behavior |

## Stakeholder Interests and Boundaries

- **Booking users:** need the full commercial baseline on one coherent request journey, authoritative selectable values, clear requiredness, and input preservation across validation or provider failures.
- **Booking team:** must replace the current physical-container-at-creation assumption while preserving brownfield records and established APIs/contracts through additive evolution.
- **Shared Platform:** remains the source of truth for canonical references and voyage schedule facts; Booking may snapshot the minimum confirmation/audit facts but must not fork reference masters.
- **Charge:** receives only the exact pricing-determining subset and must observe the same requested date and quantity the user confirmed.
- **CMM:** receives full current route/equipment request state but not Booking-owned party PII or cargo detail; absence of `equipmentId` is valid until later assignment.
- **Design governance:** W3-04 extends the reviewed Booking experience inside the existing LinerCore shell. It does not create a second frontend, local visual language, or independent shared primitives.
- **Quality and operations:** require live proof for degraded dependencies, retries, conflicts, duplicate submission, legacy incompleteness, accessibility, responsive behavior, and contract fidelity—not merely isolated tests.

## Communication Requirements

| Moment | Audience | Required communication / evidence |
|---|---|---|
| Intent Capture approval | Booking owner, Shared Platform, Charge, CMM, design governance | Confirm field/schedule decisions, ownership boundaries, no initial `equipmentId`, and deferred scope |
| Requirements Analysis | All contract owners plus quality/security | Publish the frozen field dictionary, requiredness, units/precision, temporal semantics, validation/error matrix, authorization, and measurable acceptance criteria |
| User Stories approval | Booking users, Booking owner, quality, design | Confirm end-to-end stories and negative/degraded-state acceptance without layer-only stories |
| Refined Mockups | Booking users, LinerCore owner, accessibility reviewer | Use UI/UX Pro Max with the named W3-04 prompt and execution guide; show canonical shell, operational states, keyboard/focus, and responsive evidence |
| Contract/application design review | Booking, Shared Platform, Charge, CMM, security | Review exact reference, pricing, and event mappings; record additive compatibility and PII boundaries |
| Construction and live exit gate | Booking, quality, operations, contract owners | Demonstrate the live Compose journey, exact payloads/events, failure recovery, auditability, and green `aidlc-audit` plus `erp-fidelity-audit` |

## Escalation Rules

- Any proposal to require a physical container during initial request/confirmation, widen `booking.confirmed` with party/cargo data, or copy canonical reference masters returns to the Booking owner and affected contract owner before implementation.
- Any shared-shell, token, primitive, or master-pattern change goes to the LinerCore/W2-02 owner; W3-04 may otherwise add only its Booking page-level behavior.
- Any field addition beyond the confirmed commercial baseline is assessed for shipping-instruction, reefer/DG, multi-leg, or documentation scope and routed to the owning future intent.
- Any unavailable authoritative legacy value remains explicitly incomplete; stakeholders may not approve fabricated backfill defaults.

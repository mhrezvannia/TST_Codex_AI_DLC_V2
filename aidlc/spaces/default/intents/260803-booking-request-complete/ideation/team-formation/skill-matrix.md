# Skill Matrix — W3-04 Booking Request Completeness

## Inputs and interpretation

This matrix converts the delivery needs in `scope-document.md`, `intent-backlog.md`, and `feasibility-assessment.md` into required capabilities. “Evidence exists” means the codebase or approved artifacts demonstrate a capability; it does not mean a named person is available.

## Required skill coverage

| Capability | Why W3-04 needs it | Primary role | Supporting roles | Evidence / confidence | Staffing action |
|---|---|---|---|---|---|
| Booking domain modelling | Separate equipment request from assignment; freeze completeness semantics | Booking backend/domain engineer | Product, architect, QA | Existing aggregate; medium confidence due invariant change | Name owner and reviewer |
| TypeScript/Next.js BFF and enterprise forms | Complete create/detail journey in one LinerCore shell | Booking frontend/BFF engineer | UX, accessibility QA | Existing UI/BFF; medium confidence | Confirm `@erp/ui` experience |
| Reference Data OHS and voyage modelling | Add authoritative cutoff/deadline and validate canonical facts | Shared Platform engineer | Booking engineer, QA | Voyage projection exists but fields are absent | Secure explicit contribution before PB-01 |
| PostgreSQL snapshot/schema migration | Add versioned model, safe upcast, projections, ledger proof | Booking data/migration engineer | Domain engineer, operations, QA | Versioned snapshot and migration ledger exist | Confirm proven owner and backup |
| Pricing contract/Pact integration | Map exact party/commodity/ports/type/date/quantity and failure semantics | Booking integration engineer | Charge owner, contract QA | Live provider is quantity/date aware | Reserve bilateral review and provider-test window |
| Kafka/Avro compatibility | Publish full routing/quantity with absent unassigned identifier | Booking integration engineer | CMM reviewer, contract QA | Optional identifier contract exists | Schedule compatibility review before PB-05 |
| Identity, authorization, privacy-safe logging | Protect Confidential and PII-linked references | Booking engineers | Security/privacy reviewer | Existing OIDC and control baseline | Focused threat/privacy review at Requirements/NFR |
| Accessible responsive interaction design | Prove keyboard, focus, live regions, reduced motion, required breakpoints | UX/product designer | Frontend engineer, accessibility QA, LinerCore owner | Binding release criteria; coverage unproven | Assign design and a11y reviewers before UI commitment |
| Vertical test design and live Compose evidence | Prove create-to-consume journey and negative/degraded states | Quality engineer | All contract owners, operations | Stack and gates exist | Name exit-evidence owner early |
| Observability and operational diagnostics | Trace reference, pricing, event, migration, conflict and retry paths | Operations/platform engineer | Booking engineers, QA | Existing Prometheus/ELK/Jaeger/Otel | Time-box telemetry design/review |
| Delivery facilitation and dependency control | Coordinate five proto-increments and cross-team windows | Delivery facilitator | Product and owners | Dependency graph approved | Confirm named facilitator in Delivery Planning |

## Capability gaps and remediation

| Gap | Classification | Remediation | Due checkpoint | Escalation condition |
|---|---|---|---|---|
| Named roster, backups, capacity and locations are absent | Planning evidence gap | Delivery Planning records person, backup, allocation window, location/time zone, and conflicts for every critical role | Delivery Planning gate | Any Must-have has no accountable owner or viable window |
| Voyage cutoff/deadline contributor is not confirmed | Conditional-GO gap | Shared Platform names an owner and accepts typed model/OHS/event/seed work | Before PB-01 commitment | Reopen approved schedule scope if contribution cannot be secured |
| Migration/upcast expertise is unproven at roster level | High-risk skill gap | Pair a proven data-migration owner with Booking domain and quality; rehearse representative old snapshots | Before PB-03 commitment | No safe, restartable/idempotent plan or owner |
| Pact/provider-test coverage is unproven | Contract skill gap | Booking and Charge run a focused mapping/error-semantics session and assign contract QA | Before PB-04 commitment | Provider proof window unavailable |
| Avro consumer-compatibility reviewer is unconfirmed | Contract skill gap | Book CMM review and Schema Registry compatibility evidence | Before PB-05 commitment | Consumer cannot accept optional absent identifier |
| LinerCore and accessibility reviewers are unconfirmed | UI governance gap | Name W2-02/design-system and a11y reviewers; use required UI skills/prompts at their prescribed stages | Before UI implementation commitment | Shared primitive change lacks owner or evidence |
| Security/privacy reviewer availability is unknown | Assurance gap | Time-box review of minimization, masking, authorization, retention linkage and audit evidence | Requirements/NFR gates | PII-linked scope lacks approved controls |

No verified gap currently justifies a vendor, contractor, cloud provider, or AWS Professional Services engagement.

## Onboarding and working-context checklist

Every named participant must receive only the context needed for their contribution, including:

- `scope-document.md`, `intent-backlog.md`, and `feasibility-assessment.md`.
- The W3-04 intent statement and its Context Pack.
- The relevant proto-increment, owning contract, upstream/downstream boundary, and exit evidence.
- The LinerCore `MASTER.md` and `SESSION-PROMPT.md` for UI contributors, plus the prescribed UI/UX Pro Max prompt only at Refined Mockups after Requirements Analysis and User Stories approval.
- Security classification, privacy-safe diagnostics rules, and the prohibition on party/cargo expansion in `booking.confirmed`.
- Live Compose, Pact, Avro, migration, accessibility/responsive, `aidlc-audit`, and `erp-fidelity-audit` expectations relevant to the role.

Onboarding is complete only when the participant confirms ownership, decision authority, availability window, backup, dependencies, and evidence obligation.

## Cross-training priorities

1. Pair Booking domain and data-migration skills on PB-01/PB-03 so snapshot compatibility is not isolated.
2. Pair Booking integration and contract QA with Shared Platform, Charge, and CMM at their respective seams.
3. Pair frontend/BFF implementation with LinerCore/UX and accessibility QA before shared primitives or complex state behavior is committed.
4. Include operations in migration and end-to-end proof design early enough to make failures observable, not merely testable.


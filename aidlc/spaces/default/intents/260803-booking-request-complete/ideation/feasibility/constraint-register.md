# Constraint Register — W3-04 Booking Request Completeness

## Inputs and Rating Model

Inputs: approved `intent-statement.md`, `competitive-analysis.md`, `market-trends.md`, and `build-vs-buy.md`, plus the binding enterprise environment and indexed brownfield code. Priority uses Critical / High / Medium / Low. “Release condition” means the constraint must have observable evidence before W3-04 exits.

## Active Constraints

| ID | Category | Constraint | Priority | Owner / reviewer | Required evidence | Status |
|---|---|---|---|---|---|---|
| C-01 | Scope | One FCL-dry route, one requested equipment line, USD; reefer/DG, multi-leg, amendments, assignment, SI/eBL, and external self-service remain deferred | High | Booking product owner | Approved requirements and stories contain no deferred breadth | Fixed |
| C-02 | Field semantics | Freeze one DCSA-aligned dictionary across UI, REST, domain, persistence, pricing fixtures, and event mappings before Application Design | Critical | Booking + architect | Versioned field dictionary with ownership, requiredness, units, lengths/precision, temporal semantics | Release condition |
| C-03 | Equipment lifecycle | Request is equipment type × positive quantity; physical `equipmentId` is absent until later assignment and must never be fabricated | Critical | Booking; CMM reviewer | Domain/API/UI/live-event tests with quantity >1 and no identifier | Release condition |
| C-04 | Reference ownership | Party, commodity, location, voyage, and equipment type remain live Shared Platform references; no copied masters or canonical free text | Critical | Shared Platform | OHS validation and stale/degraded behavior on live stack | Release condition |
| C-05 | Schedule authority | Requested departure is POL-local user intent; carrier number, ETD/ETA, cutoff, and documentation deadline are read-only voyage facts snapshotted on confirmation | Critical | Shared Platform + Booking | Typed voyage OHS/event fields and confirmation snapshot proof | Release condition |
| C-06 | Pricing contract | Booking sends the exact approved party/commodity/POL/POD/equipment/date/quantity basis; no guessed defaults or attributes-only mapping | Critical | Booking + Charge | Pact/provider fixtures and live captured request/quantity-scaled quote | Release condition |
| C-07 | Event contract | `booking.confirmed` stays minimal and BACKWARD-compatible; full route/equipment quantity, optional identifier, no party PII/cargo widening | Critical | Booking + CMM | Schema compatibility and consumed live event | Release condition |
| C-08 | Migration | Schema/snapshot evolution is additive and rolling-compatible; derive authoritative facts only, preserve legacy data, mark remainder incomplete | Critical | Booking | Versioned migration tests, ledger outcomes, rollback/retry evidence | Release condition |
| C-09 | UI governance | Use one authenticated LinerCore shell and `@erp/ui`; no second Booking app/theme/auth surface/shared primitive fork | High | Booking + W2-02 owner | Refined Mockups approval and implementation inventory | Fixed |
| C-10 | Privacy | Party/customer refs and customer reference are Confidential/PII-linked; minimize snapshots/logs and audit access; no event widening | High | Booking + compliance | Data-flow/classification matrix, masking/log tests, authorization evidence | Release condition |
| C-11 | Security | Keycloak/OIDC, identity authorization, BFF boundary, HttpOnly tokens, TLS/encryption/Vault, OWASP/CIS and dependency-license controls remain mandatory | High | Security/platform | Existing gates plus W3-04 authorization/negative tests | Fixed |
| C-12 | Infrastructure | On-premises Docker Compose only; no AWS account/service/region/CDK and no new infrastructure service for W3-04 | High | Platform/architecture | Compose diff shows existing topology; normal DB/schema/config changes only | Fixed |
| C-13 | Consistency | Pricing is synchronous/strongly consistent; reference/events follow published OHS and Kafka/Avro rules; no shared DB | High | Architecture | Contract tests, correlation/trace evidence, no cross-database access | Fixed |
| C-14 | Standards | UN/LOCODE, ISO equipment type codes, DCSA naming, ISO-8601/timezone-aware instants; cargo gross weight is not mislabeled as SOLAS VGM | High | Booking + Shared Platform | Field dictionary and boundary tests | Release condition |
| C-15 | Quality | Live Compose DoD, contract/a11y/responsive evidence, `aidlc-audit`, and `erp-fidelity-audit` are mandatory; tests alone are insufficient | Critical | Quality + Booking | Green exit manifests from the same live run | Fixed |
| C-16 | Delivery | No documented fixed date/budget; protect feature/Standard slice and escalate explicit tradeoffs | Medium | Booking product owner | Delivery plan records capacity and any later constraint decision | Assumption |
| C-17 | Organization | Booking drives; Shared/Charge contribute via contracts; no known freeze/capacity blocker | Medium | Delivery lead | Revalidated ownership and availability in Delivery Planning | Assumption |
| C-18 | Geography | Trade footprint, primary/DR sites, retention/residency, and possible FMC applicability remain program-level TBD | High | Program/compliance | Program decision before affected production rollout; W3-04 does not infer geography | External constraint |

## Constraint Interactions

- C-05 depends on C-04: Booking cannot claim read-only schedule authority until Shared Platform owns and serves all required voyage facts.
- C-03, C-06, and C-07 must be proved together with quantity >1 and no `equipmentId`; isolated layer tests cannot establish correctness.
- C-08 must preserve C-10: migration diagnostics may record outcomes/reasons but must not leak party/cargo payloads.
- C-09 and C-15 require the later UI/UX Pro Max Refined Mockups process named in the approved intent, after Requirements Analysis and User Stories approval.
- C-18 may tighten C-10/C-11 later but is not a reason to invent AWS or residency work now.

## Change Control

Any requested relaxation of a Critical constraint returns to an AI-DLC approval gate. Any scope addition is routed to the named future intent unless the Booking product owner explicitly reopens W3-04 scope and affected contract owners approve the change.


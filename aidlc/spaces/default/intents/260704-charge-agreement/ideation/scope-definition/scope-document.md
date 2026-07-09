# Scope Document - Charge & Customer Agreement

## Upstream Inputs

This scope consumes:

| Input | Scope effect |
| --- | --- |
| `intent-statement.md` | Establishes Charge & Customer Agreement as the first business module after Shared Platform. |
| `feasibility-assessment.md` | Confirms the module is feasible using the existing Java/Spring and Next.js monorepo patterns. |
| `constraint-register.md` | Sets boundaries around Shared Platform consumption, host-runtime reliability, auth bypass, and test posture. |

## Objective

Deliver a locally functional Charge & Customer Agreement module that lets internal commercial users manage customer agreements and charge terms, then exposes approved active terms for the future Customer Booking module.

## In Scope

| Capability | Included outcome |
| --- | --- |
| Agreement lifecycle | Create, update, list, view detail, approve, suspend, and expire agreements. |
| Charge terms | Add/edit/remove charge lines with charge code, basis, currency, amount, validity, and lane/commodity context. |
| Backend service | Domain model, application service, persistence, container/API adapter, and tests following the existing Maven layout. |
| UI app | Functional Next.js workspace with list, detail, create/edit, approval/status actions, and error/loading states. |
| Shared Platform integration | Consume reference IDs/data for customers, charge codes, currencies, locations, commodities, and trade lanes. |
| Active lookup contract | API for Booking to resolve approved terms by customer, route/trade lane, commodity, and date. |
| Local runtime | Host-runtime support with documented ports, health, seed/demo data, smoke checks, and readiness evidence. |
| Quality | Unit, service/API, UI, and script/smoke tests integrated into existing quality-gate style. |

## Out of Scope

| Capability | Reason deferred |
| --- | --- |
| Customer Booking | Next module in the roadmap. |
| Container Movement Management | Third module in the roadmap. |
| Invoice settlement and payment collection | Later finance/revenue workflow. |
| Public tariff database | Not needed to prove first business module. |
| Spot-rate marketplace | Future extension when no agreement is active. |
| Index-linked pricing | Advanced commercial feature after core journey works. |
| Carrier direct connectivity | External integration complexity outside local MVP. |
| Production deployment | Operation stages may define readiness, but first completion targets local/staging evidence. |

## MVP Completion Criteria

| Criterion | Acceptance signal |
| --- | --- |
| Functional backend | Agreement and charge-term APIs support create, read, update, approve, and search flows. |
| Functional UI | User can manage agreements without editing files or using raw API calls. |
| Reference integration | UI/API use Shared Platform reference sets instead of duplicating reference data. |
| Booking handoff | Active lookup API is documented and covered by tests. |
| Local run evidence | New module can run alongside current Shared Platform host-runtime services. |
| Quality evidence | Relevant tests and smoke/readiness checks pass. |

## Value Stream

```text
+-------------------+      +-------------------+      +-------------------+
| Pricing user     | ---> | Agreement terms   | ---> | Booking lookup    |
| creates agreement|      | approved/active   |      | consumes terms    |
+-------------------+      +-------------------+      +-------------------+
          |                         |                         |
          v                         v                         v
 Shared Platform refs       Charge Agreement API       Future Booking module
```

Text fallback: A pricing user creates an agreement using Shared Platform reference data; the Charge Agreement API stores and approves the terms; the future Booking module looks up approved active terms.

## Scope Guardrails

1. Do not rebuild Shared Platform capabilities inside this module.
2. Do not expand the first slice into full RMS, invoice settlement, or carrier connectivity.
3. Do not ship view-only UI as complete.
4. Do not treat Docker recovery as a blocker for host-runtime product construction.
5. Do not start Booking until active-agreement lookup is implemented and verified.

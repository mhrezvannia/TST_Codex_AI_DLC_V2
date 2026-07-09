# Initiative Brief - Charge & Customer Agreement

## Executive Summary

Charge & Customer Agreement is the next LinerCore business module after Shared Platform. The module will let internal commercial users create, maintain, approve, and search customer agreements with charge terms, then expose approved active terms to the future Customer Booking module.

Recommendation: Go to Inception.

## Source Artifacts

| Artifact | Key contribution |
| --- | --- |
| `intent-statement.md` | Defines the business gap, target users, success metrics, and roadmap order. |
| `scope-document.md` | Defines in-scope lifecycle/API/UI/reference-data integration and explicit exclusions. |
| `intent-backlog.md` | Defines proto-units CA-01 through CA-12 and the walking-skeleton-first sequence. |
| `competitive-analysis.md` | Confirms charge/rate agreement management is table-stakes in logistics systems. |
| `feasibility-assessment.md` | Confirms build feasibility using existing Java/Spring and Next.js patterns. |
| `constraint-register.md` | Captures technical, business, security, and delivery constraints. |
| `team-assessment.md` | Confirms a solo AI-assisted delivery model is sufficient for the first module slice. |
| `wireframes.md` | Defines low-fidelity screens for workbench, detail, editor, and active lookup. |

## Problem and Opportunity

Shared Platform is locally functional, but the product remains incomplete without a business capability that uses it. Booking cannot be built cleanly until there is an authoritative source for approved customer agreement terms. Charge & Customer Agreement fills that gap and prevents downstream placeholder pricing assumptions.

## Scope Boundary

In scope:

| Area | Outcome |
| --- | --- |
| Agreement lifecycle | Draft, approved, suspended, expired states with traceable metadata. |
| Charge terms | Charge code, basis, currency, amount, validity, lane/commodity context. |
| Backend | Service/API/persistence following repo conventions. |
| UI | Functional list, detail, create/edit, approval, and lookup flows. |
| Integration | Shared Platform reference data and future Booking active-term lookup. |
| Quality | Tests, smoke checks, and readiness evidence. |

Out of scope: Booking, Container Movement, invoice settlement, payment collection, public tariffs, spot rates, index-linked pricing, carrier direct connectivity, and production deployment.

## Feasibility and Risk Highlights

| Item | Position |
| --- | --- |
| Technical feasibility | Feasible using existing monorepo patterns. |
| Local runtime | Host-runtime is the current reliable path. |
| Docker/Compose | Known environment risk; not a blocker for host-runtime construction. |
| Scope risk | Controlled by deferring RMS breadth and focusing on agreement lifecycle plus active lookup. |
| Compliance risk | Manageable with local-only bypass, role controls, and approval metadata. |

## Concept Screens

The rough mockups define four first-slice screens:

1. Agreement Workbench.
2. Agreement Detail.
3. Create/Edit Agreement.
4. Active Agreement Lookup Preview.

These screens are operational, dense, and functional rather than marketing-oriented. They address the prior problem that UI must not remain view-only.

## Delivery Plan

| Sequence | Focus | Confidence gained |
| --- | --- | --- |
| 1 | Walking skeleton | New module can run locally. |
| 2 | Domain and charge terms | Core business rules are testable. |
| 3 | Persistence and APIs | Backend is usable beyond demo state. |
| 4 | UI and status actions | Users can manage agreements functionally. |
| 5 | Shared Platform integration and seed/runtime | Local proof works with upstream services. |
| 6 | Booking handoff | Next module has a stable lookup contract. |

## Go / No-Go

Go.

The initiative has a clear problem, bounded MVP scope, feasible technical path, visible risks, usable rough mockups, and a delivery sequence aligned to the remembered product roadmap.

# Team Assessment - LinerCore Enterprise

## Source Context

This assessment consumes:

- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/scope-definition/scope-document.md`
- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/scope-definition/intent-backlog.md`
- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/feasibility/feasibility-assessment.md`

## Assessment Summary

The enterprise scope requires a multi-workstream delivery model. Named team members and capacity are not yet known, so this stage defines the minimum role topology and skill coverage needed before Delivery Planning assigns Bolts.

The program should not run as one large cross-domain mob. The scope crosses platform, commercial pricing, booking, movement, frontend, runtime, security, quality, and operation concerns. A single undifferentiated team would overload cognitive capacity and blur module ownership. Use stream-aligned module mobs, supported by platform and enabling specialists.

## Recommended Team Topology

| Team Type | Team | Primary Purpose | Interaction Mode |
|-----------|------|-----------------|------------------|
| Platform team | Shared Platform and Runtime | Reference data, identity, Kafka/SR, Keycloak, Docker profiles, CI/CD foundations, observability platform | X-as-a-service after initial collaboration |
| Stream-aligned team | Charge & Agreement | Agreements, tariffs, pricing, D&D rules/calculation, pricing contracts | Collaboration with Booking, then service interface |
| Stream-aligned team | Customer Booking | Booking lifecycle, pricing orchestration, movement consumption, D&D trigger, exceptions | Collaboration with Charge and CMM |
| Stream-aligned team | Container Movement Management | Journey creation, movement validation, status derivation, `containermovement.status` | Collaboration with Booking |
| Stream-aligned/enabling team | Enterprise UI | Authenticated UX across reference data, agreements, bookings, movements, D&D, exceptions | Collaboration across all domain teams |
| Enabling team | Security, Compliance, Quality, Operations | Authz, audit, contracts, E2E, performance, runbooks, incident readiness | Facilitating and review |

## Minimum Staffing Model

| Role | Minimum Coverage | Primary Workstreams |
|------|------------------|---------------------|
| Product owner / domain analyst | 1 lead + module SMEs | All |
| Solution architect | 1 lead | Boundaries, contracts, runtime, cross-module decisions |
| Delivery lead | 1 | Sequencing, gates, team coordination |
| Backend engineers | 4-6 across module mobs | Shared Platform, Charge, Booking, CMM |
| Frontend engineers | 2-3 | Enterprise UI, BFF/API integration |
| Platform/DevOps engineer | 1-2 | Docker, CI/CD, Kafka/SR, Keycloak, observability |
| QA/automation engineer | 1-2 | Contract, integration, E2E, performance evidence |
| Security/compliance specialist | 0.5-1 allocated | Controls, audit, data classification, incident readiness |
| Operations/SRE specialist | 0.5-1 allocated | Runbooks, dashboards, alerts, SLOs, DR |
| DCSA/EDI/domain specialist | as-needed | Movement semantics, external feeds, DCSA validation |

## Capacity Assessment

| Capacity Area | Status | Risk | Action |
|---------------|--------|------|--------|
| Named availability | Unknown | High | Confirm names, allocation %, time zones before Delivery Planning |
| Backend domain capacity | Required | High | Allocate module owners for Shared Platform, Charge, Booking, CMM |
| Frontend capacity | Required | Medium | Assign UI lead early to normalize Claude UI baseline |
| Platform/runtime capacity | Required | High | Assign platform owner before any full-runtime gate |
| Contract-test expertise | Required | High | Add quality/contract specialist or upskill module engineers |
| Security/compliance | Required | Medium | Schedule reviews at NFR and Operation gates |
| DCSA/EDI expertise | Required later | Medium | Identify specialist for CMM requirements and validation |

## Team Formation Recommendation

Proceed with role-based planning now, with a hard follow-up before Delivery Planning:

1. Confirm named owners for each workstream.
2. Confirm availability and time zones.
3. Decide whether to spawn child module intents or keep module work as units under the parent enterprise intent.
4. Assign a cross-workstream contract council for `booking.confirmed`, `containermovement.status`, and pricing APIs.
5. Assign a runtime council for Docker, Keycloak, Kafka/SR, PostgreSQL, observability, and CI/CD.

## RACI Summary

| Area | Responsible | Accountable | Consulted | Informed |
|------|-------------|-------------|-----------|----------|
| Enterprise scope | Product owner | Business sponsor | Architecture, delivery | All teams |
| Module boundaries | Architecture lead | Architecture owner | Product, module leads | All teams |
| Shared Platform | Platform team | Platform owner | Security, module teams | Product |
| Charge/D&D | Charge team | Commercial owner | Booking, quality | Platform, CMM |
| Booking | Booking team | Booking operations owner | Charge, CMM, UI | Product |
| CMM | CMM team | Operations owner | Booking, DCSA/EDI specialist | Product |
| UI | Frontend team | Product/UX owner | Module teams, security | All users |
| Contracts/testing | Quality + module teams | Quality owner | Architecture, platform | Product |
| Operation readiness | Platform/Ops | Operations owner | Security, quality, module teams | Business sponsor |

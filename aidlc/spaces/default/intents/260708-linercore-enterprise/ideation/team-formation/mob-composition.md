# Mob Composition Plan - LinerCore Enterprise

## Source Context

This mob plan consumes:

- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/scope-definition/scope-document.md`
- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/scope-definition/intent-backlog.md`
- `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/feasibility/feasibility-assessment.md`

## Mob Principles

- Use mobs for high-uncertainty, high-risk, cross-boundary work.
- Use pairs for focused module implementation where boundaries and design are clear.
- Use solo work only for well-understood, low-risk tasks with clear review criteria.
- Rotate driver every 10-15 minutes during mob sessions.
- One primary navigator speaks at a time.
- Keep a visible parking lot for unresolved design or scope questions.

## Recommended Mobs

| Mob | Composition | Focus | When to Use |
|-----|-------------|-------|-------------|
| Platform Foundation Mob | Platform engineer, backend engineer, security specialist, QA/contract specialist, architect | Keycloak, Kafka/SR, event envelope, outbox, local runtime | Early baseline and contract foundation work |
| Charge/D&D Mob | Charge backend engineer, pricing SME, QA engineer, Booking representative, architect | Agreements, pricing, D&D rules/calculation, pricing contracts | Pricing and D&D design/build slices |
| Booking Orchestration Mob | Booking backend engineer, product/domain SME, Charge representative, CMM representative, QA engineer | Booking lifecycle, pricing orchestration, D&D trigger, exceptions | Booking state-machine and cross-module workflow slices |
| CMM Movement Mob | CMM backend engineer, DCSA/EDI specialist, Booking representative, QA engineer, architect | Journey creation, movement validation, dedupe/order, status events | CMM state and event implementation |
| Enterprise UI Mob | Frontend lead, UX/product representative, module backend representative, security representative, QA engineer | Claude UI normalization, UI/BFF/API mapping, accessibility | UI slices crossing multiple modules |
| Runtime/Operation Mob | Platform/DevOps, SRE/operations, QA, security, module representatives | Compose profiles, observability, CI/CD, runbooks, health checks | Runtime and Operation readiness gates |

## Collaboration Calendar Pattern

| Cadence | Session | Participants | Output |
|---------|---------|--------------|--------|
| Weekly | Program coordination | Product, architecture, delivery, workstream leads | Dependency decisions and risk updates |
| Twice weekly during inception | Contract council | Architecture, module leads, QA, platform | API/event contract decisions |
| Twice weekly during construction | Runtime council | Platform, DevOps, SRE, security, QA | Compose/CI/observability blockers |
| Per Bolt | Mob kickoff | Assigned mob | Goal, driver rotation, acceptance criteria |
| Per Bolt end | Mob review | Assigned mob + stakeholders | Evidence, open risks, follow-up |

## Capacity Allocation Agreement

Until named staff are confirmed, use this minimum allocation model:

- Product/domain: 1 owner plus module SMEs on demand.
- Architecture: 1 lead across all workstreams.
- Delivery: 1 lead for sequence, gates, and dependencies.
- Backend: at least one primary engineer per module workstream.
- Frontend: at least one lead plus support for module UI slices.
- Platform/DevOps: one owner for runtime, CI/CD, Keycloak/Kafka/SR.
- QA: one owner for contract/E2E/performance strategy plus module test support.
- Security/compliance/operations: fractional but scheduled reviewers; not optional.

## Escalation Paths

| Issue Type | First Escalation | Final Decision |
|------------|------------------|----------------|
| Scope conflict | Delivery lead + product owner | Business sponsor |
| Module boundary conflict | Architecture lead | Architecture owner |
| Security/compliance blocker | Security/compliance owner | Business sponsor + architecture owner |
| Runtime blocker | Platform lead | Delivery/operations owner |
| Contract dispute | Contract council | Architecture owner + product owner |
| Domain rule ambiguity | Product owner + module SME | Business sponsor |

## Decision Before Delivery Planning

Delivery Planning must confirm:

1. Named workstream leads.
2. Actual availability and time zones.
3. Whether module workstreams become child intents or parent-intent units.
4. Contract council membership.
5. Runtime council membership.
6. The first walking-skeleton Bolt composition.

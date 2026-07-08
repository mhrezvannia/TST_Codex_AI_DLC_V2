# Feasibility Questions - Shared Platform

> Stage: Feasibility & Constraint Analysis
> Intent record: `260630-shared-platform`
> Source context: Intent Statement, Program Vision, Program Execution Plan, Enterprise Technical Environment v1.1, Shared Platform Module Vision, Shared Platform Module Tech Env.
> Note: MVP skips Market Research, so competitive-analysis, market-trends, and build-vs-buy inputs are absent and optional.

## Q1. Existing integrations to validate first

Which integration should Feasibility treat as the earliest validation dependency?

A. Enterprise OIDC / Keycloak 24 availability and service-edge token validation (recommended)
B. Kafka / Confluent Schema Registry provisioning and topic authorization
C. Manual reference-data administration for voyages, capacity, and UN/LOCODE
X. Other (please specify)

[Answer]: A. OIDC / Keycloak first (Recommended)

## Q2. Compliance and residency focus

Which compliance concern should be highest priority for this module at Feasibility?

A. Trade/regulatory footprint and primary/DR site residency, because they remain open program questions (recommended)
B. PII and identity access logging only
C. OWASP/CIS control matrix completion only
X. Other (please specify)

[Answer]: A. Footprint and residency (Recommended)

## Q3. Team and stack readiness

How should Feasibility classify the mandated technical stack?

A. Feasible but requires strict conformance to Enterprise Technical Environment v1.1 with no waivers (recommended)
B. Feasible only if the team can change selected standards during Construction
C. Not feasible until a new tech stack is chosen
X. Other (please specify)

[Answer]: A. Feasible, no waivers (Recommended)

## Q4. Budget and timeline pressure

Which scope control should Feasibility use to keep the MVP viable?

A. Keep only Shared Platform runtime scope and defer downstream business-module runtime capabilities (recommended)
B. Add consumer stubs for Charge, Booking, and Container Movement now
C. Defer frontend apps and build backend contracts only
X. Other (please specify)

[Answer]: A. Shared Platform runtime only (Recommended)

## Q5. Organizational blocker

Which organizational blocker should be tracked first?

A. Cross-team contract-freeze coordination with downstream module representatives (recommended)
B. Change freeze or competing priorities
C. Lack of named Standards Owner contact
X. Other (please specify)

[Answer]: A. Contract-freeze coordination (Recommended)

## Q6. Feasibility risk posture

What overall feasibility posture should the stage use?

A. Feasible with managed risks, pending validation of OIDC, residency/footprint, freshness SLA, and manual data operations (recommended)
B. Feasible without material risks because all standards are already mandated
C. Not feasible until every deferred program open question is fully resolved
X. Other (please specify)

[Answer]: A. Feasible with managed risks (Recommended)
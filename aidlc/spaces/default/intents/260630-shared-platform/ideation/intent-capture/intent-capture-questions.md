# Intent Capture Questions - Shared Platform

> Stage: Intent Capture & Framing
> Intent record: `260630-shared-platform`
> Source context: Program Vision, Program Execution Plan, Enterprise Technical Environment v1.1, Shared Platform Module Vision, Shared Platform Module Tech Env.

## Q1. Business problem priority

Which Shared Platform problem should be treated as the primary driver for this MVP run?

A. Equal priority across canonical reference data, identity/access, and event transport (recommended)
B. Reference data first, with identity and event transport as enabling dependencies
C. Defer priority until Scope Definition
X. Other (please specify)

[Answer]: A. Equal priority (Recommended)

## Q2. Primary customer for this module

Who is the primary customer of the Shared Platform MVP?

A. Downstream modules first, with admins, operators, and Security/IT as direct stakeholders (recommended)
B. Reference-data administrators and platform operators first
C. Security / IT first because identity and authorization are highest risk
X. Other (please specify)

[Answer]: A. Downstream modules first (Recommended)

## Q3. MVP success threshold

Which success signal should be treated as the non-negotiable Intent Capture outcome?

A. All Must Have outcomes: nine reference sets, internal identity, event delivery, and frozen provider contracts (recommended)
B. Reference Open Host Service and reference-change events only
C. Identity-service and carrier role model only
X. Other (please specify)

[Answer]: A. All Must Have outcomes (Recommended)

## Q4. Initiative trigger

What is the strongest trigger for starting Shared Platform first?

A. It is the hard dependency and contract-freeze foundation for all downstream modules (recommended)
B. It prevents master-data divergence before business modules start
C. It establishes the Enterprise Technical Environment v1.1 paved road
X. Other (please specify)

[Answer]: A. Hard dependency (Recommended)

## Q5. Scope boundary

Which boundary statement should govern this workflow?

A. Build only `reference-data-service`, `identity-service`, Kafka event bus integration, `apps/reference-data`, and `apps/auth` (recommended)
B. Include those Shared Platform pieces plus stubs for Charge, Booking, and Container Movement consumers
C. Build only contracts now; defer runtime services and frontend apps
X. Other (please specify)

[Answer]: A. Shared Platform only (Recommended)

## Q6. Open assumptions to carry forward

Which open assumption should be highest risk for Feasibility and Requirements Analysis?

A. Trade/regulatory footprint and reference-data freshness SLA, while tracking OIDC, manual voyage, and manual UN/LOCODE assumptions (recommended)
B. Enterprise OIDC / Keycloak availability for internal staff
C. Manual voyage/capacity and manual UN/LOCODE maintenance acceptability
X. Other (please specify)

[Answer]: A. Footprint and freshness SLA (Recommended)

## Q7. Decision authority at approval gates

Who must approve Shared Platform ideation outputs before Inception proceeds?

A. Platform / Architecture, Security / IT, and downstream module representatives (recommended)
B. Platform / Architecture plus Security / IT only
C. Platform / Architecture owner only
X. Other (please specify)

[Answer]: A. Cross-functional approvers (Recommended)
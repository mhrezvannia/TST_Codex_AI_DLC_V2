# Stakeholder Map - LinerCore Enterprise

## Primary Stakeholders

| Stakeholder | Role | Interests | Decision Rights |
|-------------|------|-----------|-----------------|
| Carrier commercial leadership | Business sponsor | Revenue assurance, pricing consistency, agreement control, D&D capture | Approves enterprise business outcomes and scope tradeoffs |
| Pricing and agreement users | Primary users | Agreements, tariffs, applicability, itemised pricing, auditability, manual fallback | Validates Charge and Customer Agreement workflows |
| Booking desk users | Primary users | Booking creation/amendment, validation, pricing orchestration, confirmation, exceptions | Validates Booking workflows and operational usability |
| Equipment control and operations users | Primary users | Container journeys, movement capture, lifecycle status, late/out-of-order events, operational history | Validates CMM workflows and movement visibility |
| Platform administrators | Internal users | Reference data, identity, access control, event transport, operational health | Validates Shared Platform admin and runtime workflows |
| Architecture and platform team | Technical owners | Module boundaries, contracts, database ownership, local runtime, resilience, observability | Owns technical decisions and enterprise conformance |
| Security and compliance stakeholders | Governance owners | Authn/authz, least privilege, audit logging, Kafka ACLs, secrets, incident readiness | Approves security and compliance posture |
| Delivery and operations stakeholders | Delivery owners | CI/CD, local setup, deployment, rollback, monitoring, runbooks, supportability | Approves delivery and operation readiness |

## Secondary Stakeholders

| Stakeholder | Interest | Communication Need |
|-------------|----------|--------------------|
| External finance system owners | Invoice and charge handoff readiness | Early interface confirmation and contract test alignment |
| Terminal, depot, leasing, and EDI integration owners | Movement feed quality and DCSA alignment | Contract/API expectations and failure handling |
| Enterprise identity owners | Keycloak/OIDC integration and role model | Security design review and environment setup |
| Developers and testers | Clear module boundaries, seed data, test commands, contract fixtures | Deterministic local setup and traceable unit backlog |

## Decision Makers vs Influencers

Decision makers:

- Product/business owner for enterprise scope and prioritization.
- Architecture/platform owner for module boundaries, contracts, runtime topology, and compliance with Enterprise Technical Environment.
- Security/compliance owner for authentication, authorization, audit, secrets, and operational controls.
- Delivery/operations owner for CI/CD, local runtime, environment provisioning, runbooks, and release readiness.

Influencers:

- Pricing, booking, and operations users validating workflow correctness.
- Existing Shared Platform MVP artifacts and implementation.
- Graphify graph and report as the primary codebase-understanding layer.
- Claude UI export as preferred visual and UX baseline.
- Enterprise contracts and authoritative project documents.

## Communication Requirements

- Preserve traceability from each downstream requirement to one or more authoritative inputs.
- Call out where raw UI assets are not fully graph-indexed before treating them as hard requirements.
- Separate parent enterprise coordination decisions from module-specific implementation decisions.
- Keep historical MVP status read-only and visible in all major planning artifacts.
- Surface missing module-specific documents before construction relies on inferred module scope.
- Use approval gates to confirm scope, sequence, and workstream split decisions before advancing.

## Initial Workstream Ownership

| Workstream | Business Owner | Technical Owner | Key Dependencies |
|------------|----------------|-----------------|------------------|
| Shared Platform | Platform administration | Architecture/platform and security | Existing MVP, Keycloak, Kafka, Schema Registry, reference data, identity |
| Charge Calculation & Customer Agreement | Commercial/pricing | Charge service/module team | Shared Platform references, Booking pricing requests, D&D rules |
| Customer Booking | Booking desk operations | Booking module team | Shared Platform references, Charge pricing APIs, CMM movement events |
| Container Movement Management | Equipment control/operations | CMM module team | Booking confirmations, DCSA validation, movement feed adapters |
| Enterprise UI | All primary user groups | Frontend/platform team | Claude UI baseline, BFF/API contracts, permissions, workflow state |
| Local runtime and Operation | Delivery/operations | Platform/devsecops/operations | Docker Compose, PostgreSQL, Kafka, Keycloak, observability, CI/CD |

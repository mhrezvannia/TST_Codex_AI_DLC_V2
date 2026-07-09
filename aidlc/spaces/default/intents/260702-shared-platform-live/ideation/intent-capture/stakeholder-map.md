# Stakeholder Map - Shared Platform Local Functionality

## Stakeholders and Interests

| Stakeholder | Role | Interest |
| --- | --- | --- |
| User / product sponsor | Decision-maker | Wants a clear path from the current scaffold to a complete LinerCore MVP, without mistaking placeholder UI for functional progress. |
| Platform / Architecture team | Decision-maker | Owns Shared Platform conformance to Enterprise Technical Environment v1.1 and must keep the foundation clean for downstream modules. |
| Security / IT | Decision-maker / influencer | Owns Keycloak/OIDC posture, identity-service authorization behavior, and least-privilege access. |
| Reference-data administrator | Primary user | Needs to maintain nine canonical reference sets through a functional admin UI and backend service. |
| Future Charge team | Downstream consumer | Needs reliable reference data, charge codes, commodities, trade lanes, identity, and event contracts. |
| Future Booking team | Downstream consumer | Needs customers, voyages/capacity, locations, commodities, trade lanes, identity, and event transport. |
| Future Container Movement team | Downstream consumer | Needs locations, equipment types, identity, event bus, and correlation conventions. |
| QA / CI owner | Influencer | Needs repeatable local and CI quality-gate evidence including backend Maven tests. |
| Operations owner | Influencer | Needs local/on-prem Compose, health, smoke, logs, metrics, and runbook foundations. |

## Decision Makers vs Influencers

| Category | People / groups | Decisions |
| --- | --- | --- |
| Final approval | User / product sponsor | Approves scope, stage gates, and whether Shared Platform is ready for the next module. |
| Architecture approval | Platform / Architecture team | Confirms service boundaries, contract readiness, and no scope creep into business modules. |
| Security approval | Security / IT | Confirms auth bypass limits, Keycloak integration, role model, and sensitive data controls. |
| Delivery influence | QA / CI / Operations | Confirms local runtime, quality gates, environment prerequisites, and operational readiness. |

## Communication Requirements

| Audience | Required communication |
| --- | --- |
| User / product sponsor | Plain status: what is functional, what remains placeholder, what module is next. |
| Platform / Architecture | Traceability to Enterprise Tech-Env v1.1, Shared Platform vision, and the existing scaffold. |
| Security / IT | Explicit treatment of `AUTH_BYPASS`, Keycloak, identity-service, cookies, and role permissions. |
| Future module teams | Stable API/event contracts, seed data, and instructions for local integration. |
| QA / Operations | Commands, evidence files, logs, smoke checks, and known environment prerequisites. |

## Roadmap Alignment

The stakeholder expectation is not that this intent completes the whole LinerCore product MVP. It makes Shared Platform functional enough to unblock the remembered sequence: Charge & Customer Agreement, Customer Booking, Container Movement Management, then M0-M4 integration.

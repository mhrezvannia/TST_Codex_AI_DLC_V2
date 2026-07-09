# Stakeholder Map - Charge & Customer Agreement

## Stakeholders and Interests

| Stakeholder | Role | Interest |
| --- | --- | --- |
| User / product sponsor | Decision-maker | Wants the app completed beyond Shared Platform, starting with the first business module. |
| Commercial / pricing user | Primary user | Needs functional agreement and charge-term maintenance, not view-only screens. |
| Sales / account owner | Primary consumer | Needs visibility into active customer agreements and commercial validity. |
| Booking team / future module | Downstream consumer | Needs active agreement lookup and charge terms before booking can be complete. |
| Finance / revenue stakeholder | Influencer | Needs charge terms structured enough to support later invoicing and settlement. |
| Platform / architecture team | Decision-maker / influencer | Ensures the module consumes Shared Platform identity/reference data and follows repo architecture. |
| QA / delivery owner | Influencer | Needs tests, smoke checks, and local readiness evidence before moving to Booking. |
| Operations owner | Influencer | Needs documented local runtime behavior and clear known limitations around Docker/host mode. |

## Decision Makers vs Influencers

| Category | People / groups | Decisions |
| --- | --- | --- |
| Final approval | User / product sponsor | Approves module scope, stage gates, and whether the first business module is complete enough to proceed to Booking. |
| Product approval | Commercial / pricing representative | Confirms agreement lifecycle, charge-term fields, and first vertical-slice usability. |
| Architecture approval | Platform / architecture team | Confirms bounded context, service/API boundaries, and Shared Platform integration posture. |
| Delivery influence | QA / operations | Confirms local runtime, quality gates, smoke evidence, and operational notes. |

## Communication Requirements

| Audience | Required communication |
| --- | --- |
| User / product sponsor | Plain progress: what module is being implemented, what works locally, and what remains before moving to Booking. |
| Commercial / pricing users | Screens and examples centered on customer agreements, charge terms, validity, and approval. |
| Platform / architecture | Explicit dependency map to Shared Platform reference data, identity, APIs, and readiness scripts. |
| Booking module team | Stable active-agreement lookup contract and data assumptions for the next module. |
| QA / operations | Test commands, evidence files, local start/stop behavior, and known environment blockers. |

## Roadmap Alignment

This intent is the first product module after Shared Platform. It must finish with a locally usable Charge & Customer Agreement capability and leave a clean handoff to Customer Booking. The broader app completion path remains:

1. Charge & Customer Agreement.
2. Customer Booking.
3. Container Movement Management.
4. M0-M4 integration milestones across the full LinerCore MVP journey.

# Stakeholder Map - Shared Platform

## Overview

The Shared Platform is an enabling module. Its stakeholder map is centered on downstream module consumers, platform ownership, Security / IT, and administrative users who maintain the shared foundation.

## Stakeholders and Interests

| Stakeholder | Type | Interests | Success concern |
|-------------|------|-----------|-----------------|
| Platform / Architecture team | Decision-maker | Owns Shared Platform standards, service boundaries, conformance to Enterprise Technical Environment v1.1, and build order discipline. | Foundation is usable by all downstream modules without waivers or divergent patterns. |
| Security / IT | Decision-maker | Owns Keycloak path, identity assurance, access control, least privilege, and security logging. | Internal SSO and authorization are secure, auditable, and role-appropriate. |
| Charge and Customer Agreement team | Consuming module | Needs customer, port, region, voyage, currency, charge-code, equipment-type, commodity, and trade-lane data. | Can build pricing and agreement capabilities against stable reference contracts. |
| Customer Booking team | Consuming module | Needs customer, vessel/voyage, capacity, port, equipment-type, commodity, trade-lane, identity, and event transport. | Can validate capacity and later orchestrate booking flows using canonical data. |
| Container Movement Management team | Consuming module | Needs location and equipment-type references, staff identity, and reliable event transport. | Can publish and consume movement-related flows without redefining shared foundations. |
| Reference-data administrator | Direct user | Maintains parties, locations, regions, voyages, currencies, charge codes, equipment types, commodities, and trade lanes. | Admin workflows are accurate, governed, and protected against duplicate canonical records. |
| Platform operator / standards owner | Direct user | Operates reference services, identity service, Kafka topics, Schema Registry, observability, and deployment assets. | Services are reliable, traceable, monitored, and conformant. |
| Carrier staff | Indirect user | Signs in once and works across entitled modules under the carrier role model. | Access is seamless and least privilege. |
| Commercial executive | Influencer | Sponsors the larger LinerCore outcome of zero re-keying and reliable revenue capture. | Shared Platform unblocks the commercial modules without scope creep. |
| Operations / vessel schedule owner | Influencer | Provides or maintains voyage and nominal capacity data at MVP. | Manual voyage/capacity entry is feasible until external feeds arrive. |

## Decision Makers vs Influencers

| Role | Stakeholders | Approval interest |
|------|--------------|-------------------|
| Primary approvers | Platform / Architecture, Security / IT | Confirm the foundation scope, standards conformance, identity model, and provider-side contracts. |
| Required downstream reviewers | Charge team, Booking team, Container Movement team | Confirm the provider contracts are usable by future consumers and do not force downstream rework. |
| Influencers | Commercial executive, operations / vessel schedule owner, reference-data administrators, platform operators | Validate business value, operational feasibility, and administrative usability. |

## Communication Requirements

| Communication | Audience | Timing | Content |
|---------------|----------|--------|---------|
| Ideation gate summary | Primary approvers and downstream reviewers | End of each Ideation stage | Scope, assumptions, out-of-scope boundaries, and unresolved questions. |
| Contract-freeze readiness note | Downstream module teams | Before Inception handoff and again before Construction | Reference API, identity API, event envelope, reference-changed event names, and test strategy. |
| Risk and assumption log | Platform / Architecture, Security / IT, downstream reviewers | Feasibility and Requirements Analysis | Trade/regulatory footprint, freshness SLA, OIDC availability, and manual data-entry assumptions. |
| Standards conformance checkpoint | Platform / Architecture and Security / IT | Before Construction | Enterprise Technical Environment v1.1 conformance table and any waiver status. |
| Admin workflow review | Reference-data administrators and platform operators | Rough/refined mockup stages | Admin list maintenance, validation, search/filtering, and operational support needs. |

## Approval Boundary

The approval authority for Intent Capture and later Ideation outputs should include Platform / Architecture, Security / IT, and representatives from Charge, Booking, and Container Movement. This keeps the Shared Platform narrow while ensuring the provider contracts are useful to the modules that depend on it.
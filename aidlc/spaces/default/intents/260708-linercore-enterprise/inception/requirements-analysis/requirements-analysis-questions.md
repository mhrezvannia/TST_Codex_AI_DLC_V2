# Requirements Analysis Questions - LinerCore Enterprise

## Source Context

These questions consume `intent-statement.md`, `scope-document.md`, `business-overview.md`, `architecture.md`, `code-structure.md`, and `team-practices.md`. They focus only on unresolved decisions because the enterprise scope, module boundaries, contracts, local runtime target, Graphify policy, and no-fake-completion rule are already explicit.

## Questions

### Q1. First enterprise release integration depth

Which integration depth should the first enterprise release prove for external carrier/finance/schedule systems?

A. Local deterministic adapters only, with documented external-provider seams  
B. One production-like external adapter for vessel schedule or capacity, others local  
C. One production-like finance adapter, others local  
D. Production-like adapters for schedule/capacity and finance in the first release  
E. Defer all external-provider adapters until after all five internal flows pass locally  
X. Other (please specify)  

[Answer]: A, E - Use local deterministic adapters with documented external-provider seams first. Do not make production-like external integrations part of the first release until all five internal enterprise flows pass locally.

### Q2. Vessel schedule and capacity authority

What should be the first-release authority for routing, voyage references, and capacity or operational validation?

A. Seeded local reference data and deterministic capacity rules  
B. Manual operations/admin input inside LinerCore  
C. Adapter interface backed by local fixture data for first release  
D. Production-like vessel schedule/capacity integration in first release  
E. Booking may confirm without capacity validation only when explicitly manually overridden and audited  
X. Other (please specify)  

[Answer]: C, E - Use adapter interfaces backed by local fixture data for the first release. Booking may confirm with an explicitly audited manual override where operational validation cannot be completed automatically.

### Q3. Customer and agreement coverage

Which customer/agreement model must the first release support?

A. One customer type with active approved agreements and tariff fallback  
B. Multiple customer tiers with agreement eligibility and tariff fallback  
C. Contract customer, spot customer, and manual-pricing customer paths  
D. Full enterprise customer hierarchy, parent/child accounts, and delegated references  
E. Defer hierarchy but require audit-ready agreement determination and manual fallback  
X. Other (please specify)  

[Answer]: C, E - Support contract customer, spot customer, and manual-pricing customer paths. Defer full hierarchy while requiring audit-ready agreement determination and manual fallback.

### Q4. D&D first-release boundaries

Which D&D scope is mandatory for first release?

A. Import demurrage only  
B. Import demurrage and import detention  
C. Import demurrage, import detention, and export detention  
D. All D&D types plus manual override and exception queue  
E. Implement all required D&D contract paths, but seed only one lane/scenario for E2E validation  
X. Other (please specify)  

[Answer]: D - Implement import demurrage, import detention, export detention, manual override, and exception queue behavior as mandatory first-release D&D scope.

### Q5. Movement source and validation strictness

How should movement capture behave in the first release?

A. UI/API manual capture with DCSA v2.2 validation and deterministic fixtures  
B. File/API import plus manual correction workflow  
C. Kafka/event ingestion plus UI correction workflow  
D. Production-like external movement feed adapter in first release  
E. Start local/manual but require duplicate, late, and out-of-order handling from day one  
X. Other (please specify)  

[Answer]: A, E - Support UI/API manual capture with DCSA v2.2 validation and deterministic fixtures, including duplicate, late, and out-of-order handling from day one.

### Q6. Claude UI conversion strategy

How should the Claude UI export be converted into product requirements?

A. Preserve visual design and navigation, then map screens to real modules during refined mockups  
B. Preserve only component appearance, redesign information architecture from requirements  
C. Use Claude UI as a reference, but prioritize enterprise workflow density and operational efficiency  
D. Convert all export screens into app routes unless they conflict with authoritative requirements  
E. Only implement screens needed for the first walking skeleton, defer the rest to later Bolts  
X. Other (please specify)  

[Answer]: A, C - Preserve visual design, navigation, and component direction where compatible, then map screens to real modules while prioritizing enterprise workflow density and operational efficiency.

### Q7. Local runtime acceptance threshold

What is the minimum acceptable proof for `docker compose --profile full up -d --build`?

A. All infrastructure and apps start, with basic health endpoints  
B. All services/apps start, migrations and seed data complete, health checks pass  
C. Full profile starts and all five E2E business flows pass locally  
D. Full profile starts with observability dashboards, traces, logs, and contract-test support  
E. First require `core` and `app` profiles, then graduate to `full` after integration hardening  
X. Other (please specify)  

[Answer]: C, D - The full profile must start locally and all five E2E business flows must pass, with observability dashboards, traces, logs, and contract-test support available.

### Q8. Security and authorization depth

Which authorization model should be required before enterprise completion can be claimed?

A. Role-based access control per module with Keycloak-backed authentication  
B. Role plus capability model with auditable authorization decisions  
C. Least-privilege service-to-service JWT/RS256 and Kafka ACLs in addition to user permissions  
D. Full B plus C, with tests proving denied access paths and audit records  
E. Full enterprise model, but local development may use explicit dev-only bypasses for selected flows  
X. Other (please specify)  

[Answer]: D, E - Require role/capability authorization, service-to-service JWT/RS256, Kafka ACLs, denied-path tests, audit records, and only explicit dev-only local bypasses.

### Q9. Program workstream structure

How should downstream AI-DLC execution organize the module work?

A. Keep one enterprise parent intent and generate module units during Units Generation  
B. Create coordinated child intents for Shared Platform, Charge/Agreement, Booking, and CMM  
C. Keep parent intent through Application Design, then decide split in Delivery Planning  
D. Split only greenfield Booking and CMM into child intents  
E. Use one parent intent, but require explicit module acceptance gates inside each Construction Bolt  
X. Other (please specify)  

[Answer]: C - Keep the enterprise parent intent through Application Design, then decide whether to split coordinated module child intents in Delivery Planning.

### Q10. Performance and volume baseline

What first-release scale target should requirements use until NFR Requirements refines it?

A. Functional correctness first; performance targets deferred to NFR Requirements  
B. Small carrier local load: hundreds of bookings and movements per day  
C. Mid-market carrier load: thousands of bookings and tens of thousands of movements per day  
D. Enterprise carrier load: high-volume concurrent booking, pricing, and movement ingestion  
E. Use seeded deterministic load profiles for all five flows and set SLOs in NFR Requirements  
X. Other (please specify)  

[Answer]: E - Use seeded deterministic load profiles for all five enterprise flows and set formal SLOs during NFR Requirements.

## Answering Instructions

Each `[Answer]:` tag must be filled before final `requirements.md` is generated. Multiple options may be combined where appropriate by writing comma-separated letters and a short explanation.

# Decision Log - Shared Platform Local Functionality

## Decisions

This decision log consumes `intent-statement`, `scope-document`, `intent-backlog`, `competitive-analysis`, `feasibility-assessment`, `constraint-register`, `team-assessment`, and `wireframes`.

| ID | Stage | Decision | Rationale | Status |
| --- | --- | --- | --- | --- |
| D-001 | Intent Capture | Make Shared Platform locally functional and integration-ready before downstream module work. | The existing scaffold is not functional enough for Charge, Booking, or Container Movement dependencies. | Approved |
| D-002 | Intent Capture / Project Memory | Preserve follow-on order: Charge & Customer Agreement, Customer Booking, Container Movement Management, then M0-M4 integration milestones. | Avoids re-asking module sequence and keeps program roadmap stable. | Approved |
| D-003 | Market Research | Adopt commodity tools and build LinerCore-specific seams. | Keycloak, Kafka, Schema Registry, Pact, Compose, GitHub Actions, and self-hosted registries are commodity; reference data, authz, BFF, seeds, outbox, and contracts are project-specific. | Approved |
| D-004 | Feasibility | Proceed with prerequisite remediation. | Initiative is feasible, but Java, Maven, Docker, image build strategy, Keycloak bootstrap, BFF wiring, seed apply, and event proof must be completed. | Approved |
| D-005 | Constraints | No public cloud services or AWS substitutions. | Enterprise Technical Environment mandates on-prem/local topology. | Approved |
| D-006 | Constraints | Browser traffic must go through Next.js BFF routes. | Security and architecture constraints prohibit direct browser-to-service calls. | Approved |
| D-007 | Constraints | Keycloak handles authentication; `identity-service` handles authorization. | Keeps local bypass from becoming a production substitute. | Approved |
| D-008 | Scope Definition | In-scope backlog is U01-U12; functional MVP is U01-U08; integration readiness requires U09-U11. | Defines "real functional" and downstream readiness. | Approved |
| D-009 | Scope Definition | Charge, Booking, Container Movement, external finance, and production deployment are out of scope. | Prevents integration debt and scope creep. | Approved |
| D-010 | Team Formation | Use a local AI-assisted delivery cell and mob plan M0-M5. | Matches current execution reality and supports the approved backlog. | Approved |
| D-011 | Rough Mockups | Use operational internal-tool wireframes, not marketing screens. | Current problem is task functionality: auth, mutations, seeds, publication status, contracts, readiness. | Approved |
| D-012 | Rough Mockups Review | Product-lead reviewer verdict is READY. | Mockups align with Shared Platform functionality and testable states. | Approved |
| D-013 | Approval Handoff | Go to Inception with constraints. | Ideation artifacts are consistent; remaining blockers are environment/runtime prerequisites, not scope ambiguity. | Proposed |

## Open Constraints Carried Forward

| ID | Constraint | Forward action |
| --- | --- | --- |
| CARRY-001 | Java 21 and Maven 3.9+ unavailable locally | Inception/Construction must document install path or use runner evidence. |
| CARRY-002 | Docker daemon unavailable | Runtime proof requires Docker Desktop or approved runtime. |
| CARRY-003 | Dockerfiles/build contexts missing | Application design and construction must add a build/run strategy. |
| CARRY-004 | Static BFF data and disabled mutation UI | Requirements/design must prioritize service-backed write flows. |
| CARRY-005 | Keycloak bootstrap absent | Identity requirements/design must include deterministic local bootstrap. |
| CARRY-006 | Seed apply and outbox proof absent | Functional and NFR design must include live apply/publication evidence. |

## Rejected or Deferred Options

| Option | Decision | Reason |
| --- | --- | --- |
| Continue with current scaffold only | Rejected | It leaves the UI view-only and downstream modules blocked. |
| Build Charge/Booking/Container now | Deferred | Project memory and scope boundary require Shared Platform first. |
| Buy full carrier platform | Rejected | Conflicts with greenfield LinerCore module ownership. |
| Build commodity auth/broker/CI from scratch | Rejected | Commodity tools are already mandated and reduce risk. |
| Public cloud substitution | Rejected | Violates on-prem/no-public-cloud constraints. |

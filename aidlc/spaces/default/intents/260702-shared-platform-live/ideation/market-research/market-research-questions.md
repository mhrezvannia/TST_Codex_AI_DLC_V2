# Market Research Questions

## Answered Questions

1. What competing products or solutions exist?
   - A. Commercial TMS/carrier suites
   - B. Commodity platform components such as Keycloak, Kafka, Schema Registry, Docker Compose, Harbor/Nexus, Pact, and GitHub Actions
   - C. Manual spreadsheets and point tools
   - D. Custom-built platform services
   - E. All of the above
   - X. Other (please specify)
   - [Answer]: E. All of the above; for this intent, the relevant competition is primarily buy/adopt commodity platform components versus overbuilding custom infrastructure.

2. What industry trends are relevant?
   - A. Standards-based container visibility
   - B. Self-hosted/on-prem platform operations
   - C. Contract-first integration and compatibility gates
   - D. OIDC/centralized identity
   - E. All of the above
   - X. Other (please specify)
   - [Answer]: E. All of the above.

3. What is table-stakes versus differentiating?
   - A. Table-stakes: auth, event bus, CI, local runtime, contract tests
   - B. Differentiating: carrier reference model and LinerCore cross-module integration readiness
   - C. Both A and B
   - X. Other (please specify)
   - [Answer]: C. Both A and B.

4. What is the build-vs-buy-vs-partner calculus?
   - A. Build all infrastructure
   - B. Buy a full commercial carrier platform
   - C. Adopt commodity components and build carrier-specific domain/platform seams
   - D. Partner for all module delivery
   - X. Other (please specify)
   - [Answer]: C. Adopt commodity components and build carrier-specific domain/platform seams.

5. What market size or addressable audience are we targeting?
   - A. External SaaS market
   - B. Internal carrier users and downstream LinerCore module teams
   - C. Open-source community
   - X. Other (please specify)
   - [Answer]: B. Internal carrier users and downstream LinerCore module teams.

## Source Notes

This stage consumes `ideation/intent-capture/intent-statement.md` and current external standards/tooling references: DCSA Open Track & Trace, Keycloak, Confluent Schema Registry, Pact, Docker Compose, GitHub Actions self-hosted runners, Harbor, and Nexus Repository.

# Team Formation Questions - Shared Platform Local Functionality

## Context

This questions file consumes `scope-document`, `intent-backlog`, and `feasibility-assessment`. The user asked not to be stopped for optional next-stage questions, so the answers below are inferred from the current local project context: one local workspace, the user as product/approval owner, Codex as implementation agent, and AI-DLC personas as specialist perspectives.

## Questions and Answers

### Q1. What teams and individuals are available?

A. A full staffed enterprise team is already assigned.
B. A local AI-assisted delivery cell: user as product/approval owner, Codex as engineering executor, AI-DLC personas as specialist review perspectives.
C. External vendor team only.
D. No delivery team.
E. Unknown and must pause.
X. Other (please specify)

[Answer]: B - A local AI-assisted delivery cell. This matches current execution reality and avoids blocking on named human staffing that is not available in the repository context.

### Q2. What is the current capacity and utilization?

A. Full-time dedicated team capacity.
B. Iterative local execution capacity, constrained by machine prerequisites and mandatory AI-DLC gates.
C. No capacity.
D. Production operations team capacity only.
E. Unknown and must pause.
X. Other (please specify)

[Answer]: B - Iterative local execution capacity. The main constraints are Java/Maven/Docker availability and mandatory workflow gates.

### Q3. What skills are required vs. available?

A. Only frontend skills are required.
B. Java/Spring Boot, Next.js/BFF, Keycloak, PostgreSQL, Kafka/Schema Registry, Docker Compose, QA/contracts, security, and operations are required; AI-DLC roles can cover analysis/execution, but local runtime tooling must be installed or provided by runner.
C. Only product skills are required.
D. Only cloud AWS skills are required.
E. No specialist skills are required.
X. Other (please specify)

[Answer]: B - The full Shared Platform stack requires backend, frontend, identity, eventing, data, QA, security, and operations skills.

### Q4. Are competing initiatives drawing from the same talent pool?

A. Yes, Charge, Booking, and Container Movement should run in parallel now.
B. No active competing local implementation should be started until Shared Platform is functional.
C. External finance work takes priority.
D. Production deployment takes priority.
E. Unknown and must pause.
X. Other (please specify)

[Answer]: B - No active competing implementation should start yet. Project memory fixes the downstream order after Shared Platform readiness.

### Q5. What is the preferred team topology?

A. Component teams by frontend/backend only.
B. One cross-functional platform mob for the walking skeleton, then focused mobs by runtime/service slice as backlog dependencies allow.
C. Separate downstream module teams now.
D. Operations-only team.
E. No topology.
X. Other (please specify)

[Answer]: B - One cross-functional platform mob first, then focused mobs by runtime/service slice. This supports the backlog critical path.

### Q6. Are external partners, contractors, or AWS Professional Services needed?

A. AWS Professional Services are needed.
B. Not for this local/on-prem intent; only local tool installation or self-hosted runner support may be needed.
C. A public cloud vendor is needed.
D. A finance vendor is needed now.
E. Unknown and must pause.
X. Other (please specify)

[Answer]: B - Not for this local/on-prem intent. The feasibility assessment explicitly rejects AWS/cloud substitutions.

### Q7. Who are the decision-makers for each phase?

A. User for product/scope approvals; Codex/AI-DLC agents for technical recommendations; mandatory gates for final approval.
B. Codex only.
C. External vendor only.
D. Operations only.
E. Unknown and must pause.
X. Other (please specify)

[Answer]: A - User retains product and gate approval authority; Codex executes and records recommendations within AI-DLC.

## Analysis

The available team is sufficient to continue planning and implementation, but local prerequisite ownership is explicit. Java 21, Maven 3.9+, and Docker runtime availability remain capacity blockers for live backend/Compose evidence.

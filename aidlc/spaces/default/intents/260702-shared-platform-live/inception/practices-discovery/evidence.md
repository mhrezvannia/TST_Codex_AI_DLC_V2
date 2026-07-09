# Practices Discovery Evidence - Shared Platform Local Functionality

## Sources Scanned

This evidence consumes `code-structure`, `technology-stack`, `dependencies`, `code-quality-assessment`, `architecture`, and `business-overview` from `aidlc/spaces/default/codekb/TST_Codex/`, plus current `team.md` and `project.md` memory files.

## Pipeline and Deployment Evidence

| Evidence | Finding |
| --- | --- |
| `.github/workflows/quality-gates.yml` | Pull request and manual quality-gate workflow targets self-hosted on-prem Linux runners. |
| `scripts/run-quality-gates.mjs` | Quality gate aggregator blocks required gates and writes evidence. |
| `compose.yaml` | Docker Compose is the local/on-prem runtime model. |
| Project memory | Trunk-based development, short-lived Bolt branches, squash merges, staging deployment, and manual production approval are already affirmed. |

## Quality Evidence

| Evidence | Finding |
| --- | --- |
| `code-quality-assessment` | Frontend tests, Java tests, contract checks, seed checks, smoke checks, and quality aggregation exist. |
| `scripts/run-quality-gates.mjs` | Required gates include frontend tests/typechecks, contract validation, seed validation, skeleton validation, and backend Maven tests. |
| Feasibility and code quality KB | Java/Maven/Docker are missing/unavailable locally, so runtime quality proof is blocked until prerequisites are resolved. |

## Developer and Architecture Evidence

| Evidence | Finding |
| --- | --- |
| `architecture` | System is BFF-to-service with Java hexagonal backend services and Next.js BFF apps. |
| `code-structure` | Both Java services use `domain-core`, `application-service`, `application`, `dataaccess`, `messaging`, `published-language`, and `container` modules. |
| `dependencies` | Domain-core purity is an explicit quality policy. |
| `api-documentation` | Reference-data BFF routes still use static/local behavior; backend services expose the intended API shape. |

## Security and DevSecOps Evidence

| Evidence | Finding |
| --- | --- |
| `architecture` | Browser traffic is expected to stay behind Next.js BFFs. |
| `technology-stack` | Keycloak, identity-service, PostgreSQL, Kafka, Schema Registry, and Nginx are local/on-prem components. |
| `code-quality-assessment` | Local auth bypass has tests but still needs non-local safeguards. |
| Project memory | Existing rules forbid public-cloud substitutions, domain-core pollution, and downstream-module scope creep. |

## Questions Asked

No optional questions were asked. The user explicitly requested continued execution without repeated next-stage prompts, and the code knowledge base plus existing memory provided enough evidence for a no-new-rules freshness run.

## Discovery Outcome

Practices are coherent and already mostly affirmed. This run updates the per-intent evidence trail and keeps project-level hard rules stable rather than duplicating them.

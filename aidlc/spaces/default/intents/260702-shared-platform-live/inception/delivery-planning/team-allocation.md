# Team Allocation - Shared Platform Local Functionality

## Context

This team allocation consumes `requirements`, `stories`, `mockups`, `components`, `unit-of-work`, `unit-of-work-dependency`, `unit-of-work-story-map`, and `team-practices`. It uses the Ideation team assessment: local AI-assisted delivery cell with the user as product/environment owner and Codex as implementation executor.

## Delivery Cell

| Role | Holder | Responsibility |
| --- | --- | --- |
| Product owner / approver | User | Mandatory gate approvals, product-scope corrections, environment access decisions. |
| Delivery conductor | Codex with AI-DLC | Runs lifecycle, maintains artifacts, enforces Shared Platform scope, sequences according to engine. |
| Implementation executor | Codex | Edits code, reads graph/source/docs, runs tests, reports blockers. |
| Architecture reviewer | Inline fallback until subagent capacity returns | Checks boundaries, DAG compliance, and design traceability. |
| Quality/security perspective | Codex plus AI-DLC artifacts | Ensures tests, auth, bypass guard, policy, and evidence remain explicit. |
| Local environment owner | User/local machine | Java 21, Maven 3.9+, Docker daemon, ports, local credentials. |

## Bolt Assignment

| Bolt | Primary mob | Supporting perspectives | Environment owner involvement |
| --- | --- | --- | --- |
| B01 Gated Walking Skeleton | Codex implementation executor | Architect, quality, security, operations | High: Java/Maven/Docker required for full proof. |
| B02 Workbench Write UX and Bypass Guard | Codex implementation executor | Design, security, quality | Medium: frontend can progress; backend runtime needed for full E2E. |
| B03 Seed Apply Through Live APIs | Codex implementation executor | Operations, security, quality | High: live services and Keycloak/identity/reference-data endpoints needed. |
| B04 Contract Provider and Message Verification | Codex implementation executor | Quality, architect | Medium/high: running services needed for provider checks. |
| B05 Local Readiness and Quality Evidence | Codex implementation executor | Operations, quality, delivery | High: validates the whole local platform. |

## Worktree and Branching Stance

- Base branch: `main`.
- Work style: short-lived Bolt branches/worktrees as required by AI-DLC Construction.
- Merge posture: each Bolt must pass its declared convergence checks before merge/finalization.
- No downstream module branches are created during this intent.

## Capacity Constraints

| Constraint | Impact | Treatment |
| --- | --- | --- |
| Java/Maven unavailable locally | Backend tests and Java packaging cannot be fully proven on this machine yet. | Install prerequisites or use self-hosted runner evidence. |
| Docker daemon unavailable | Compose proof cannot run locally yet. | Start Docker Desktop or approved runtime before B01 full proof. |
| Subagent reviewer/model limitations | Reviewer gates cannot depend on unavailable fixed model roles. | Continue inline review and record caveat until capacity returns. |
| User asked not to ask optional next-stage questions | Optional Q&A should be inferred from artifacts. | Ask only mandatory AI-DLC gates or true blockers. |

## Review

Verdict: READY

Inline fallback review finds allocation aligned with `requirements`, `stories`, `mockups`, `components`, `unit-of-work`, `unit-of-work-dependency`, `unit-of-work-story-map`, and `team-practices`. The plan is realistic for a local AI-assisted delivery cell and clearly identifies machine-level blockers.


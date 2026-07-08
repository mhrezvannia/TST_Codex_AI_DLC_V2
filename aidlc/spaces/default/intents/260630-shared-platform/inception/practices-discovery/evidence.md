# Evidence - Practices Discovery

## Run Mode

Project type is Greenfield. Reverse-engineering and brownfield evidence scanning are not applicable for this run.

## Sources Scanned

| Source | Evidence |
|--------|----------|
| `aidlc-state.md` | Project Type is Greenfield; scope is MVP; current stage is Practices Discovery. |
| `aidlc/spaces/default/memory/org.md` | Org defaults specify trunk-based development, walking skeleton first for greenfield MVP, tests alongside code, staging on merge, production manual approval, and project-configured code style. |
| `aidlc/spaces/default/memory/team.md` | Team sections were empty before this run, so no prior team override applied. |
| `aidlc/spaces/default/memory/project.md` | Project sections were empty before this run, so no prior project override applied. |
| `docs/shared-platform-module-tech-env.md` | Shared Platform pins 85% line coverage for both services and conforms to Enterprise Technical Environment v1.1. |
| `docs/enterprise-technical-environment.md` | Confirms GitHub Actions/self-hosted runners, Docker Compose on-premises, Java/Spring, Next.js/Turborepo/Yarn, and frontend prohibited libraries. |

## Interview Findings

| Practice area | Answer |
|---------------|--------|
| Way of Working | Trunk-based development on `main`, short-lived feature/Bolt branches, squash-merge each Bolt. |
| Walking Skeleton | Run the walking-skeleton Bolt first, gated, then ask the autonomy ladder prompt. |
| Testing Posture | Tests alongside code, CI-blocking gates, 85% line coverage target for both services. |
| Deployment | Deploy on merge to staging through GitHub Actions/self-hosted runners; production requires manual approval. |
| Code Style | Follow Enterprise Tech Env v1.1 and project configs: Java/Spring hexagonal skeleton, pure domain core, TS strict, frontend constitution, no prohibited libraries. |

## Inferences

No brownfield conventions were inferred from code. The practices are greenfield affirmations derived from org defaults, module tech-env constraints, and the user's answers.
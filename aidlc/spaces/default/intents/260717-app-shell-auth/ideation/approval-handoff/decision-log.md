# Decision Log - W2-01 App Shell and Auth Ideation

## Source Context

This log records decisions from the approved Ideation artifacts: `intent-statement.md`, `scope-document.md`, `intent-backlog.md`, `competitive-analysis.md`, `feasibility-assessment.md`, `constraint-register.md`, `team-assessment.md`, and `wireframes.md`.

## Decisions

| ID | Decision | Source | Status |
|---|---|---|---|
| D01 | Start a second program intent `260717-app-shell-auth` for W2-01. | Engine intent-birth and user confirmation | Approved |
| D02 | Work on branch `intent/W2-01-app-shell-and-auth` from `integ/main-reconciled` at `5dd6481`. | User instruction and branch creation | Active |
| D03 | Treat W2-01 as a vertical program intent, not an umbrella redesign. | `intent-statement.md`, `scope-document.md` | Approved |
| D04 | Reuse existing `apps/auth`, Keycloak, and identity-service authorization. | `feasibility-assessment.md`, `build-vs-buy.md` | Approved |
| D05 | Build shell/auth integration in-repo; do not buy full ERP, portal, or micro-frontend host for this slice. | `build-vs-buy.md` | Approved |
| D06 | Mount Booking as the first module; defer reference-data, charge, and CMM migration to W4-01. | `scope-document.md`, `intent-backlog.md` | Approved |
| D07 | Keep W2-02 design-system foundation out of scope; consume only available primitives. | `scope-document.md`, `wireframes.md` | Approved |
| D08 | Make real subject propagation and detector 6d central acceptance criteria. | `feasibility-assessment.md`, `scope-document.md` | Approved |
| D09 | Preserve W1-01 live-proof waiver as blocked/waived evidence, not pass. | `intent-statement.md`, `scope-document.md` | Approved |
| D10 | Use one stream-aligned Platform+UI driver mob with Booking/security/quality review hats. | `team-assessment.md` | Approved |
| D11 | Rough mockups are READY for Inception. | `wireframes.md ## Review` | Approved |

## Carried Conditions

- AI-DLC workflow scope is recorded as `enterprise`, while W2-01 source sizing is `feature`; later stages must either formally change scope or keep enterprise-depth artifacts constrained to W2-01.
- Named team availability is not yet confirmed.
- Local Compose live evidence must be observed; container startup alone is not acceptance.
- Graphify checked-in graph was stale; use fresh codebase-memory MCP and source verification for implementation decisions.

## Phase Gate Decision

Ideation recommends proceeding to Inception with the carried conditions above. No scope item lacks feasibility backing, but the subject-propagation path must remain the first technical risk to prove.

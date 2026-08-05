# RAID Log - W2-01 App Shell and Auth

## Source Context

This RAID log consumes `intent-statement.md`, `competitive-analysis.md`, `market-trends.md`, and `build-vs-buy.md` for W2-01. It tracks feasibility risks for shell/auth integration, real subject propagation, and live evidence.

## Risks

| ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---:|---:|---|
| R1 | Shell renders a user session but Booking BFF/backend still use `local-user`. | High | High | Make real subject propagation a first-class unit and detector 6d a DoD gate. |
| R2 | Scope expands into all module migrations. | Medium | High | Keep W2-01 to Booking mount; defer broad migration to W4-01. |
| R3 | Local bypass remains too permissive. | Medium | High | Fail closed outside local profile; log bypass use; test denied path. |
| R4 | W1 waiver gets misrepresented as passing live evidence. | Medium | High | Preserve waiver wording and require W2 live proof separately. |
| R5 | Compose runtime blockers prevent observed DoD. | Medium | High | Verify minimum services early: Keycloak, identity-service, booking-service, auth/shell app, Nginx. |

## Assumptions

| ID | Assumption | Validation |
|---|---|---|
| A1 | Existing `apps/auth` can be reused for shell login/session. | Source-verify during reverse engineering and application design. |
| A2 | Booking list/detail/create surfaces on `integ/main-reconciled` are preserved. | Compare current branch against base and avoid rewrites. |
| A3 | identity-service authorization can evaluate user actions by real subject token/reference. | Exercise `/internal/identity/authorize` in later requirements/design. |
| A4 | W2-02 design-system work can be consumed minimally without owning its foundation. | Coordinate through scope-definition and refined mockups. |

## Issues

| ID | Issue | Status | Owner |
|---|---|---|---|
| I1 | AI-DLC intent is recorded as enterprise scope while W2-01 statement recommends feature sizing. | Open | Conductor/user gate |
| I2 | Graphify graph exists but is stale relative to current checkout; codebase-memory MCP index is fresh. | Mitigated | Developer/architect |
| I3 | Learnings surface tool returned no candidates despite diary entries. | Open but non-blocking | Conductor |

## Dependencies

| ID | Dependency | Type | Handling |
|---|---|---|---|
| D1 | `apps/auth` sign-in/session/sign-out and access-denied paths. | Internal | Reuse, do not rebuild. |
| D2 | `identity-service` `/internal/identity/authorize`. | Internal | Integrate for real subject authorization. |
| D3 | Booking BFF/backend current routes and W1/W2 merged surfaces. | Internal | Preserve and mount inside shell. |
| D4 | Local Compose services and Nginx edge. | Runtime | Required for observed DoD. |
| D5 | W1-01 live-proof waiver evidence. | Evidence | Preserve as blocked/waived, not passed. |

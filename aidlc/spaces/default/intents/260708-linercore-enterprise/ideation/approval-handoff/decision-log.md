# Decision Log - LinerCore Enterprise Ideation

## Source Context

This decision log consumes:

- `intent-statement`: `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/intent-capture/intent-statement.md`
- `scope-document`: `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/scope-definition/scope-document.md`
- `intent-backlog`: `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/scope-definition/intent-backlog.md`
- `competitive-analysis`: `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/market-research/competitive-analysis.md`
- `feasibility-assessment`: `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/feasibility/feasibility-assessment.md`
- `constraint-register`: `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/feasibility/constraint-register.md`
- `team-assessment`: `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/team-formation/team-assessment.md`
- `wireframes`: `aidlc/spaces/default/intents/260708-linercore-enterprise/ideation/rough-mockups/wireframes.md`

Graphify was used as the primary indexed understanding layer during Ideation. codebase-memory MCP remains secondary when available; no MCP resources were exposed in the current session.

## Decisions

| ID | Stage | Decision | Rationale | Status |
|----|-------|----------|-----------|--------|
| D-001 | Intent Capture | Start a new enterprise intent at `aidlc/spaces/default/intents/260708-linercore-enterprise`. | User requested a new enterprise program and explicitly forbade restarting the MVP workflow. | Approved |
| D-002 | Intent Capture | Preserve `aidlc/spaces/default/intents/260630-shared-platform` as immutable historical MVP baseline. | Traceability to completed MVP and tag `shared-platform-mvp-complete` is required. | Approved |
| D-003 | Intent Capture | Keep complete enterprise target in scope. | User explicitly required Shared Platform, Charge, Agreement, Booking, D&D, CMM, full UI, integrations, Docker runtime, CI/CD, infrastructure, and Operation. | Approved |
| D-004 | Market Research | Build core carrier-owned domains; buy/adopt commodity or network-heavy capabilities where appropriate. | competitive-analysis shows competitors cover pieces, but carrier-owned integrated pricing/booking/movement/D&D logic is the differentiator. | Approved |
| D-005 | Feasibility | Proceed only as staged, contract-driven enterprise delivery. | feasibility-assessment says the program is viable but too broad for a single unsequenced implementation pass. | Approved |
| D-006 | Feasibility | Preserve strict module and database ownership. | constraint-register forbids cross-module SQL and domain collapse. | Approved |
| D-007 | Scope Definition | Treat Must Have backlog M-001 through M-023 as the complete enterprise release boundary. | intent-backlog defines all mandatory workstreams and gates. | Approved |
| D-008 | Scope Definition | Keep Operation and local Docker runtime as product requirements. | User target requires `docker compose --profile full up -d --build`, observability, CI/CD, runbooks, and incident readiness. | Approved |
| D-009 | Team Formation | Use stream-aligned module mobs with platform/enabling support. | team-assessment says one undifferentiated team would overload cognitive capacity and blur ownership. | Approved |
| D-010 | Rough Mockups | Use Claude UI export as preferred visual baseline, with operational console direction as default. | wireframes preserve module rail, journey ribbon, dense work surfaces, and right-side pricing/D&D/status rails. | Approved |
| D-011 | Rough Mockups | Do not treat raw Claude prototype behavior as implementation authority. | wireframes and scope-document require real APIs, permissions, events, ownership, and business behavior. | Approved |
| D-012 | Approval Handoff | Recommend GO to Inception, not construction. | Ideation is sufficient for phase transition, but reverse engineering, requirements, refined UX, application design, units, and delivery planning are still required. | Proposed |

## Open Decisions for Inception

| ID | Decision Needed | Owning stage | Why it matters |
|----|-----------------|--------------|----------------|
| OD-001 | Whether to keep module work as parent intent units or spawn child module intents. | Delivery Planning | Affects coordination, audit, Bolt sequencing, and team ownership. |
| OD-002 | Exact brownfield/mixed/greenfield classification after code scan. | Reverse Engineering | Current classifications are initial and must be validated against the codebase. |
| OD-003 | Final API/event contract freeze depth. | Application Design / Units Generation | Unblocks Booking/Charge/CMM integration without fake readiness. |
| OD-004 | Final UI direction blend between operational console and light-sidebar variants. | Refined Mockups | Sets implementation-ready design system decisions. |
| OD-005 | Vessel schedule/capacity source. | Requirements Analysis / Application Design | Booking validation and CMM journey derivation depend on it. |
| OD-006 | Trade/regulatory footprint and data residency. | NFR Requirements | Security, compliance, retention, and deployment policy depend on it. |
| OD-007 | External finance adapter depth. | Requirements Analysis / Application Design | Affects D&D/booking charge externalization but is not core first-pass completion unless approved. |

## Phase Gate Decision

Current recommendation: GO to Inception with conditions.

Conditions:

- Complete reverse engineering before architecture or implementation commitments.
- Keep Graphify as the primary discovery layer.
- Preserve historical MVP artifacts and tag.
- Keep all enterprise workstreams in scope.
- Carry unresolved risks forward explicitly.
- Use evidence-based completion gates throughout Inception, Construction, and Operation.

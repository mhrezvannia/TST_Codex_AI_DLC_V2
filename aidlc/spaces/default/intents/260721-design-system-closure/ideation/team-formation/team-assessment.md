# Team Availability Assessment

This assessment is sized to scope-document.md, intent-backlog.md, and feasibility-assessment.md.

## Delivery Topology

| Role | Availability | Responsibility |
|---|---|---|
| User / program owner | At explicit gates | Scope, revision, and phase approval |
| Codex conductor | Dedicated active session | Orchestration, implementation, verification, evidence, reporting |
| Product perspective | Loaded by relevant stage | Outcome, scope, actor, and acceptance traceability |
| Design perspective | Loaded for UI-bearing stages | MASTER/SESSION contract, responsive and accessibility review |
| Architecture perspective | Loaded by relevant stage | Boundary, dependency, and brownfield integrity |
| Quality / DevSecOps perspectives | Loaded by relevant stage | Test strategy, lint, audit, and evidence rigor |
| Operations / deployment perspectives | Loaded if directed | Isolated runtime safety and live proof |

## Capacity Allocation Agreement

- W2-02 closure receives the active implementation capacity until green or genuinely blocked.
- Findings outside scope are logged for follow-on work.
- Human gates are never self-approved by Codex.
- The manager demo is treated as an external protected dependency, not as available test capacity.

## RACI

| Activity | User | Codex | Stage persona | Audit tools |
|---|---|---|---|---|
| Scope approval | A | R | C | I |
| Source and graph discovery | I | A/R | C | I |
| UI implementation | I | A/R | C | I |
| Automated/live verification | I | A/R | C | C |
| Stage gates | A/R | C | I | I |
| Final evidence verdict | A | R | C | C |

Legend: A accountable, R responsible, C consulted, I informed.

## Availability Risks

The only anticipated capacity risks are local tool/runtime availability and repeated human gate latency. Neither justifies changing the delivery boundary.

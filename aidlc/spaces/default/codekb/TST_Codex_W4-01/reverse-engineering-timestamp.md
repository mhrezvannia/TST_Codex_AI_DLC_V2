# Reverse Engineering Freshness — TST_Codex_W4-01

## Execution record

| Field | Value |
|---|---|
| Synthesis performed (UTC) | `2026-08-03T13:07:06Z` |
| Repository | `TST_Codex_W4-01` |
| Workspace | `D:\TST_Codex_W4-01` |
| Git commit | `091b47bd810f4f0504871d0da048fb93b868ced7` |
| Branch | `intent/W4-01-module-list-detail-uplift` |
| Intent | `260803-module-list-uplift` |
| Scope | Single brownfield repository; static developer scan plus architect synthesis |

This timestamp records when the nine durable CodeKB artifacts were synthesized. The commit and branch were read from Git during synthesis. It does not assert a clean worktree or that all indexes were rebuilt at this commit.

## Evidence sources

- Complete developer code scan supplied to Architect Synthesis.
- Codebase-memory project `TST_Codex_W4-01`: 112,113 nodes, 134,886 edges, 142 route nodes, 521 Java files, and 188 TypeScript files.
- Existing Graphify graph queried for Reference, Charge, Agreement, Container Movement, Journey, Shell, Route, List, Detail, Booking, and Pricing vocabulary/connections.
- Repository Git metadata for commit and branch.
- AI-DLC state and applicable organization, team, project, and inception rules.

Verified evidence was kept separate from architectural inference. Graph traversal was used for orientation and route/source cross-checking, while the supplied developer scan remained the complete scan context.

## Analysis scope

The synthesis covers frontend applications, shared TypeScript packages, five Java services, platform messaging, REST and Avro/Pact contract surfaces, build systems, dependency relationships, test/quality indicators, and technical-debt signals. It emphasizes W4-01 list/detail readiness across Reference Data, Charge Agreements, Container Movement, Booking projection, auth, shell, and shared UI boundaries.

## Freshness and limitations

The codebase-memory and Graphify indexes were present, but their freshness was not independently verified against every file at the recorded commit. No runtime/Compose/browser/audit/test/coverage execution occurred. Exact Nginx locations, hidden CI workflows, production infrastructure, and external/untracked components were not inspected. Absence findings are bounded to the supplied scan plus graph/manifest discovery.

Rerun reverse engineering when material code/contracts change, an index is rebuilt, the shell route composition changes, or before relying on these artifacts for a later intent whose baseline differs from the recorded commit.

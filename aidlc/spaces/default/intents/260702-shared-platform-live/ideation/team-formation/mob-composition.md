# Mob Composition - Shared Platform Local Functionality

## Mob Strategy

This mob plan consumes `scope-document`, `intent-backlog`, and `feasibility-assessment`. The delivery shape is one cross-functional platform mob for the walking skeleton, then focused mobs aligned to backlog dependencies.

## Mobs

| Mob | Units | Driver | Navigator / review perspective | Outcome |
| --- | --- | --- | --- | --- |
| M0 Runtime Baseline Mob | U01, U02 | Codex implementation executor | Delivery + platform + operations perspectives | Toolchain checks, Compose build/run strategy, local run path. |
| M1 Service Skeleton Mob | U03 | Codex implementation executor | Developer + quality + architect perspectives | Backend services compile/test/run and expose health/API baseline. |
| M2 Identity Mob | U04, U12 | Codex implementation executor | Security + compliance + product perspectives | Keycloak bootstrap, auth flow, authorization, local-only bypass safeguards. |
| M3 Reference Data Mob | U05, U06, U07 | Codex implementation executor | Product + developer + quality perspectives | Persisted admin APIs, BFF wiring, UI mutations, seed apply mode. |
| M4 Event and Contract Mob | U08, U09 | Codex implementation executor | Architect + quality + operations perspectives | Outbox/Kafka/Schema Registry proof and contract/message test alignment. |
| M5 Readiness Mob | U10, U11 | Codex implementation executor | Quality + operations + devsecops perspectives | Full quality gates, smoke scripts, health/logging, runbook. |

## RACI

| Activity | Responsible | Accountable | Consulted | Informed |
| --- | --- | --- | --- | --- |
| Scope and priority decisions | Codex drafts | User | Product/delivery perspectives | Future module teams |
| Code implementation | Codex | User at gates | Developer/architect/security/quality perspectives | User |
| Local machine prerequisite setup | User/local environment owner | User | Codex | Delivery conductor |
| Test and quality gate execution | Codex where tools exist | User at gates | Quality/devsecops perspectives | Future module teams |
| Security and compliance evidence | Codex | User at gates | Security/compliance perspectives | Operations |
| Operations runbook | Codex | User at gates | Operations/platform perspectives | Future module teams |

## Build Order

1. M0 Runtime Baseline Mob: remove tooling and image/build ambiguity first.
2. M1 Service Skeleton Mob: make backend targets real before BFF wiring.
3. M2 Identity Mob: establish auth before write operations.
4. M3 Reference Data Mob: deliver the user-visible functional platform slice.
5. M4 Event and Contract Mob: make the slice integration-ready for downstream modules.
6. M5 Readiness Mob: lock quality gates, smoke tests, and operations evidence.

## Communication and Gate Policy

- Optional implementation questions are minimized and answered from artifacts when possible.
- Mandatory AI-DLC approval gates still require explicit user approval.
- Blockers are reported only when they prevent executable progress, such as missing Java/Maven/Docker evidence.
- Every implementation unit must trace back to U01-U12 and must not include downstream business-module runtime work.

## Definition of Ready for Construction

Construction is ready when Inception produces requirements, designs, and units that map cleanly to the mob plan above. The first construction slice should be a walking skeleton that exercises local runtime, auth, one reference-data mutation path, persistence, and event/status visibility.

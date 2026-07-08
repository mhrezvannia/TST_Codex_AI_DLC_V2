# Team Allocation - Shared Platform MVP

## Source Trace

This allocation is based on `requirements.md`, `stories.md`, `mockups.md`, `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, `team-practices.md`, and `delivery-planning-questions.md`.

## Team Formation Status

Team Formation did not run for this MVP scope. Per the Delivery Planning stage rule, all Bolts default to `aidlc-developer-agent` execution, with the live AI-DLC conductor coordinating gates, reviews, and transitions.

## Allocation Table

| Bolt | Primary execution owner | Review/support expectations |
|---|---|---|
| Bolt 1 - Gated Walking Skeleton | `aidlc-developer-agent` | Architect, quality, and user approval gate before parallelism. |
| Bolt 2 - Identity Authorization Service Completion | `aidlc-developer-agent` | Architecture/security review; contract and authz tests. |
| Bolt 3 - Reference Domain and Provider/Admin APIs Completion | `aidlc-developer-agent` | Architecture/product review; domain and API tests. |
| Bolt 4 - Reference Event Outbox and Kafka Completion | `aidlc-developer-agent` | Architecture/quality review; schema and message-contract tests. |
| Bolt 5 - Auth Frontend App Completion | `aidlc-developer-agent` | Design/security review; auth E2E and accessibility checks. |
| Bolt 6 - Reference Data Frontend App Completion | `aidlc-developer-agent` | Design/product review; UI validation and accessibility checks. |
| Bolt 7 - Published Contracts and Developer Experience | `aidlc-developer-agent` | Architecture/downstream representative review; contract freeze evidence. |
| Bolt 8 - Local Seed Data and Docker Compose Environment | `aidlc-developer-agent` | Quality/operations review; local smoke checks. |
| Bolt 9 - CI, Contract, Schema, and Test Quality Gates | `aidlc-developer-agent` | Quality/pipeline review; gate failure evidence. |
| Bolt 10 - Observability, Health, and Deployment Readiness | `aidlc-developer-agent` | Operations/security review; staging readiness checks. |

## Parallelism Rule

- Bolt 1 is serial and gated.
- After Bolt 1 approval, independent DAG branches may be considered for parallel execution only when the active AI-DLC autonomy/gate setting permits it.
- Parallel work must not violate the direct dependencies in `unit-of-work-dependency.md`.

## Branching and Merge Practice

`team-practices.md` requires trunk-based development on `main` with short-lived feature or Bolt branches. Each Bolt branch is squash-merged into `main`, keeping the trunk linear and aligned to the AI-DLC delivery sequence.

## Gate Practice

The first Construction Bolt is a gated walking skeleton. After it ships, the workflow asks the autonomy ladder prompt to decide whether later Bolts run autonomously or remain gated.

## Delivery Responsibilities

- The conductor owns stage routing, approval gates, and audit integrity.
- The developer agent owns implementation within each Bolt.
- Review personas are invoked by the relevant construction stages.
- The user remains the approval authority at gates.

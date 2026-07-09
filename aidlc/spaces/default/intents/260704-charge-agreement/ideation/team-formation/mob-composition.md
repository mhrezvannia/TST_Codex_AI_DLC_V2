# Mob Composition - Charge & Customer Agreement

## Working Mob

| Role | Responsibility | Primary artifacts / checks |
| --- | --- | --- |
| Driver | Codex coding agent | Code edits, scripts, tests, runtime checks. |
| Product navigator | AI-DLC product role plus user gates | Scope, user value, acceptance criteria. |
| Architecture navigator | AI-DLC architect role | Service boundaries, data model, API contracts. |
| Quality navigator | AI-DLC quality role and test commands | Unit/API/UI/smoke evidence. |
| Platform navigator | AI-DLC platform/operations roles | Local runtime, ports, readiness, Docker blocker tracking. |
| Compliance navigator | AI-DLC compliance role | Auth bypass controls, approval audit metadata, data classification. |

## RACI

| Work item | Responsible | Accountable | Consulted | Informed |
| --- | --- | --- | --- | --- |
| Scope and MVP boundary | Product navigator | User/product sponsor | Architecture, delivery | All roles |
| Backend implementation | Driver | User/product sponsor | Architecture, quality | Product |
| UI implementation | Driver | User/product sponsor | Product, quality | Architecture |
| Test evidence | Quality navigator / driver | User/product sponsor | Architecture | All roles |
| Local runtime | Platform navigator / driver | User/product sponsor | Quality | Product |
| Compliance constraints | Compliance navigator | User/product sponsor | Architecture | Delivery |

## Communication Cadence

| Event | Communication |
| --- | --- |
| Stage gate | Summarize artifacts and ask approve/request changes. |
| Implementation milestone | Report files changed, behaviors added, and tests run. |
| Runtime blocker | State exact blocker and workaround, especially Docker/Compose status. |
| Module completion | Provide URLs, commands, evidence files, and remaining deferred scope. |

## Onboarding Checklist

1. Read scope-document and intent-backlog.
2. Confirm Shared Platform local services are running.
3. Review existing backend service module layout.
4. Review existing Next.js app workspace patterns.
5. Run targeted tests after each vertical slice.
6. Update readiness/smoke evidence before module completion.

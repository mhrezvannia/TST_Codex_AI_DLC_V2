# Skill Matrix - W2-03 Charge Tariffs & Agreements

Required capability comes from [`scope-document.md`](../scope-definition/scope-document.md), sequencing from [`intent-backlog.md`](../scope-definition/intent-backlog.md), and risk from [`feasibility-assessment.md`](../feasibility/feasibility-assessment.md). Availability ratings remain **unverified** until real assignees are supplied.

## Required Skill Matrix

| Skill | Required depth | Applies to | Availability | Evidence before assignment is accepted |
|---|---|---|---|---|
| Liner shipping charge/agreement domain | Advanced | All PB items | Unverified | Review of tariff/category/version/reprice/manual invariants |
| Java domain/application design | Advanced | PB-01 to PB-05 | Unverified | Existing ports-and-adapters implementation/test familiarity |
| Spring REST/security integration | Intermediate+ | Provider APIs/auth | Unverified | Exact contract and subject/role test ability |
| PostgreSQL/Flyway migration | Advanced | PB-01/PB-02 | Unverified | Upgrade/backfill/restart/forward-repair proof experience |
| Contract testing | Advanced | PB-01/PB-03/PB-05 | Unverified | OpenAPI/example/provider/consumer synchronization |
| Booking domain and snapshots | Advanced | PB-01/PB-03/PB-04/PB-05 | Unverified | Immutable snapshot/reprice/manual-state evidence |
| React/TypeScript operational UI | Intermediate+ | PB-01 to PB-05 | Unverified | Shared-shell route and dense form/table work |
| Accessibility/responsive UI | Intermediate+ | All UI outcomes | Unverified | Keyboard/state/theme/four-viewport Playwright proof |
| Docker Compose/local operations | Intermediate+ | Live acceptance | Unverified/blocked here | Wave A wrapper, health/debug, demo-guard discipline |
| Security/compliance review | Intermediate+ | Cross-cutting | Unverified | Authorization, data classification, safe logs/audit evidence |
| Graphify/codebase-memory impact analysis | Intermediate | Discovery/change review | Tooling available | Query/path evidence and honest index-freshness reporting |
| AI-DLC/audit gates | Intermediate | Phase/stage/release gates | Workflow active | Correct sensors, state, `aidlc-audit`, `erp-fidelity-audit` |

## Gap Analysis

| Gap | Type | Impact if unresolved | Remediation |
|---|---|---|---|
| No confirmed assignees or capacity | Organizational | Cannot promise schedule or independent reviews | Assign role owners and capacity before delivery planning is committed |
| Docker inaccessible in current sandbox | Environment | Cannot complete demo guards/live/UI/audit acceptance | Use an authorized Docker-capable runner or contributor; retain explicit dependency |
| Production jurisdiction/retention unknown | Governance | Production compliance approval incomplete | Compliance owner confirms before production promotion, not before local slice design |
| Exact current Graphify freshness may vary | Knowledge/tooling | Impact analysis may omit new source | Query graph first, compare with current source/contracts, re-index after material changes |
| Shared contract/migration/page files span proto-items | Coordination | Conflicting edits or ownership ambiguity | Allocate each shared chain/file to one explicit later Unit owner |

## Skill Gap Remediation Plan

1. Run a context onboarding session covering W2-03 statement, program backlog, slicing playbook, enterprise contract, design master/session prompt, and prior-wave evidence.
2. Pair Charge and Booking domain reviewers on the contract/version/snapshot walking skeleton.
3. Pair data/migration and quality roles on additive upgrade evidence before downstream schema work.
4. Apply `ui-ux-pro-max` and a frontend/quality pair to each UI-bearing page and Playwright proof.
5. Book the Docker-capable release-review role and isolated acceptance window before calling any outcome release-ready.
6. Escalate only a demonstrated missing skill; do not pre-emptively add external vendors or cloud services.

## Onboarding Checklist

- [ ] Read the complete W2-03 Context Pack and approved Ideation artifacts.
- [ ] Confirm baseline/branch ancestry and protect unrelated/user-owned changes.
- [ ] Review W0-02 reference identities and W1/W2 historical evidence/waiver.
- [ ] Review Charge and Booking ownership plus exact bilateral contract.
- [ ] Load LinerCore `MASTER.md`, `SESSION-PROMPT.md`, and Charge page record before UI work.
- [ ] Confirm role assignment, review independence, and escalation path.
- [ ] Confirm isolated Wave A commands, manager demo guard, ports, and evidence location.
- [ ] Confirm graph/tooling access and re-index responsibilities.

## Upstream Coverage

The `scope-document` determines breadth; the `intent-backlog` determines which skills must collaborate per vertical outcome; the `feasibility-assessment` determines depth for migrations, contract fidelity, security, UI, and live proof.

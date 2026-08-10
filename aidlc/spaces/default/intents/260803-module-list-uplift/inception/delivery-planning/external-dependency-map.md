# External Dependency Map - W4-01 Module List-Detail Uplift

## Source Alignment

Dependencies are consolidated from `requirements.md`, `stories.md`, `mockups.md`, `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, and `team-practices.md`. This map separates hard entry/completion gates from conditional capabilities whose truthful absence is accepted. No dependency permits a domain-local shell/theme/component fork, client simulation, shared database, new backend/topic, or unsupported PASS claim.

## Gated Dependencies

| ID | Dependency / owner | Lead time | Blocks | Exit evidence | Mitigation while waiting |
| --- | --- | --- | --- | --- | --- |
| D01 | Published `PlatformShell`, route registry, tokens, auth/session and required `@erp/ui` behavior - W2-02/UI-platform/shell owners | Unconfirmed | Construction entry; B01-B04 integration | Versioned release/API, consumer tests, one landmark/nav tree, ownership sign-off | Contract/readiness review only; no local fork |
| D02 | Named core-mob assignments, committed capacity, review calendar, escalation contacts - Product/Delivery | Unconfirmed | Construction entry/B01 | Completed allocation checklist and calendar | No dates; prepare artifacts/fixtures only |
| D03 | Isolated `linercore-wave-a` Compose slot, fixtures, manager guard, audit operators - Release/SRE | Unconfirmed | B01 demo, every live Bolt gate, intent exit | Reserved slot, wrapper/guard output, retained evidence paths | Run fast static/local checks only; never label live PASS |
| D04 | Reference read/history/action/freshness/provider fixtures - Reference owner | Unconfirmed | B01 thin path; B02 completion | Provider/BFF contract tests and seeded persisted/outage fixtures | Implement only confirmed subset; keep unsupported controls absent |
| D05 | Current-request policy fixtures for module/action capabilities - Identity owner | Unconfirmed | B01-B04 security evidence | ALLOW/DENY/read-only/outage tests; exact CMM capabilities before B04 | Fail closed; no cached/client/local-user substitute |
| D06 | Charge query/action parity and bounded Reference option port - Charge + Reference owners | Unconfirmed | B03 affected paths | Exact request/result/transport/cardinality/failure contract tests | Preflight during B01/B02; block affected B03 behavior |
| D07 | Charge D&D mapping and independent Approval Queue Draft filters/pagination - Charge/D&D owners | Unconfirmed | Conditional B03 regions only | Provider-backed fields/filter/page tests per region | Render truthful unavailable/BLOCKED; no synthesis/client merge |
| D08 | CMM frontend prerequisites, v2 media/timeline, assertion verification, attempt-token capture and exact Identity capabilities - CMM/Identity/platform | Unconfirmed | B04 entry | Producer/consumer compatibility, security, idempotency and route/mount tests | Preflight early; no v1 browser exposure or local authority |
| D09 | Exact Booking/Journey lookup and signed origin integration under canonical shell Booking ownership - Booking/CMM/shell owners | Unconfirmed | B04 relationship outcome | Present/not-created/denied/degraded/direct/safe-return live tests | Keep link absent if exact IDs/authorization unavailable |
| D10 | Listener poison handling, bounded retry, DLQ/replay owner/operator contract - Booking/CMM/platform/SRE | Unconfirmed | **B04 completion and intent exit** | Executable contract, tests and live operator evidence, or approved bounded replacement | None that permits completion; owning aggregate reads remain truthful |
| D11 | W4 touched-path security aggregator or bounded equivalent - Security/CI owner | Unconfirmed | Final merge/intent exit | Executed blocking report over final changed set | Prepare changed-set manifest; no repository-wide claim |
| D12 | Domain/platform/accessibility/security/SRE review windows - Delivery plus named owners | Unconfirmed | Relevant Bolt gate | Recorded reviewers, decision requested, sign-offs/findings resolved | Schedule early; no retrospective substitute |

## Non-Blocking but Explicit Contract Exits

| Exit | Current accepted behavior | Future admission condition |
| --- | --- | --- |
| Reference search/sort/Validate/deactivate/reactivate | Controls absent | Exact provider + Identity contracts, approved scope/change control |
| Agreement generic/origin/destination/equipment filters and selectable sort | Controls absent | Provider-aligned bounded contract and review |
| Agreement <-> Booking links | Links absent with blocker evidence | Canonical identifiers/projection, dual-owner sign-off and live tests |
| Manual-pricing resolution | Read-only OPEN evidence only | Separate approved workflow intent |
| CMM search/filter/page/create/correction | Controls absent | Provider capability and separately approved scope |
| Production/cloud/SLO/DR claims | Not claimed | Separate environment, owner, targets and executable evidence |

## Dependency Timing by Bolt

| Bolt | Must close before entry | May remain conditional during Bolt | Must close before completion |
| --- | --- | --- | --- |
| B01 | D01-D05, B01 reviewers in D12 | Missing non-scope Reference controls | B01 live/audit evidence |
| B02 | B01 approval, D04/D05, reviewers | Unsupported Reference lifecycle exits | All U02-required provider/recovery outcomes |
| B03 | B02 acceptance, D05/D06, reviewers | D07 regions and blocked Agreement links if truthfully unavailable | All admitted B03 paths and evidence |
| B04 | B03 acceptance, D01/D03/D05/D08/D09, reviewers | No event-control waiver | D10 plus all U04 live outcomes |
| Intent exit | All Bolt approvals, D03/D11/D12 | Only explicitly out-of-scope exits | Both audits, final evidence matrix and no hard open dependency |

## Escalation and Ownership Rules

1. Delivery records owner, requested decision, due window, consuming Bolt, and evidence link.
2. Product decides scope/value; the technical owner retains authority to block unsafe or contract-false behavior.
3. An unconfirmed lead time is reported as unconfirmed, never converted into a date.
4. If a hard dependency misses its entry window, the Bolt does not start; only unaffected preparation continues.
5. If D10 remains open, B04 and W4-01 remain not done regardless of other green tests.

## Current Readiness Summary

The map is implementation-ready, but human capacity, review dates, shared release readiness, environment reservations, and several provider/security exits are still unconfirmed. Construction entry is therefore **BLOCKED pending D01-D05 and D12 confirmation**; approval of this plan does not mark those dependencies resolved.

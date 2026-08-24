# Mob Composition and RACI — W4-01 Module List-Detail Uplift

## Sources and Working Model

Sources: `scope-document.md`, `intent-backlog.md`, and `feasibility-assessment.md`.

The W4-01 core is a stream-aligned product mob. It works sequentially across Reference, Charge, and Container. Focused ensemble sessions are used for uncertain/shared seams; well-understood implementation and research may proceed in pairs or solo with durable review artifacts.

## Core Mob

| Seat | Responsibility |
|---|---|
| Product navigator | Maintains user outcome, scope, provider-blocked truth, and acceptance decisions |
| Delivery facilitator | Maintains flow, gate readiness, dependencies, reviewer scheduling, and parking lot |
| Design navigator | Directs interaction/state/responsive/accessibility contract and ordered UI tasks |
| Frontend driver/navigator(s) | Implement routes, view models, shared primitives, and tests; rotate driver |
| Active module navigator | Supplies Reference, Charge, or Container domain contract truth for current slice |
| Quality navigator | Supplies acceptance, negative-state, accessibility, responsive, and live evidence strategy |

Shell/auth, UI-platform, security/compliance, and SRE owners join scheduled seam sessions and reviews rather than becoming permanent bottlenecks.

## Session Pattern

- Start each high-risk session with one explicit outcome and the authoritative context open.
- Rotate driver during implementation-focused mob sessions; one navigator speaks at a time.
- Use short silent research breaks when the group is blocked, then reconvene on evidence.
- Record decisions in the active stage artifact; do not rely on chat-only agreement.
- End with tests/evidence status, unresolved owners, and the next gate condition.
- Use asynchronous review for prose, routine code, and follow-up across time zones; do not require always-live participation.

## Slice Composition

| Slice | Core additions | Required seam sessions |
|---|---|---|
| Reference Data | Reference domain owner | Provider capability matrix; shared list/detail/state mapping; action parity |
| Charge Agreements | Charge domain owner | Mature route/BFF regression; Agreement↔Booking routing; workbench retirement |
| Container Movement | Container domain + shell/platform owners | W2-04 contract verification; app/BFF boundary; Compose/Nginx mount; Journey↔Booking |
| Integrated closure | Shell/platform + all domain + accessibility/quality reviewers | Authenticated user tour, themes/breakpoints, cross-links, audits |

## RACI Matrix

Legend: A = Accountable, R = Responsible, C = Consulted, I = Informed.

| Decision / deliverable | Product | Delivery | Design | Frontend | Domain owner | UI platform | Shell/auth/platform | Quality/a11y | Security/SRE |
|---|---|---|---|---|---|---|---|---|---|
| Scope and provider-blocked disposition | A | C | C | I | R | I | I | C | C |
| Ordered UI/UX designs | A | I | R | C | C | C | C | C | I |
| Module domain semantics/actions | C | I | C | R | A | I | I | C | C |
| Shared component/token change | I | I | R | R | C | A | I | C | I |
| Canonical shell route/session/mount | C | I | C | R | C | I | A | C | C |
| Accessibility acceptance | C | I | R | R | C | C | C | A | I |
| Security/privacy/audit control | I | I | C | R | C | I | R | C | A |
| Live Compose and audit exit evidence | A | R | C | R | C | C | R | R | C |
| Stage/phase approval | A | R | C | C | C | C | C | C | C |

## Decision and Escalation Path

1. Evidence or design question is resolved by the owning role at its boundary.
2. Cross-boundary conflict is documented with affected requirement, provider, shared component, route, and evidence impact.
3. Delivery facilitates a time-boxed decision among product and seam owners.
4. Product owner decides scope/value; technical owners may block unsafe, inaccessible, contract-false, or ownership-breaking implementation.
5. Unresolved decisions keep the affected behavior or gate blocked; they never justify simulation or a local fork.

## Capacity and Review Agreement

- Only one module slice is active for core implementation at a time.
- Domain and seam owners commit review windows before their gate.
- Shared-UI and shell/auth reviews occur before merge, not as retrospective audit cleanup.
- Quality/accessibility work is included in slice capacity.
- Named assignments and utilization are required in Delivery Planning; until then, this is a role-level plan.

## Completion Conditions

Team formation is ready when every role has an accountable owner, each slice has scheduled domain and seam coverage, critical pairing sessions are planned, and no team believes it may independently fork the shell, tokens, auth, or `@erp/ui`.

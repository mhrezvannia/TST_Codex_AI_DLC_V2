# Team Allocation - W4-01 Module List-Detail Uplift

## Source Alignment

Allocation is derived from `requirements.md`, `stories.md`, `mockups.md`, `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, and `team-practices.md`, plus the approved team-formation assessment and mob composition. One stream-aligned W4 mob owns all four Bolts sequentially; domain/platform specialists join as scheduled reviewers rather than separate implementation teams.

## Core Mob Allocation

| Seat | All Bolts | Bolt-specific emphasis | Named person / confirmed capacity |
| --- | --- | --- | --- |
| Product owner | Accountable for scope, blocker disposition, Bolt/stage approval | B01 and final demos; relationship/queue decisions | **UNCONFIRMED - Construction entry blocker** |
| Delivery lead | Sequence, dependencies, review calendar, evidence/gates | B01 gate and serialized Compose reservation | **UNCONFIRMED - Construction entry blocker** |
| UX/product designer | Interaction/state/responsive/accessibility navigation | Domain vocabulary and refined design conformance | **UNCONFIRMED** |
| Frontend driver/navigators | Route/BFF/view implementation and tests | Reference B01/B02; Charge B03; CMM/shell Booking B04 | **UNCONFIRMED - Construction entry blocker** |
| Quality/accessibility | Test design, fixtures, five-width/two-theme, live evidence | Continuous in every Bolt | **UNCONFIRMED - Construction entry blocker** |
| Active domain navigator | Provider contract/action truth | Reference B01/B02; Charge B03; CMM B04 | **UNCONFIRMED before owning Bolt** |
| UI-platform owner | `@erp/ui`, tokens, shared primitive contract/review | Every Bolt; no domain fork | **UNCONFIRMED before B01** |
| Shell/auth/platform owner | Registry/session/mount/edge/health | B01 and B04, review B02/B03 | **UNCONFIRMED before B01** |
| Security/compliance reviewer | Policy/assertion/header/audit review | B01 auth/edge; B04 assertion/idempotency | **UNCONFIRMED before relevant gate** |
| SRE/operations reviewer | Compose, health, correlation, event controls | B01 environment; B02 degradation; B04 poison/replay | **UNCONFIRMED before relevant gate** |

No individual names, time zones, leave, competing initiatives, or employment-level utilization are available in approved evidence. They are not invented. The core mob receives 100% of the **committed W4 work-in-progress slot** while a Bolt is active; this is a WIP rule, not a claim about any person's FTE.

## Bolt-to-Mob Assignment

| Bolt | Driver | Primary navigators | Mandatory consulted reviewers | Approval owner |
| --- | --- | --- | --- | --- |
| B01 | W4 frontend driver | Reference, design, quality | UI-platform; shell/auth; Identity/security; SRE/release | Product owner with delivery facilitation |
| B02 | W4 frontend driver | Reference, design, quality | UI-platform; security; SRE for degradation | Product owner with Reference owner sign-off |
| B03 | W4 frontend driver | Charge, design, quality | Reference-option; UI-platform; security; product | Product owner with Charge owner sign-off |
| B04 | W4 frontend driver | CMM, Booking/shell, design, quality | Reference; UI-platform; Identity/security; SRE/event owners | Product owner with CMM/Booking/platform sign-off |

## Review Windows and Handoffs

| Review window | Must be confirmed by | Evidence requested |
| --- | --- | --- |
| B01 platform seam review | Before Construction entry | Published W2-02 version, registry/session/edge contract, no-fork decision |
| Reference provider review | Before B01 and B02 gates | Query/history/action/freshness fixtures and outcome contract |
| Charge parity review | Before B03 implementation | Query/action/options/D&D/queue contract evidence |
| CMM/Booking security review | Before B04 implementation | Identity capabilities, v2 media, assertion, token/idempotency, link contract |
| Event operations review | Before B04 can complete | Poison/retry/DLQ/replay executable evidence and operator owner |
| Live acceptance reservation | Before each Bolt demo and final exit | Isolated stack slot, fixtures, demo guard, audit operators |

Exact calendar windows are **TBD by the Delivery lead**. Missing confirmation blocks the consuming entry gate; it does not authorize overtime, hidden parallel teams, or bypassed review.

## RACI and Ownership Guardrails

- Product is accountable for scope/value; technical owners may block unsafe, inaccessible, contract-false, or ownership-breaking work.
- UI-platform remains accountable for shared tokens/primitives; shell/auth/platform remains accountable for canonical shell/session/mount behavior.
- Domain owners remain accountable for provider semantics; the W4 driver is responsible for feature-local composition and adapters.
- Quality/accessibility is part of each Bolt, not final cleanup.
- Shared contract evolution is append-only with producer and consumer sign-off.
- A blocked provider/platform exit keeps the affected Bolt blocked and never triggers a local fork or client simulation.

## Construction Entry Checklist

- [ ] Named Product owner and Delivery lead confirmed.
- [ ] Named frontend Driver/Navigator coverage and committed W4 capacity confirmed.
- [ ] Named Quality/accessibility coverage confirmed.
- [ ] B01 Reference, UI-platform, shell/auth, security, and SRE reviewers scheduled.
- [ ] Escalation contacts and response expectations recorded.
- [ ] Isolated Compose/demo/audit slot reserved.
- [ ] Branch baseline and worktree ownership confirmed.

Until these items are complete, the plan is role-ready but human-capacity readiness remains **BLOCKED**.

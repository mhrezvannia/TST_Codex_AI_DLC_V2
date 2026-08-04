# Stakeholder Map — W4-01 Module List-Detail Uplift

## Decision Authority

The program/product owner holds final approval authority at every AI-DLC gate. The UI Driver is accountable for the end-to-end intent and coordinates reviews; domain, accessibility, and quality owners approve the correctness of their owned seams but do not independently redefine the shared shell, tokens, or navigation.

## Stakeholders and Interests

| Stakeholder role | Interest / outcome | Authority | Required evidence |
| --- | --- | --- | --- |
| Program/product owner | Three-module product parity without scope or ownership drift | Final gate decision-maker | Intent traceability, live journey, audit status, unresolved blockers |
| UI Driver | One coherent shell-mounted experience and ordered three-unit delivery | Accountable delivery lead | Shared pattern, route/state matrix, cross-module consistency |
| Reference Data owner / administrator representative | Accurate set/record facts, history, and permitted mutations | Domain reviewer and contributor | Provider-backed lists/details/actions; read-only and conflict behavior |
| Charge owner / pricing analyst representative | Accurate agreement, rate, D&D, and lifecycle behavior | Domain reviewer and contributor | Current list/detail/action preservation; Booking cross-links |
| Container Movement owner / operations representative | Accurate journey, movement timeline, sequence outcomes, and Booking link | Domain reviewer and contributor | W2-04 contract fidelity; missing-source resolution; live route evidence |
| Booking owner | Stable Agreement/Journey cross-link targets and preserved Booking ownership | Interface reviewer | Exact canonical record links; no Booking redesign |
| UI platform owner (`apps/shell`, `packages/ui`) | Shell, token, primitive, accessibility, and version integrity | Shared-platform reviewer | No fork/duplicate shell; shared dependency register |
| Accessibility reviewer | WCAG AA, keyboard/focus/announcement and responsive conformance | Quality reviewer | 375/390/768/1024/1440 and light/dark evidence |
| Quality/release reviewer | Honest integrated acceptance and demo safety | Release evidence reviewer | Live Compose, Playwright, quality gates, `aidlc-audit`, `erp-fidelity-audit` |

## Decision-Makers vs. Influencers

- **Decision-maker:** program/product owner.
- **Accountable driver:** UI Driver.
- **Required reviewers:** each affected domain owner, Booking interface owner, UI platform owner, accessibility reviewer, and quality/release reviewer.
- **Influencers:** authenticated operational users and existing provider/service owners whose observed workflows and contracts constrain the design.
- **Not decision authorities:** generic UI recommendations, screenshots, detached component tests, backend services acting as presentation owners, or module-local theme proposals.

## Ownership Boundaries

| Surface | Owner | W4-01 rule |
| --- | --- | --- |
| Authenticated shell, navigation, session presentation | `apps/shell` / UI platform | Extend only for canonical module mounts; never duplicate locally |
| Tokens and shared primitives | `packages/ui` / UI platform | Consume first; record missing platform dependencies; never fork |
| Reference Data composition | Reference Data domain | Own terminology, route content, validation, commands, and provider states |
| Charge composition | Charge domain | Own agreements, rates, D&D, lifecycle, commands, and provider states |
| Container Movement composition | Container Movement domain | Own journeys, movement timeline, DCSA meaning, commands, and provider states |
| Booking cross-link destinations | Booking domain | Preserve canonical Booking routes and facts; no W4-01 Booking redesign |
| Service facts and authorization decisions | Owning Spring service / identity service | Consume through BFF/contracts; UI does not invent data or permission |

## Communication Requirements

- Present and stop at every AI-DLC approval gate for the program/product owner's decision.
- Requirements Analysis and User Stories must be approved before any final UI/UX design task runs.
- During the parked Refined Mockups boundary, generate and review UI/UX tasks 21, 22, and 23 in order; obtain explicit approval for each design before the binding Refined Mockups handoff.
- Record provider, shared-component, shell, and ownership gaps with a named owner and `BLOCKED` evidence cell; never hide them through local workarounds.
- Notify the relevant domain/interface reviewer before changing a contract surface, route target, or action semantics.
- Report live evidence separately from static tests or screenshots, retaining honest failure artifacts and demo-guard status.

## Approval Cadence

1. AI-DLC stage artifacts: program/product owner approval after required specialist review.
2. Refined design candidates: approve Reference Data, then Charge, then Container Movement individually.
3. Shared binding Refined Mockups gate: approve only after all three designs are reviewed and CMM source/mount is explicit.
4. Per-unit implementation evidence: domain, UI platform, accessibility, and quality review as applicable.
5. Intent exit: program/product owner approval only after all three units pass live Compose and both audits.


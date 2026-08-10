# Skill Matrix — W4-01 Module List-Detail Uplift

## Sources and Rating

Sources: `scope-document.md`, `intent-backlog.md`, and `feasibility-assessment.md`.

Ratings describe evidence in the current repository and intent context, not named individuals: **Established**, **Needs pairing**, or **Verify**.

## Required Skills and Gaps

| Skill | Need | Current signal | Rating | Remediation / evidence |
|---|---|---|---|---|
| TypeScript / Next.js App Router | High | Five current apps and mature routes exist | Established | Assign current frontend engineers; code review against existing patterns |
| LinerCore shell/auth/session | High | W2-01 closed; current shell/auth apps and Nginx routes exist | Needs pairing | Shell/auth owner pairs on canonical routing and Container mount |
| `@erp/ui` and token governance | High | W2-02 closed; shared package exists | Needs pairing | UI-platform owner reviews all mappings and shared gaps |
| Reference Data contracts/permissions | High for Unit 1 | Current service-client, permission, correlation/error seams exist | Established | Reference domain reviewer approves capability/action matrix |
| Charge Agreement/rate/D&D behavior | High for Unit 2 | Mature list/detail/BFF components exist | Established | Charge reviewer anchors regression and parity tests |
| Container journey/event contracts | High for Unit 3 | W2-04 service/contracts exist; app absent | Needs pairing | Container engineer pairs from requirements through live route |
| BFF security and service boundaries | High | Existing proxy/session/token patterns | Needs pairing | Auth/security review; no client secrets/direct service calls |
| Accessibility and async operational states | High | Binding design-system contract; evidence must span three modules | Needs pairing | Accessibility engineer joins stories, design, implementation, manual tests |
| Responsive/light-dark design evidence | High | W2-02 patterns exist | Established / verify | Designer + quality evidence at all required widths/themes |
| Compose/Nginx/health routing | High for Unit 3 | Current topology exists; Container UI/mount absent | Needs pairing | Platform owner drives minimal app service and edge mount |
| Provider contract/integration testing | High | Real services and Compose stack exist | Established / verify | Domain + quality pair on supported/blocked matrix and negative paths |
| Observability/correlation/audit | Medium | Health, logging, correlation and observability profiles exist | Verify | SRE reviews changed routes and live evidence |
| Delivery/change control | High | Program backlog and AI-DLC gates exist | Established | Delivery lead schedules reviewers and tracks scope decisions |

## Critical Gap Plan

1. **Container frontend composition:** time-boxed discovery pair with Container domain + shell/platform + frontend before Refined Mockups approval; output must be contract and mount evidence, not a mock provider.
2. **Shared component decisions:** UI-platform office hours/review at each ordered design task; unmet needs become owned dependencies.
3. **Accessibility/state evidence:** designer, frontend, and accessibility engineer jointly review the state matrix before implementation.
4. **Canonical routing:** shell/auth and module engineers approve route registry, redirect, session, and return-context behavior.
5. **Live integrated evidence:** quality and SRE rehearse the isolated Compose tour before intent closure.

## Onboarding Checklist

- Read W4-01 Context Pack and approved Ideation artifacts.
- Load LinerCore `MASTER.md`, `SESSION-PROMPT.md`, and relevant page contract.
- Review W2-01 shell/Booking and W2-02 shared UI implementations.
- Review module provider/BFF contracts and known blocked capabilities.
- Confirm one-shell, `@erp/ui`, no-fork, and no-simulation constraints.
- Confirm canonical routes, Compose project naming, test data, and audit commands.
- Confirm decision owner and escalation path for the assigned slice.

## Skill Readiness Conclusion

No missing skill requires a new permanent team or external partner. The high-risk gaps are seam knowledge and review timing; focused pairing and early evidence are the appropriate remediation. Delivery Planning must convert role-level readiness into named assignments.

# Team Allocation — W2-02 Design-System Closure

## Planning Basis

Allocation follows `requirements.md`, `stories.md`, `mockups.md`, `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, and `team-practices.md`. It also retains the approved Ideation `mob-composition.md`: one Codex driver, AI-DLC navigators by stage, ui-ux-pro-max for UI-bearing work, quality/DevSecOps perspectives for evidence, and the user as decision owner.

## Bolt-to-Mob Assignment

| Bolt | Unit | Driver | Navigators/support | Decision owner |
|---|---|---|---|---|
| `booking-design-system-closure` | same name | Codex developer execution | Current AI-DLC lead; architect; design/ui-ux-pro-max; quality; DevSecOps; pipeline/operations personas when directed | User at every human gate |

There is one mob and one Bolt. No parallel implementation branch or additional execution agent is created unless a later engine directive explicitly requires it.

## Role Responsibilities

| Role | Responsibility |
|---|---|
| Driver | Make scoped file changes, run commands, preserve unrelated work, and maintain traceability/evidence. |
| Architect navigator | Protect component/package/service boundaries and validate the single-Unit dependency constraints. |
| Design/accessibility navigator | Apply MASTER/SESSION and refined interaction/accessibility specs; reject conflicting marketing guidance. |
| Quality navigator | Define regression and Playwright assertions, state setup, accessibility/manual checks, and evidence manifest coverage. |
| DevSecOps navigator | Validate lint/manifest/negative-gate behavior and prevent unsupported security/CI claims. |
| Pipeline/operations navigator | Ensure wrapper-only Compose, direct exit-status capture, demo safety, and audit ordering. |
| User/decision owner | Approve stage/phase gates, authorize any scope change, and make the final program closure decision. |

## Internal Handoffs

| From | To | Required handoff evidence |
|---|---|---|
| Characterization | Shared boundary | Confirmed gap inventory, focused failing tests/probes, protected path list |
| Shared boundary | Canonical UI | Exported/tested primitive contract and green anti-drift gate |
| Canonical UI | Focused quality | Changed-route map, semantic exception register, BFF compatibility summary |
| Focused quality | Live acceptance | Green targeted/static/build results and no worktree residue from probes |
| Live acceptance | Audits | Pre/post guards, Compose metadata, Playwright matrix, screenshots/traces, manifest |
| Audits | User/program owner | Green direct exit results, W1 truth check, proposed backlog evidence link |

## Collaboration Constraints

- One active work slice at a time where files/runtime overlap.
- Safe internal overlap is limited to read-only analysis or disjoint test/evidence scaffolding.
- `packages/ui`, shell Booking routes, and root acceptance config have explicit single-driver ownership during edits.
- No subagent independently mutates the shared implementation unless the engine explicitly delegates a bounded stage task.
- Human-gate rejection returns the same Bolt for revision; it does not create a second Bolt.

## Capacity and Escalation

No external human capacity is assumed. Local Docker/Bun/Node/Yarn/browser availability and existing service data are operational prerequisites, not new team allocations. If a missing authority or external system blocks the hard gate, preserve the failure and ask the user; never invent a PASS, cloud environment, external approval, or W1 reclassification.

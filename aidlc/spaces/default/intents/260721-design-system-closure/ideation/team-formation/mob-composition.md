# Mob Composition and Collaboration Plan

This plan applies the single vertical unit from intent-backlog.md within scope-document.md and feasibility-assessment.md.

## Composition

No standing human mob is required. The working ensemble is:

- **Driver:** Codex developer execution for file changes and commands.
- **Navigator:** Current AI-DLC lead persona, with support personas as the directive specifies.
- **UX/accessibility navigator:** ui-ux-pro-max plus the LinerCore MASTER/SESSION contract for UI-bearing work.
- **Quality navigator:** quality and DevSecOps perspectives during test, live evidence, and audit stages.
- **Decision owner:** user at all human gates.

## Collaboration Rules

- One active work slice at a time along the approved dependency path.
- Load specialist guidance before acting in its domain.
- Do not create parallel implementation branches or additional agents unless the AI-DLC directive explicitly requires them.
- Surface a blocker only after safe in-scope alternatives are exhausted.
- Preserve the shared worktree and unrelated user changes.

## Handoffs

| From | To | Required handoff |
|---|---|---|
| Discovery | Implementation | Confirmed gap list and protected paths |
| Shared package | Booking migration | Exported/tested primitive contract |
| Implementation | Quality | Changed-path summary and acceptance mapping |
| Quality | Live verification | Green static/focused checks |
| Live verification | Audits | Demo guard, Compose, Playwright, and screenshot evidence |
| Audits | Program owner | Green verdicts, waiver-truth check, backlog update |

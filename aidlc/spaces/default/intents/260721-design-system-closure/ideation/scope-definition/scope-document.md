# W2-02 Design-System Closure Scope

This scope is controlled by intent-statement.md, feasibility-assessment.md, and constraint-register.md.

## Objective

Turn the existing W2-02 design-system implementation into observed Definition-of-Done evidence without redesigning the platform or replacing the c2f13dd Wave A baseline.

## In Scope

- Confirm the exact remaining source and evidence gaps using graph-first discovery and targeted inspection.
- Complete only demonstrated shared token, primitive, export, style, or test gaps in packages/ui.
- Migrate applicable Booking list, create, and detail presentation elements to @erp/ui.
- Add the smallest reusable loading-state primitive if the preflight Skeleton gap is confirmed.
- Document and test any semantic exception where a native element is intentionally retained.
- Preserve one authenticated shell, navigation model, theme system, and frontend topology.
- Run focused package and Booking tests plus workspace lint, typecheck, test, and build checks in proportion to changed paths.
- Validate the lint prohibition with a negative probe for local CSSProperties and hard-coded hex values in application code.
- Run demo:guard before and after acceptance.
- Use scripts/wave-a-compose.mjs and only the linercore-wave-a Compose project for live verification.
- Capture Playwright evidence for agreed Booking routes, states, themes, responsive widths, keyboard/focus behavior, dialog behavior, and feedback.
- Run aidlc-audit and erp-fidelity-audit; retain durable outputs under artifacts/w2-02-live.
- Update the program backlog only after every gate is green.

## Out of Scope

- Resetting, replacing, or rebasing away the c2f13dd baseline.
- Changes owned by W0-01, W0-02, W1-01, W2-01, or other merged intents unless a minimal compatibility correction is required and explicitly traced.
- A second frontend, shell, navigation, or module-local theme.
- External design-system adoption, a hybrid replatform, generic component expansion, marketing/hero patterns, remote fonts, or dark-default redesign.
- Migration of Reference Data, Charge Agreements, Auth, Shell, or later-wave applications.
- New backend business behavior, API contracts, data processing, cloud infrastructure, or deployment topology.
- Rewriting the historical W1 blocked/waived live-proof record as PASS.
- Formal legal or accessibility certification claims.

## Acceptance Boundary

The unit closes only when package consumption, Booking behavior, static verification, isolated live proof, demo safety, Playwright evidence, and both audits are green together. A partial pass remains incomplete.

## Change Control

Any discovered work outside this boundary is logged as a follow-on item. It may enter this intent only if it is necessary to satisfy a named W2-02 DoD criterion and does not violate ownership or demo-safety constraints.

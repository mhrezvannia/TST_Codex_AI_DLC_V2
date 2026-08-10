# W2-02 Design-System Closure Initiative Brief

This brief synthesizes intent-statement.md, scope-document.md, intent-backlog.md, competitive-analysis.md, feasibility-assessment.md, constraint-register.md, team-assessment.md, and wireframes.md.

## Intent and Problem

W2-02 already has a shared UI package, master contract, shell, primitives, tests, and Booking application surfaces. It is not yet closed because Booking does not demonstrate comprehensive @erp/ui consumption and the required live accessibility, state, theme, responsive, Compose, and audit evidence is incomplete.

## Validation and Investment Case

External systems confirm that shared tokens/components and contextual accessibility testing are table-stakes, but replacing the existing foundation would add migration risk without closing a named gap. The justified investment is preserve-and-close: complete only demonstrated package and Booking gaps, then prove them live.

## Feasibility and Risk

The initiative is technically feasible in the existing Yarn/Turbo, React/TypeScript, Java-service, Playwright, and Docker Compose environment.

Primary controlled risks:

- primitive migration regression;
- an unconfirmed shared Skeleton gap;
- page-context accessibility defects missed by component tests;
- accidental interaction with the protected manager demo;
- incomplete or non-durable evidence.

Controls are incremental tests, explicit semantic exceptions, wave-a wrapper enforcement, demo:guard before/after, the full Playwright matrix, and both final audits.

## Scope Boundary

One vertical unit owns packages/ui, shared tokens/primitives, Booking reference migration, design-system master consistency, and closure evidence. It excludes other module migrations, new frontend/shell/navigation/theme work, external library adoption, infrastructure changes, new backend behavior, visual redesign, and any rewrite of the W1 blocked/waived record.

## Concept and User Journey

The existing Booking list, create, and detail routes remain inside the one authenticated shell. The flow is find or create, then inspect identity, status, lifecycle evidence, and permitted actions. Wireframes specify natural states, light/dark themes, keyboard/focus behavior, and layouts at 375, 768, 1024, and 1440px. Independent Product Lead review verdict: READY.

## Team and Decision Rights

Codex conducts and implements the dedicated closure stream. AI-DLC personas supply stage-specific product, design, architecture, quality, security, delivery, and operations perspectives. Explicit subagents are invoked only where the workflow mandates them. The user owns every human stage and phase gate.

## Delivery Outline

1. Reconfirm source/evidence gaps and protected ancestry.
2. Complete only demonstrated shared-package gaps.
3. Migrate applicable Booking surfaces and document exceptions.
4. Pass focused and workspace checks.
5. Guard the manager demo and validate linercore-wave-a.
6. Execute the live Playwright proof matrix.
7. Run aidlc-audit and erp-fidelity-audit.
8. Close the W2-02 program backlog without altering W1 truth.

## Recommendation

**GO within frozen scope.** Proceed to Inception to produce traceable requirements, reverse-engineered impact, one closure unit, and an evidence-first delivery plan. Any scope expansion requires a new explicit decision.

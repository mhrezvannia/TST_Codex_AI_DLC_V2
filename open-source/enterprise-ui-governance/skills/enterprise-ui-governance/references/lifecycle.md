# Lifecycle Integration

## Early exploration

Use design assistance for provisional task flow and information architecture.
Label outputs provisional. Do not freeze routes, APIs, permissions, or invented
states.

## Requirements and stories

Define testable business behavior, ownership, permissions, provider outcomes,
and pass/fail criteria. Write vertical outcome stories. Do not let attractive
mockups introduce requirements or replace acceptance criteria.

## Refined design

Run detailed design after requirements and stories are approved, before
application design and construction. Produce:

- task/route flows and refined desktop/mobile wireframes;
- binding interaction specification;
- accessibility checklist;
- shared-component and token mapping;
- complete state/recovery matrix;
- requirements/story traceability.

Require an explicit approval gate.

## Application design

Resolve routes, shell integration, component boundaries, view models, provider
contracts, authorization, caching/freshness, state ownership, and failure seams.
Return material UX changes to the refined-design gate.

## Construction

Implement approved behavior using the shared package. Keep design tools in
conformance mode. Test state transitions, keyboard/focus behavior, responsive
layouts, accessibility, and real provider degradation.

## Release and operation

Prove the integrated user workflow against real deployed services and honest
failure behavior. Screenshots, component tests, mocks, and container startup are
supporting evidence, not substitutes for integrated acceptance.

## Isolated AI workspaces

Prefer one program knowledge space with vertical intents and isolated worktrees.
Use separate long-lived spaces only for separate products or policy boundaries.
When separate spaces are unavoidable, inject the same versioned authority and
verify its version/hash before UI work begins.

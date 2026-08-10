# LinerCore Profile

Use this profile only inside the LinerCore repository.

## Required authorities

1. `AGENTS.md`
2. `design-system/linercore/MASTER.md`
3. `design-system/linercore/SESSION-PROMPT.md`
4. Active intent statement and Context Pack
5. Relevant `design-system/linercore/pages/*.md`
6. Reviewed `docs/ui-ux-design/*.md`
7. Approved intent Refined Mockups artifacts
8. `packages/ui/src/styles.ts` and `@erp/ui` exports

Use `docs/ui-ux-prompts/EXECUTION-GUIDE.md` for exact remaining-intent design
generation and handoff prompts.

## Ownership

- `apps/shell` owns authenticated shell, navigation, session presentation, and
  global chrome.
- `packages/ui` owns tokens and shared primitives.
- Domain applications own routed page composition and workflow.
- Spring services own domain facts/contracts, not frontend presentation.

Do not introduce a micro-frontend host, second canonical frontend, local theme,
duplicate navigation/auth, or per-service UI. Do not modify `packages/ui`, the
shell, or the master from a domain-owned intent; record the dependency for the UI
platform owner.

## Project-specific evidence

Verify 390, 768, 1024, and 1440 pixel layouts, WCAG AA behavior, shared state
patterns, Playwright journeys, visual evidence, live Compose behavior, and the
project audit gates. Treat generic UI/UX Pro Max output as advisory and reject
marketing, hero, alternate palette/font, dark-default, chart-first, and
spinner-first conflicts.

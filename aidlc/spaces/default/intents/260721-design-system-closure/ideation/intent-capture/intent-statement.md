<!-- BINDING TEMPLATE. The ## headings below are required (required-sections sensor). Fill each section; keep the headings. -->

# Intent Statement — W2-02 Design-System Closure

## Context Pack (read before starting)

1. `docs/intents/00-INTENT-BACKLOG.md` — program DAG, W2-02 acceptance-pending status, merge/exit protocol, and the immutable historical W1 waiver record.
2. `docs/aidlc-v2-slicing-playbook.md` — vertical-slice and observed-live completion rules.
3. `docs/intents/W2-02-design-system-foundation.md` — original W2-02 scope, ownership, and Definition of Done.
4. `artifacts/phase1-preflight-20260721/w2-02-closure-gap.md` — current verified passes and the exact unresolved closure blockers.
5. `docs/erp-business-ui-gap-analysis.md` Part 3.3 — source finding that originally motivated the design-system foundation.
6. `docs/enterprise-technical-environment.md` — binding frontend, atomic-design, skeleton, accessibility, and delivery standards.
7. `docs/program-vision-document.md` sections 3–5 and `docs/erp-workflow-map.md` — business journeys, module ownership, and shared-shell context.
8. `design-system/linercore/MASTER.md` and `design-system/linercore/SESSION-PROMPT.md` — binding LinerCore operational-console UI/UX contract.
9. `design-inputs/claude-ui-export/` — visual direction only; never business or implementation authority.
10. `aidlc/spaces/default/intents/260708-linercore-enterprise/inception/refined-mockups/interaction-spec.md`, `design-system-mapping.md`, and `accessibility-checklist.md` — refined interaction, component, and WCAG baseline.
11. `packages/ui/src/index.tsx`, `packages/ui/src/primitives.tsx`, `packages/ui/src/interactive.tsx`, and `packages/ui/src/styles.ts` — existing W2-02 package implementation to preserve and complete.
12. `apps/booking/` — existing Booking list/create/detail and lifecycle surfaces that form the reference migration target.
13. `scripts/wave-a-compose.mjs` and the repository audit/acceptance commands — the only authorized Wave A live-verification path.

## Intent

Close the acceptance gap on the already-delivered W2-02 foundation so a Booking operator can complete the existing authenticated create-to-confirm journey through one shared shell using accessible `@erp/ui` primitives, a frontend developer can treat Booking as the reference consumer of the shared package, and a release reviewer can reproduce the complete live evidence package. This is a focused completion of observed gaps, not a greenfield redesign or a replacement of the protected Wave A baseline.

## Vertical Slice Definition

The slice starts with the existing shared tokens and primitives, carries them through every applicable Booking list/create/detail/lifecycle surface, and proves the result in the live authenticated Booking journey. It includes implementation, route-state behavior, lint enforcement, and acceptance evidence in one unit so no layer can claim completion independently.

- **Layers cut through:** shared token/primitive package · Booking route composition · Booking BFF and existing backend journey · isolated Compose runtime · Playwright and audit evidence.
- **Thinnest viable form:** the current single Booking create-to-confirm reference journey and its existing list/detail surfaces, migrated to the existing primitive set with stable Skeleton loading and observable empty/error/denied states.
- **Explicitly deferred to later intents:** other module migrations and broad list/detail uplift (W4-01); new brand identity; a second frontend or module-local shell/theme/navigation; advanced data-grid virtualization and saved views; domain capabilities outside the existing Booking journey.

## In Scope / Out of Scope

**In scope**

- Preserve and finish `packages/ui` tokens, primitives, interaction components, and shared-shell integration only where the W2-02 closure requires it.
- Migrate every applicable Booking interactive, data-display, feedback, and loading surface to `@erp/ui`; document and test genuine semantic-HTML exceptions.
- Add stable shared Skeleton usage while retaining explicit loading, empty, error/retry, denied, validation, pending, success, and degraded behavior.
- Preserve one authenticated shell and canonical routes; keep the journey ribbon contextual.
- Retain the lint rejection gate for hardcoded hex and local `CSSProperties` style systems in `apps/**`.
- Produce reproducible isolated Compose, Playwright, accessibility, responsive, theme, test/build, and audit evidence.

**Out of scope**

- Rebuilding the design system, rebranding LinerCore, or replacing the existing W2-02 implementation.
- Migrating Charge, Container Movement, Reference Data, or other applications; W4-01 owns that breadth.
- Rewriting W0-01, W0-02, W1-01, W2-01, or their evidence and contracts.
- Reclassifying the historical W1 blocked/waived live-proof record as a pass. Any later real W1 pass remains separate evidence.
- Targeting, stopping, or reconfiguring the manager-demo `linercore-shared-platform` Compose project.

## Actors & Journey

- **Booking operator:** signs in through the existing shell, opens Booking, reviews the list, creates a booking using reference lookups, follows validation/pricing/confirmation feedback, and opens the resulting detail without losing keyboard focus or entered data.
- **Frontend developer:** composes the Booking routes from the shared package without introducing a local component library, palette, typography, shell, or navigation.
- **Quality/release reviewer:** runs the isolated acceptance sequence, inspects the evidence matrix, and verifies that live behavior—not source review or container startup alone—meets the W2-02 DoD.
- **Manager-demo owner:** retains uninterrupted access to `http://127.0.0.1:8088` before, during, and after Wave A acceptance.

Ordered journey: protect the manager demo → start the isolated `linercore-wave-a` stack through the authorized wrapper → authenticate → exercise Booking list/create/detail and create-to-confirm entirely by keyboard → inspect loading/empty/error/denied and both themes at the required viewports → run negative lint proof, tests, production build, and both audits → preserve the evidence and close W2-02.

## Cross-Module Seams (must be real)

W2-02 introduces no new business-module contract. Its owned seam is the real package boundary: `apps/booking` imports and renders `@erp/ui` tokens and primitives through the existing shared authenticated shell. Live acceptance must nevertheless traverse the already-integrated Booking BFF/backend/reference/pricing path; mocks or a standalone module port cannot substitute for the canonical edge route.

No producer/consumer contract is changed by this intent. If acceptance reveals a contract defect outside W2-02 ownership, record it without rewriting contributor modules. The historical W1 waiver evidence remains explicitly blocked/waived and must never be edited into a pass.

## Standards Alignment

- WCAG 2.1 AA for keyboard reachability, visible focus, labels, errors, live announcements, non-color state, reduced motion, and light/dark contrast.
- Strict TypeScript, Next.js App Router, shared-package-only imports, and the established LinerCore frontend standards.
- `@erp/ui` CSS-variable token vocabulary, IBM Plex Sans/system typography, Lucide icons, and one shared shell.
- Responsive verification at 375px, 768px, 1024px, and 1440px without page-level horizontal overflow or hidden primary actions.
- Existing Booking business vocabulary remains authoritative; this UI closure does not invent or rename DCSA, UN/LOCODE, ISO 6346, or cross-module wire fields.

## Definition of Done (observed, not "tests pass")

On the isolated `linercore-wave-a` Compose stack, with `npm run demo:guard` green before and after acceptance:

1. The canonical authenticated Booking routes render inside the one shared shell; no second frontend, local navigation, palette, or theme is introduced.
2. Every applicable Booking control, table/panel, status/feedback surface, and async loading state consumes `@erp/ui`; any raw semantic element exception is named, justified, and covered by a test.
3. Booking TSX has zero forbidden hardcoded hex colors and zero local `CSSProperties` style systems, and a non-writing negative probe proves that the lint gate rejects a newly introduced hex literal.
4. A keyboard-only Playwright walkthrough completes create → validate → price → confirm → detail with visible focus, correct announcements, preserved input on failure, and no inaccessible dead end.
5. Loading Skeleton, empty, error/retry, denied, validation, pending, success, and degraded states are visibly exercised against the running route or a controlled network condition.
6. Light and dark themes meet the project contrast gate; screenshots at 375, 768, 1024, and 1440px show no incoherent overlap, clipped controls, or page-level horizontal scrolling.
7. Relevant lint, typecheck, focused tests, production build, and live smoke checks pass without weakening existing gates.
8. A durable evidence package under `artifacts/w2-02-live/` records commands, environment/project names, screenshots, Playwright results, lint rejection, check outputs, and demo-guard results.
9. `aidlc-audit` and `erp-fidelity-audit` are green against this live run. Only then is W2-02 marked closed in `docs/intents/00-INTENT-BACKLOG.md` with the evidence path.

## Dependencies

- Protected starting point: Wave A baseline `c2f13dd`, based on `integ/main-reconciled` at `c96b5b3`; neither may be reset or replaced.
- Consumes the already-merged W0-01 eventing, W0-02 reference-data, W1-01 Booking journey, W2-01 shell/auth, and existing W2-02 package work.
- W1 history remains truthful: its historical blocked manifest and acceptance waiver are not a real pass and are never rewritten. Separate later observed evidence does not alter that record.
- W4-01 depends on this intent closing and remains out of scope until the live W2-02 gate is green.

## Suggested Scope & Sizing

`feature` at Standard depth. One focused vertical closure unit is preferred: migrate all applicable Booking surfaces and produce the full evidence matrix together. Splitting package adoption, route-state behavior, and live evidence into horizontal units would recreate the exact acceptance gap this intent exists to close.

## Open Questions

All Intent Capture decisions are resolved in `intent-capture-questions.md`:

1. Balance Booking operator usability, frontend-developer reuse, and release/audit evidence.
2. Migrate every applicable Booking surface to shared primitives, with documented semantic exceptions only.
3. Require the full live acceptance matrix.
4. Apply the binding authority order and make the smallest compliant correction.
5. Mark W2-02 closed only after durable evidence and every gate pass.

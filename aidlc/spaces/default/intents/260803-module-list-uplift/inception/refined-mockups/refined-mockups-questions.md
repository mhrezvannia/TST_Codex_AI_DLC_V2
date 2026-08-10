# Refined Mockups Questions — W4-01 Module List-Detail Uplift

## Upstream Sources

These answered questions refine the approved rough `wireframes.md` and `user-flow.md` using the approved Inception `stories.md`, `requirements.md`, and `team-practices.md`. The page-level design sequence remains Reference Data, Charge Agreements, then Container Journeys.

## Instructions

Choose one option for each question. The approved Requirements Analysis and User Stories remain binding; these questions refine presentation and interaction without expanding business scope. The three module designs will still run in the required order: Reference Data, Charge Agreements, then Container Journeys.

## Q1. Story-to-screen representation

How should the approved find, inspect, act, recover, and return stories be represented?

- A. Canonical routed task sequence (Recommended) — Separate list, stable detail, and dedicated create/edit/task routes where the workflow needs sustained input.
- B. List plus detail drawer — Keep most inspection and mutation inside a list-owned drawer.
- C. Single workbench — Keep list, detail, and form on one page.
- X. Other (please specify)

[Answer]: A. Canonical routed task sequence (Recommended)

## Q2. Interaction pattern

Which interaction hierarchy should govern the three modules?

- A. Full-page detail and focused task routes (Recommended) — Use route tabs, an action rail, dialogs only for concise confirmation, and progressive disclosure for technical evidence.
- B. Full-page detail with form drawers — Use drawers for create/edit/capture regardless of task length.
- C. Inline editing — Edit values directly in tables and detail facts.
- X. Other (please specify)

[Answer]: A. Full-page detail and focused task routes (Recommended)

## Q3. State coverage

How much state and recovery evidence should the refined designs specify?

- A. Complete applicable provider-truth matrix (Recommended) — Cover loading, true/filtered empty, populated, denied/read-only, not found, validation, pending, success, conflict/rejection, provider error, degraded, stale, partial, and recovery ownership.
- B. Primary plus common recovery — Cover loading, empty, populated, denied, validation, success, and error.
- C. Happy path first — Specify populated and success states now and defer recovery detail.
- X. Other (please specify)

[Answer]: A. Complete applicable provider-truth matrix (Recommended)

## Q4. Shared-component ownership

How should missing UI behavior be handled when current `@erp/ui` primitives are insufficient?

- A. Record a UI-platform dependency and keep evidence BLOCKED (Recommended) — Map existing primitives first; never create a domain-local replacement or modify `packages/ui` in W4-01.
- B. Create domain wrappers that duplicate the missing behavior temporarily.
- C. Add local primitives to each module and consolidate later.
- X. Other (please specify)

[Answer]: A. Record a UI-platform dependency and keep evidence BLOCKED (Recommended)

## Q5. Accessibility target

Which accessibility target should the design evidence use?

- A. WCAG 2.2 AA design target with the approved WCAG 2.1 AA acceptance baseline (Recommended) — Include persistent labels, linked errors, keyboard/focus behavior, async announcements, non-color meaning, reduced motion, and zoom/reflow evidence.
- B. WCAG 2.1 AA only — Limit design annotations to the approved baseline.
- C. Automated accessibility checks only — Defer manual keyboard and screen-reader evidence.
- X. Other (please specify)

[Answer]: A. WCAG 2.2 AA design target with the approved WCAG 2.1 AA acceptance baseline (Recommended)

## Q6. Responsive evidence

Which viewport and theme matrix should be binding?

- A. 375, 390, 768, 1024, and 1440 pixels in light and dark themes (Recommended) — Use semantic mobile records, labelled table overflow where needed, stacked rails at tablet widths, and dense desktop layouts without page-level overflow.
- B. 390, 768, and 1440 pixels in light theme only.
- C. Desktop-first design with mobile behavior deferred.
- X. Other (please specify)

[Answer]: A. 375, 390, 768, 1024, and 1440 pixels in light and dark themes (Recommended)

## Q7. Unsupported provider capabilities

How should controls whose provider or authorization contracts remain blocked be represented?

- A. Omit the controls and document owner/exit evidence (Recommended) — Do not simulate search, sort, pagination, lifecycle commands, D&D data, or cross-links; use an honest unavailable state only where the approved design reserves the region.
- B. Show disabled controls with “Coming soon” labels.
- C. Provide client-side temporary behavior until providers catch up.
- X. Other (please specify)

[Answer]: A. Omit the controls and document owner/exit evidence (Recommended)

## Answer Analysis

The answers are internally consistent and align with the approved Requirements Analysis, User Stories, LinerCore master, and enterprise UI-governance contract. They select canonical routed list/detail/task flows, complete provider-truth state coverage, platform ownership for shared gaps, a WCAG 2.2 AA design target over the approved WCAG 2.1 AA acceptance baseline, the full viewport/theme matrix, and honest omission of unsupported controls. No contradiction or unresolved product choice blocks design generation.

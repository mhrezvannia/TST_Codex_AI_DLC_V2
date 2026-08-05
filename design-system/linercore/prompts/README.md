# Remaining Phase 1 UI/UX Prompt Runbook

These prompts prepare the UI-bearing remainder of Phase 1 without replacing the
AI-DLC stage artifacts. Each intent prompt extends, but never duplicates or
overrides, `design-system/linercore/SESSION-PROMPT.md`.

## Execution point

Use the prompt at three controlled points:

1. **Ideation / Rough Mockups (1.6):** run the shared design-system query for
   early route, task-flow, and information-architecture options. Treat the
   output as provisional because requirements and stories are not final yet.
2. **Inception / Refined Mockups (2.5):** this is the primary execution point.
   After Requirements Analysis (2.3) and User Stories (2.4) are approved, park
   the main workflow before executing 2.5. Run and approve the design-only
   UI/UX Pro Max task, then resume 2.5 to produce the binding interaction spec,
   refined mockups, state matrix, responsive behavior, accessibility checklist,
   and design-system mapping.
3. **Construction / Code Generation and Build & Test (3.5-3.6):** rerun only
   the focused UX and stack searches as a conformance review. Do not redesign
   approved flows during construction without returning through the relevant
   Inception gate.

Do not wait until after Construction. At that point route structure, component
boundaries, API shapes, and acceptance tests are already expensive to change.
Do not finalize the design before Inception requirements and stories exist,
because that invites attractive but unsupported screens.

## Required order inside an intent

1. Load `design-system/linercore/MASTER.md`.
2. Load `design-system/linercore/SESSION-PROMPT.md` and use its text unchanged.
3. Load the active intent statement and every Context Pack item.
4. Load the page contracts named by the intent prompt.
5. Run the base `--design-system` query, then the focused `--domain` and
   `--stack nextjs` searches listed in the prompt.
6. Append the intent-specific prompt block to the shared session prompt.
7. Write outputs into the active intent's AI-DLC rough/refined-mockup folders.

Never use `--persist` in these sessions: the reviewed LinerCore master is
already authoritative, and generated persistence must not overwrite it.

## Prompt catalog

| Intent | Prompt | Page contracts |
|---|---|---|
| W3-01 | `W3-01-dnd-rules-and-rates.md` | `charge-and-agreements.md`, `dnd-rules-and-rates.md` |
| W3-04 | `W3-04-booking-request-completeness.md` | Master + approved Booking create/detail designs; `booking-request-completeness.md` is proposed only after W3-04 design approval |
| W3-02 | `W3-02-dnd-pricing-and-invoice.md` | `booking-charges-and-invoices.md` plus the W2-02 Booking refined mockups |
| W3-03 | `W3-03-booking-amendments.md` | approved W3-04 field baseline, `booking-amendments.md`, and the W2-02 Booking refined mockups |
| W4-01 | `W4-01-module-list-detail-uplift.md` | `reference-data.md`, `charge-and-agreements.md`, `container-movement.md`, and `dnd-rules-and-rates.md` when W3-01 is merged |
| W4-02 | `W4-02-operations-observability.md` | `operations-observability.md` |

## Skill-output decision record

Adopt data-dense layouts, labelled forms, on-blur validation, explicit command
feedback, responsive table handling, visible focus, keyboard order, non-color
status meaning, and line charts for time-series operational trends.

Reject the generated Enterprise Gateway/marketing composition, hero and sales
content, Fira/remote fonts, a replacement blue/amber palette, spinner-first
loading, bulk actions not present in an intent, animated streaming charts, and
new chart/component libraries when Grafana or existing `@erp/ui` primitives
already provide the required behavior.

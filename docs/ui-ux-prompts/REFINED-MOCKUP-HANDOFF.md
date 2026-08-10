# Refined Mockups Handoff

Use this after an intent-specific UI/UX Pro Max prompt has produced a design and
you have reviewed that design. This handoff converts the design document into
binding AI-DLC Refined Mockups artifacts; it does not implement production code.

## Output naming

Save each reviewed design using the prompt's basename:

| Prompt | Reviewed design |
|---|---|
| `18-dnd-rules-and-rates.md` | `docs/ui-ux-design/18-dnd-rules-and-rates.md` |
| `19-booking-charges-and-invoice.md` | `docs/ui-ux-design/19-booking-charges-and-invoice.md` |
| `25-booking-request-completeness.md` | `docs/ui-ux-design/25-booking-request-completeness.md` |
| `20-booking-amendments-reconfirmation.md` | `docs/ui-ux-design/20-booking-amendments-reconfirmation.md` |
| `21-reference-data-list-detail-uplift.md` | `docs/ui-ux-design/21-reference-data-list-detail-uplift.md` |
| `22-charge-agreements-list-detail-uplift.md` | `docs/ui-ux-design/22-charge-agreements-list-detail-uplift.md` |
| `23-container-journeys-list-detail-uplift.md` | `docs/ui-ux-design/23-container-journeys-list-detail-uplift.md` |
| `24-operations-observability.md` | `docs/ui-ux-design/24-operations-observability.md` |

## Copy/paste design-generation instruction

At the start of Refined Mockups, paste the numbered prompt and add this
instruction beneath it, replacing both bracketed values:

```text
Create the complete design requested above and write it to
docs/ui-ux-design/[DESIGN FILE].md. You may create or update design
documentation only; do not modify production code, routes, APIs, tests,
packages, or infrastructure. Treat this as a design candidate until I review
and approve it. Do not advance the AI-DLC stage yet.
```

Review the resulting file. Ask for corrections in that same file until it is
approved, then use the handoff below.

## Copy/paste handoff prompt

Replace the bracketed values, then give this prompt to the AI-DLC agent while
the active intent is at Inception Refined Mockups (2.5):

```text
$aidlc --stage refined-mockups

Use UI/UX Pro Max for conformance review and complete the Refined Mockups stage
for [INTENT ID AND NAME].

Load and treat these as required inputs:
1. The active intent statement and its complete Context Pack.
2. The approved Requirements Analysis and User Stories artifacts.
3. design-system/linercore/MASTER.md.
4. design-system/linercore/SESSION-PROMPT.md.
5. The relevant page contract(s) under design-system/linercore/pages/.
6. The reviewed design: docs/ui-ux-design/[DESIGN FILE].md.
7. aidlc/spaces/default/memory/templates/interaction-spec.md.

The reviewed design is approved page-level input, not permission to invent new
business capabilities, routes, APIs, roles, or states. Requirements and user
stories govern business scope; the LinerCore master governs the shared shell,
tokens, responsive behavior, and accessibility; the reviewed design governs the
page-specific interaction. If they conflict, stop and record the conflict for
review instead of silently choosing one.

Convert the reviewed design into the active intent record's binding Refined
Mockups artifacts, including:
- mockups.md with desktop/mobile refined wireframes and route/task flow;
- interaction-spec.md using the binding repository template;
- accessibility-checklist.md;
- design-system-mapping.md;
- a complete loading/empty/error/denied/pending/success/conflict/degraded state
  matrix;
- a traceability table from requirements and story acceptance criteria to the
  designed surfaces, actions, states, and evidence.

Reuse @erp/ui and the shared shell. Identify missing primitives but do not edit
packages/ui or production code in this stage. Preserve domain ownership and
authorization boundaries. Validate 390/768/1024/1440px behavior, keyboard/focus
order, async announcements, non-color status meaning, and no page-level mobile
overflow.

End with unresolved design or contract questions and request Refined Mockups
approval. Do not advance to Application Design or Construction until this gate
is approved.
```

## Authority during later stages

Application Design consumes the approved Refined Mockups artifacts and resolves
routes, component boundaries, provider contracts, and state ownership.
Construction consumes both approved Refined Mockups and Application Design. If
implementation reveals a material UX conflict, return to Refined Mockups rather
than editing the design ad hoc during Code Generation.

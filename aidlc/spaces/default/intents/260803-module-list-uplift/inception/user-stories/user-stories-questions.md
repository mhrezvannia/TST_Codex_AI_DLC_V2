# User Stories Plan and Questions — W4-01

## Planning Basis

The plan consumes the approved `requirements.md`, the W4 `business-overview.md` and `component-inventory.md`, and affirmed `team-practices.md`. It preserves the Reference → Charge → Container delivery order, the single LinerCore shell, shared tokens and `@erp/ui`, provider-owned capability truth, and every documented `BLOCKED` owner/exit condition.

## Q0. Interaction Mode

How should we complete the User Stories planning questions?

- A. Guided — answer structured choices in conversation. **(Recommended)**
- B. Self-guided — edit every `[Answer]:` field in this file.
- C. Chat — describe the desired story plan in your own words.
- X. Other (please specify).
- `[Answer]: A — Guided (Recommended)`

## Q1. Persona Development Approach

Which persona set should anchor the stories?

- A. Five operational personas: Reference Data Administrator, Pricing Analyst, Charge Reader, Container Operations User, and Booking Operations User. Permission variants stay explicit without creating an Identity-admin persona. **(Recommended)**
- B. Three module personas: merge read/write variants within Reference, Charge, and Container Movement stories.
- C. Four personas: three module personas plus one shared cross-module Operations persona.
- X. Other (please specify).
- `[Answer]: A — Five personas (Recommended)`

## Q2. Story Breakdown Approach

How should the story map be organized?

- A. Vertical workflow by domain: shared shell/access foundations, then Reference find/inspect/act, Charge find/inspect/act, Container find/inspect/capture, cross-links, and integrated evidence. **(Recommended)**
- B. By persona: group all outcomes for each persona, even when shared route/state foundations repeat.
- C. By technical feature: routes, lists, details, mutations, links, and quality evidence across all domains.
- X. Other (please specify).
- `[Answer]: A — Vertical workflow (Recommended)`

## Q3. Story Granularity

What granularity should the generated story set use?

- A. 14–16 small vertical stories, each independently valuable/testable and mapped to requirements; blocked contract exits remain explicit dependencies rather than implementation stories. **(Recommended)**
- B. 9–12 medium stories combining list/detail/action outcomes per module.
- C. 17–22 fine-grained stories separating most permission and failure variants.
- X. Other (please specify).
- `[Answer]: A — 14–16 small (Recommended)`

## Story Format and Prioritization

Every generated story will use `As a [persona], I want [goal], so that [benefit]`, Given/When/Then acceptance criteria, MoSCoW priority, requirement traceability, dependencies, and an INVEST assessment. Must Have covers the approved W4 vertical scope and blocking quality evidence; Should/Could are used only for approved non-essential behavior; out-of-scope behavior is recorded as Won't Have rather than smuggled into acceptance.

## Proposed Plan Summary

If all recommended answers are selected, the stage will define five personas and 14–16 stories organized as small domain-sequenced vertical workflows. Shared shell/access and integrated exit evidence appear once, while provider-specific states/actions remain in their owning module stories. The three exact UI/UX Pro Max prompt tasks remain deferred to the single Refined Mockups stage after this stage is approved.

# W4-01 UI/UX Pro Max Prompt — Module List/Detail Uplift

## Run at

Primary: Inception Refined Mockups (2.5), after the three module interaction
stories are approved. Run once for the shared repetition, then refine each module
unit in the approved order Reference Data → Charge → Container Movement.

## Inputs

- `design-system/linercore/MASTER.md`
- `design-system/linercore/SESSION-PROMPT.md`
- `design-system/linercore/pages/reference-data.md`
- `design-system/linercore/pages/charge-and-agreements.md`
- `design-system/linercore/pages/container-movement.md`
- `design-system/linercore/pages/dnd-rules-and-rates.md` when W3-01 is merged
- `docs/intents/W4-01-module-list-detail-uplift.md` and its complete Context Pack
- `aidlc/spaces/default/memory/templates/interaction-spec.md`

## Preflight finding

The intent Context Pack names `apps/container-movement`, but that directory was
absent in the repository during this coverage audit. Resolve the actual CMM UI
source/mount and ownership during Requirements Analysis before treating the CMM
refined mockup as implementation-binding. Do not invent a replacement route or
application merely to satisfy this prompt.

## Skill commands

```powershell
python .codex\skills\ui-ux-pro-max\scripts\search.py `
  "internal enterprise liner shipping ERP reference data agreements container journey list detail tables filters action rail cross links accessible" `
  --design-system -p "LinerCore W4-01 Module List Detail Uplift" -f markdown

python .codex\skills\ui-ux-pro-max\scripts\search.py `
  "enterprise master detail table filter sort pagination responsive accessibility" `
  --domain ux -n 10

python .codex\skills\ui-ux-pro-max\scripts\search.py `
  "server rendered list detail search params loading accessibility" `
  --stack nextjs
```

## Append this to the shared session prompt

```text
Active intent: W4-01 Module List-Detail Uplift.

Create one repeatable list→detail→action pattern, then apply it to Reference Data,
Charge Agreements, and Container Movement without erasing their domain-specific
contracts. Each list requires real server-driven search/filter/sort/pagination,
result count, stable row links, and loading/empty/error/denied/populated states.
Each detail requires identity/status, real relationship tabs, action rail,
lifecycle/history evidence, and canonical cross-module links.

Use the approved tab sets: Reference record Summary · Attributes · History;
Agreement Summary · Rates · D&D · Status history; Journey Summary · Movement
timeline · Linked booking. If W3-01 is not merged, do not fabricate D&D values;
design the real empty/unavailable state and keep the data seam explicit. Preserve
all valid old-workbench actions but do not add bulk actions, saved views, global
search, or new domain capabilities.

Produce one binding interaction spec per module using the repository template,
list/detail refined wireframes at four required widths, cross-link map, state
matrix, keyboard paths, accessibility checklist, and shared-vs-domain component
mapping. Explicitly identify and delete/redirect the obsolete workbench entrypoints
in the implementation plan.
```

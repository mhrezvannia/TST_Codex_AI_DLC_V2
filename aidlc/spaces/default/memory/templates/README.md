# AI-DLC v2 Template Overrides — LinerCore starter pack

These files are **binding templates**. Per the `required-sections` sensor, a file here named `<artifact>.md` (keyed by the output filename stem) becomes:

1. **the skeleton** the conductor fills when producing that artifact, and
2. **the required `##` heading-set** the sensor checks at the gate (`expected ⊆ output`).

So the produced shape and the checked shape cannot drift. To change a shape, edit the `##` headings here — it updates the skeleton and the gate together.

## What's in this pack and why

Each template encodes a quality gate that was missing in the first build (see `docs/aidlc-v2-slicing-playbook.md` and the review docs):

| Template | Enforces |
|---|---|
| `intent-statement.md` | The intent is a **vertical slice** with an **observed-working** done-condition — not a module or a layer. |
| `unit-of-work.md` | Units are **vertical increments** with **end-to-end Definitions of Done**; bans layer-only units and "no live proof" DoDs. |
| `domain-entities.md` | Entities use **canonical / DCSA field names**, typed value objects (not stringly-typed bags), and pass a **contract-fidelity** check against the published schema. |
| `interaction-spec.md` | UI is a **product** (shell, nav, list + detail routes, all states, real design system), not a workbench. |
| `requirements.md` | Requirements state **standards alignment (DCSA)** explicitly and define acceptance as **live behavior**. |

## Conventions

- **Open questions:** every artifact ends with `## Open Questions`, using `[Answer]:` tags and options **A–E + X (Other)** — the AI-DLC question convention. The file is the source of truth; guided/self-guided/chat flows converge on it.
- **Fidelity first:** where a field, event, or entity has a published contract (`contracts/`) or a DCSA equivalent, the contract name wins. Renaming is a defect.
- **Done = observed:** "tests pass" is never a Definition of Done on its own. The DoD names the behavior you drove on the real runtime and the state you verified.

Add more overrides as you learn — one per artifact stem you want to standardize.

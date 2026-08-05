# AI-DLC v2 Slicing & Documentation Playbook — LinerCore

> A senior-practitioner guide to *how to slice work into intents and units*, *what documents to produce*, and *where they live*. Written against your actual repo structure (4 intents, the 32-stage graph, the `memory/templates/` override mechanism). Read alongside [`codex-review-findings.md`](codex-review-findings.md), [`erp-business-ui-gap-analysis.md`](erp-business-ui-gap-analysis.md), and [`erp-workflow-map.md`](erp-workflow-map.md).

## TL;DR

Your documentation *coverage* is excellent — AI-DLC v2 produced the full artifact set for every intent. The problem is **how you sliced the work**, and it happened at two levels:

1. **Intents were sliced by module** (`shared-platform`, `charge-agreement`, `enterprise`) — horizontal.
2. **Units of Work within an intent were sliced by architectural layer** (U02 domain → U03 app-service → U04 persistence → U05 REST → U06 UI → U07 integration) — also horizontal.

Double-horizontal slicing means **the vertical thread that forces integration to be real is never pulled.** And because each unit's Definition of Done is layer-local ("domain tests pass," "API tests pass") — with `U10`'s DoD literally saying *"without requiring Kafka live proof"* — the facade/degenerate outcomes were **specified**, not accidental. The fix is not more documents. It is **vertical slicing + end-to-end Definitions of Done.**

---

## Part 1 — The two-layer mental model (this is the key idea)

You are conflating two different things that both produce documents. Separate them and everything clarifies.

| | **Domain Knowledge Base** | **Delivery Intents** |
|---|---|---|
| **What it is** | Durable understanding of the business & domain | Units of *delivery* that ship working software |
| **Organized by** | Bounded context / module | **Vertical capability / user journey** |
| **Stability** | Slow-changing; grows as you learn | One per slice; closed when shipped |
| **Examples** | "Booking ubiquitous language", "Context map", "Charge D&D rules", "DCSA field dictionary" | "Confirm one booking end-to-end", "Track a container journey" |
| **Lives in** | `aidlc/spaces/default/knowledge/` + `codekb/` (persists across intents) | `aidlc/spaces/default/intents/<id>/` |
| **Your mobs** | ✅ This is what your per-module teams should own | The slice cuts *across* modules; a mob contributes its context |

**Your per-module mobs gathering requirements and inter-module relations = correct, but it's Knowledge-Base work, not intent-boundary work.** Capture the module's domain deeply, once, as durable knowledge. Then slice *delivery intents vertically across* those modules. The module docs are the **reference**; the intent is the **thin end-to-end slice** that consumes them.

> The single biggest change: **stop making "the module" the unit of delivery.** A module is a unit of *ownership and knowledge*. A vertical journey is the unit of *delivery*.

---

## Part 2 — How to slice intents (vertical) — the heuristic

Slice an intent so it is a **thin, end-to-end, demonstrable increment of business value**. Test each candidate intent against this checklist (INVEST-for-AI-DLC):

- **V — Vertical:** cuts through every layer it needs (domain → persistence → API → UI → cross-module event) — never a single layer.
- **E — End-to-end demonstrable:** its Definition of Done is *"a user (or upstream system) can complete the journey and you observed it working on the real runtime"* — not "tests pass."
- **R — Real seams:** if it crosses a module boundary, the *real* contract fires (real event on a real broker, real API call), not a placeholder.
- **T — Thin:** the smallest slice that still delivers value. "Confirm a booking with ONE routing leg and ONE equipment line" before "multi-leg transshipment."
- **I — Independent-ish:** minimal ordering coupling to other in-flight intents; depends on *closed* intents' outputs (knowledge base), not on parallel ones.
- **C — Contract-true:** field names and shapes match the published contract/DCSA exactly (fidelity is part of done).
- **A — Auditable done:** exit gate = `aidlc-audit` + `erp-fidelity-audit` pass. An intent isn't `complete` until both are green against a live run.

If a candidate fails **V** or **E**, it's not an intent — it's a task inside one.

### Units of Work inside an intent — also vertical

Within construction, slice Units the same way. Keep the **walking skeleton** (U01) — it's correct — then make each subsequent unit a **thin vertical increment**, not a layer:

| ❌ Layer-based (what you did) | ✅ Vertical increment (do this) |
|---|---|
| U02 domain model | U02 "Create + read a draft booking end-to-end" (domain+db+api+ui, thinnest) |
| U03 application service | U03 "Validate a booking against reference data (live)" |
| U04 persistence | U04 "Price a booking via real Charge call" |
| U05 REST API | U05 "Confirm → emit real `booking.confirmed` event → CMM consumes it" |
| U06 UI workbench | (UI is built *within* each unit, not deferred to the end) |

Each unit's DoD: *"you drove this step in the running app/stack and saw the correct state change."*

---

## Part 3 — Proposed intent backlog for THIS practice project

Concrete vertical slices to replace the module-based intents. Ordered by dependency; each is its own intent (scope in parentheses).

1. **`booking-quote-to-cash-slice`** (feature) — the spine of Journey 1, thinnest form: create → validate (live reference) → price (live Charge) → confirm → **real event** → CMM opens journey → status event back → Booking shows it. One leg, one equipment line, DCSA-correct fields. *This is the reference pattern; build it first, for real.* Worked example: [`docs/examples/booking-quote-to-cash/`](examples/booking-quote-to-cash/).
2. **`app-shell-and-auth`** (feature) — one shell app, login gates it, session flows to modules, left-nav, first real List→Detail (Booking). Kills the `local-user` hardcode.
3. **`design-system-foundation`** (feature) — `@erp/ui` as real primitives + tokens; migrate Booking onto it.
4. **`container-journey-track-trace`** (feature) — CMM journey + DCSA T&T event model, customer-facing status.
5. **`dnd-pricing-and-invoice`** (feature) — D&D trigger → sync D&D pricing → invoice emission (closes Journey 1 to "cash").
6. **`reference-data-completeness`** (feature) — seed + model Vessel/Voyage, Equipment-type, Charge-code; tariff/surcharge in Charge.

Each later intent consumes the closed ones via the knowledge base. Don't start N+1 until N is audited-green on a live run.

---

## Part 4 — The document set (what to produce per intent, and where)

AI-DLC v2 already defines the full set — you don't invent documents, you fill the stage artifacts. Here's the map (✱ = highest-leverage, templated in Part 5).

**Ideation** (`ideation/`): `intent-statement.md`✱ + `stakeholder-map.md` · market-research (`market-trends`, `competitive-analysis`, `build-vs-buy`) · feasibility (`feasibility-assessment`, `constraint-register`, `raid-log`) · `rough-mockups/` (`user-flow`, `wireframes`) · `scope-definition/` (`scope-document`✱, `intent-backlog`) · team-formation · approval-handoff (`initiative-brief`, `decision-log`).

**Inception** (`inception/`): `requirements-analysis/requirements.md`✱ · `user-stories/` (`personas`, `stories`) · `application-design/` (`components`, `services`, `component-methods`, `component-dependency`, `decisions`) · `refined-mockups/` (`mockups`, `interaction-spec`✱, `design-system-mapping`, `accessibility-checklist`) · `practices-discovery/` (`team-practices`, `discovered-rules`) · `units-generation/` (`unit-of-work`✱, `unit-of-work-dependency` ← the DAG, `unit-of-work-story-map`) · `delivery-planning/` (`bolt-plan`, `team-allocation`, `external-dependency-map`, `risk-and-sequencing-rationale`).

**Construction** (`construction/U0N-.../`): per unit — `functional-design/` (`domain-entities`✱, `business-rules`, `business-logic-model`, `frontend-components`) · `nfr-requirements/` · `nfr-design/` · `infrastructure-design/` · `code-generation/` (`code-generation-plan`, `code-summary`).

**Operation** (`operation/`): deployment-pipeline · environment-provisioning · deployment-execution · observability-setup · incident-response · performance-validation · feedback-optimization. *(mvp scope skips this whole phase — promote to feature when the slice graduates.)*

**Verification** (`verification/`): `phase-check-{ideation,inception,construction}.md`.

**Knowledge Base** (persists across intents — treat as source of truth, keep current): `knowledge/` (author your domain dictionaries here) + `codekb/TST_Codex/` (`architecture`, `business-overview`, `component-inventory`, `technology-stack`, …).

### Folder conventions (recommendation)

- **Durable domain knowledge** → `aidlc/spaces/default/knowledge/<bounded-context>/` — e.g. `knowledge/booking/ubiquitous-language.md`, `knowledge/shared/context-map.md`, `knowledge/shared/dcsa-field-dictionary.md`. This is what your mobs maintain; it outlives any intent.
- **Per-intent work** → `aidlc/spaces/default/intents/<yymmdd-slug>/` — leave to the AI-DLC engine's stage graph; don't hand-carve.
- **Cross-cutting standards** (contracts, DCSA schemas) → keep in `contracts/` and reference from knowledge, so there's one copy.
- **Human-facing analysis/guides** (like this file) → `docs/`.

---

## Part 5 — Templates (native mechanism) and how to use them

AI-DLC v2 has a **first-class template override**: drop `aidlc/spaces/default/memory/templates/<artifact>.md` (keyed by output filename stem). That one file becomes **both** the skeleton the agent fills **and** the required heading-set the `required-sections` sensor enforces — so the produced shape and checked shape cannot drift.

I've authored a high-leverage starter pack there (see [`aidlc/spaces/default/memory/templates/README.md`](../aidlc/spaces/default/memory/templates/README.md)). Each bakes in the quality gate that was missing:

| Template | Bakes in the fix for |
|---|---|
| `intent-statement.md` | Forces a **vertical slice** + **observed-working done-condition** |
| `unit-of-work.md` | Forbids layer-only units; requires **end-to-end DoD** per unit |
| `domain-entities.md` | Requires **canonical/DCSA field names** + a **contract-fidelity** section |
| `interaction-spec.md` | Requires shell/nav, **list+detail routes**, all states, real design-system usage |
| `requirements.md` | Requires explicit **standards alignment (DCSA)** + acceptance = live behavior |

Questions inside any artifact use the AI-DLC convention: a `## Open Questions` section with `[Answer]:` and options **A–E + X (Other)**, so the file stays the source of truth and the guided/self-guided/chat flows all converge on it.

**To adopt:** the files are already in place; the next AI-DLC run for a templated artifact will fill *these* shapes and the sensor will hold them. To tune a shape, edit the template's `##` headings — that updates both the skeleton and the gate at once.

---

## Part 6 — Answering your direct questions

- **"Ignore doc phasing / build the whole business at once?"** No. Big-bang enterprise is exactly what produced the degenerate result. Phasing = a *sequence of vertical intents*, not one giant run.
- **"Run AI-DLC from scratch for a new feature/module?"** Never from scratch. **New intent**, appropriate scope, inheriting the persistent knowledge base. New feature → `feature`/`bugfix`. New module → `feature`/`enterprise`, constrained by the existing context map.
- **"Is our slicing good?"** The *documentation discipline* is good. The *slicing* is the problem: switch from module/layer (horizontal) to journey/increment (vertical), and make every Definition of Done an observed end-to-end behavior.
- **"Templates & where to folder them?"** Provided natively in `memory/templates/`; durable domain docs in `knowledge/<context>/`; intents left to the engine; human guides in `docs/`.

---

*The through-line of all three reviews: AI-DLC v2's machinery is sound and its document coverage is thorough. Every failure — facade events, degenerate domain, workbench UI — traces to **horizontal slicing with layer-local Definitions of Done**. Slice vertically, define done as observed-working, and gate every intent with `aidlc-audit` + `erp-fidelity-audit`.*

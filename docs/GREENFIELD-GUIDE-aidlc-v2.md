# Building a 3-Module ERP from Scratch with AI-DLC v2 — an A-to-Z Guide

*Everything we learned from the practice project, turned into a repeatable method. If you started the real liner-shipping ERP (Charge, Booking, Container Movement + Shared Platform) today, this is how you would do it — the steps, the documents, the templates, and the guardrails that prevent the failures we already hit.*

> Read the companion [`RETROSPECTIVE-linercore-aidlc-codex.md`](RETROSPECTIVE-linercore-aidlc-codex.md) for *why* each rule exists. This guide is the *how*.

---

## 0. The five golden rules (read these first; everything else serves them)

1. **Slice vertically.** Deliver thin end-to-end journeys, never architectural layers or whole modules at once.
2. **"Done" = observed on the live system.** Never "tests pass." Name the behaviour you drove and the result you saw.
3. **No placeholders in real paths.** A capability backed only by a stub is not built. Fail startup if a stub is active outside local mode.
4. **Gates execute what they claim.** "The file exists" is a linter; "the service behaves" is a test. Never confuse them.
5. **Contracts and standards (DCSA) are the internal language, from line one.** Canonical names as typed value objects, bound to code by executable tests.

Every step below is an application of these five.

---

## 1. The mental model: two layers, never confused

| Domain Knowledge Base | Delivery Intents |
|---|---|
| *What the business is* | *What we ship* |
| Organised **by module / bounded context** | Organised **by vertical journey** |
| Durable; grows and is maintained forever | One per slice; closed when its journey works |
| Owned by the module team (the "mob") | Has one **Driver** team; other modules **Contribute** via contracts |
| Lives in `knowledge/<context>/` + code KB | Lives in `intents/<id>/` |

**Modules own knowledge and code. Journeys own delivery.** Your per-module teams gather and maintain the knowledge base; delivery is sliced as vertical intents that cut *across* those modules and consume the knowledge. Keeping these separate is the single most important structural decision — conflating them (making "the module" the unit of delivery) is what produced module-shaped, never-integrated software last time.

---

## 2. Phase 0 — Foundations before any code (do this once)

Nothing ships in Phase 0; it creates the stable ground every intent stands on. Skipping it is how ad-hoc names and fake events creep in.

### 2.1 Author the enterprise-level documents (the "north star")

These are program-wide and slow-changing. Produce them before slicing intents:

| Document | Purpose | Template |
|---|---|---|
| **Program Vision** | The business, the capability map, the user journeys, the module decomposition, the canonical data ownership, the integration contracts (names only). | §7 `program-vision` |
| **Enterprise Technical Environment** | The mandated stack, cross-cutting standards (event envelope, tracing, security), the standards you conform to (DCSA, UN/LOCODE, ISO 6346). | §7 `enterprise-tech-env` |
| **Context Map** | The DDD relationships between modules (who is upstream/downstream, which seams are events vs. sync, where anti-corruption layers sit). | §7 `context-map` |

### 2.2 Build the Domain Knowledge Base (per module)

For **each** bounded context, the owning team authors durable knowledge — this is the "requirements gathering" your mobs do, captured as reference, not as intent boundaries:

- **Ubiquitous language** — the domain terms, defined once, each mapped to its standard (e.g. "port = UN/LOCODE `loadUnLocode`"). Template §7 `ubiquitous-language`.
- **Business rules & invariants** — what must always be true.
- **Owned entities & their real shape** — the aggregates, modelled honestly (arrays of legs, lists of equipment — never flattened).
- **Inter-module relationships** — which other contexts it depends on and via which contract.

### 2.3 Freeze the standards decision

Decide, explicitly and up front, that **DCSA / UN/LOCODE / ISO 6346 are the internal model**, not an export format. Write the canonical field dictionary (`knowledge/shared/dcsa-field-dictionary.md`) that every later intent references. Retrofitting a standard later costs far more than adopting it now.

### 2.4 Stand up the walking skeleton + the seam infrastructure

Before feature work, one tiny end-to-end path must run on the real stack: a request UI → API → domain → database → **a real event on a real broker** → a consumer. This proves the *plumbing* (including Kafka + Schema Registry + the outbox relay + a scheduler) is real. Everything after builds on proven ground, so no feature intent ever has to fake a seam.

> **Phase-0 exit check:** the enterprise docs exist; each module has a knowledge-base entry; the standards dictionary exists; and one trivial event flows end-to-end on the live stack, audited green. Only now do you slice feature intents.

---

## 3. The delivery loop — how one intent flows, stage by stage

Each intent runs through the AI-DLC stages. Below is the artifact set per stage and which are highest-leverage (★ = has a binding template; the template is both the skeleton the AI fills and the shape the gate checks).

### Ideation — *understand the slice*
- ★ `intent-statement` — the vertical slice, its journey, its **Context Pack** (exact docs to read), and its observed-behaviour Definition of Done.
- `stakeholder-map`, `feasibility-assessment`, `constraint-register`, `scope-document`.

### Inception — *design the slice*
- ★ `requirements` — functional requirements + **standards alignment** + acceptance as live behaviour.
- `personas`, `stories` — the user's view.
- `application-design` (`components`, `services`, `decisions`) — how it fits the architecture.
- ★ `domain-entities` — the aggregate's **real shape** with **canonical/DCSA field names** and a **contract-fidelity** check.
- ★ `interaction-spec` — the UI: shell placement, **list + detail routes**, all states, real design-system usage.
- ★ `unit-of-work` — the **vertical** units (never layers) and the machine-readable dependency graph.
- `bolt-plan`, `team-allocation` — sequencing and ownership.

### Construction — *build the slice, unit by unit*
Per vertical unit: `functional-design`, `nfr-requirements`, `nfr-design`, `code-generation-plan` → **code** → `code-summary`. Each unit's DoD is observed behaviour on the running stack.

### Operation — *run the slice* (for graduated/`feature`+ scopes)
`deployment-pipeline`, `observability-setup` (tracing + dashboards + alerts), `incident-response`, `performance-validation`.

### Verification — *prove the phase*
`phase-check-{ideation,inception,construction}` — and the **exit gate: both audits green on a live run.**

> The knowledge base and binding templates are auto-loaded by the engine; the intent statement's Context Pack tells the AI which specific docs to read. You do not prompt the AI with the domain each time — the structure carries it.

---

## 4. Slicing rules (the heart of the method)

### Intents — vertical journeys (INVEST)
- **V**ertical — cuts every layer it needs (UI → API → domain → DB → event).
- **E**nd-to-end demonstrable — DoD is a journey observed live.
- **R**eal seams — cross-module boundaries fire real events/calls, not stubs.
- **T**hin — the smallest slice that still delivers value (one leg, one equipment line, one currency first).
- **I**ndependent-ish — depends only on *closed* intents.
- **C**ontract-true — canonical/DCSA names, zero drift.
- **A**uditable done — exits through both audits.

If a candidate fails **V** or **E**, it is a task *inside* an intent, not an intent.

### Units of Work — vertical increments, not layers
Keep a walking-skeleton unit first, then each unit is a thin capability through all its layers. Contrast:

| ❌ Layer-based (what failed) | ✅ Vertical increment (do this) |
|---|---|
| U02 domain, U03 app-service, U04 persistence, U05 API, U06 UI | U02 "create + read a booking end-to-end", U03 "validate live", U04 "price live", U05 "confirm → real event → consumer opens journey" |

UI is built *within* each unit, never deferred to a final "UI unit."

---

## 5. Teams, parallelism, and dependencies

### Ownership: one Driver, many Contributors
Every intent has exactly one **Driver team** — accountable end-to-end, owns the branch and merge. When a vertical intent crosses modules, the other module teams are **Contributors**, and the interface between them is **always the contract**, never shared code editing. Enforce with:
- **CODEOWNERS** per `services/<x>` and `apps/<x>` — a Driver never merges foreign-module code without the owner's review.
- **`contracts/` as an append-only shared kernel** — changed only with producer + consumer dual sign-off.

### Two layers of parallelism ("swarm")
- **Inside an intent:** the units' dependency graph is compiled into a parallel fan-out — independent units run simultaneously in the session.
- **Across intents:** separate teams run separate sessions on separate branches for intents with no shared dependency and disjoint code hotspots. Merge in dependency order, each behind the audits. Plan in **waves**: everything unblocked in a wave runs at once.

### Cross-intent dependencies
A dependency may only target a **closed** intent. If it can't:
1. **Resequence** — move the needed work earlier.
2. **Split a precursor** — extract just the needed piece into a small intent that closes first.
3. **Contract-first bridge** — freeze the contract now (both teams sign); the consumer builds against it with a stub; integrate live when the provider lands; the consumer's intent stays open until that live integration is observed.

Never build against an unfrozen contract — that is how silent field-name drift happens.

---

## 6. Quality gates & Definition of Done (non-negotiable)

An intent is **done** only when, **on the live stack**:
1. Its journey runs end-to-end and you *observed* each state change.
2. Every cross-module seam fired for real (real event on the broker / real API call).
3. Field names and shapes match the contract/DCSA exactly.
4. The UI path works (shell, list, detail, states) with a real session.
5. **Both audits pass:** runtime-integrity (real events, drained outbox, real gates) and fidelity (domain matches spec, DCSA present, product-grade UI).

Make these a **hard CI gate**, not a human checklist — a human-only checklist is precisely how the first build shipped facades.

---

## 7. The templates

The binding templates already live in `aidlc/spaces/default/memory/templates/` (each is simultaneously the AI's skeleton and the gate's required shape). The core set:

- `intent-statement.md` — vertical slice + Context Pack + observed DoD.
- `unit-of-work.md` — vertical units + dependency graph + end-to-end DoD.
- `domain-entities.md` — canonical/DCSA names + contract-fidelity check.
- `interaction-spec.md` — shell + list/detail + states + design system.
- `requirements.md` — standards alignment + live-behaviour acceptance.

Below are the **additional Phase-0 templates** this guide adds (author these into `knowledge/` and the enterprise docs). Copy each `## …` skeleton and fill it.

### 7.1 `ubiquitous-language.md` (per module, in `knowledge/<context>/`)

```markdown
# Ubiquitous Language — <context>
## Terms
| Term | Definition | Standard / canonical name | Notes |
## Aggregates & Value Objects
<each aggregate, its identity, the VOs it composes — modelled honestly, no flattening>
## Do-Not-Use / Ambiguous Terms
<words to avoid and the approved term instead>
## Open Questions
- `[Answer]:`
```

### 7.2 `context-map.md` (in `knowledge/shared/`)

```markdown
# Context Map
## Contexts
<each bounded context, one line>
## Relationships
| Upstream → Downstream | Pattern (OHS/PL/ACL/Conformist/C-S) | Sync or Event | Contract name |
## External Seams
<external systems and the ACL/OHS that guards each>
## Invariants of the Map
<rules: e.g. "CMM never talks to Charge directly">
## Open Questions
- `[Answer]:`
```

### 7.3 `dcsa-field-dictionary.md` (in `knowledge/shared/`)

```markdown
# DCSA / Standards Field Dictionary
## Identifiers
| Concept | Canonical field | Standard | Format/validation |
| Port | unLocode | UN/LOCODE | 5 chars |
| Container no. | equipmentReference | ISO 6346 | ISO check digit |
| Equipment type | equipmentTypeCode | ISO 6346 / DCSA | e.g. 22G1, 45G1 |
| Booking key | carrierBookingReference (+ bookingRevision) | DCSA Booking | |
## Event Vocabulary
| Concept | Field | Values | Standard |
| Move type | equipmentEventTypeCode | LOAD/DISC/GTIN/GTOT/STUF/STRP | DCSA T&T |
| Certainty | eventClassifierCode | PLN/EST/ACT | DCSA T&T |
| Laden/empty | emptyIndicatorCode | EMPTY/LADEN | DCSA T&T |
## Rule
These names are used in the domain AND on the wire. Renaming is a defect.
## Open Questions
- `[Answer]:`
```

### 7.4 `program-vision.md` and `enterprise-tech-env.md`

For these, reuse the structure already proven in the practice project (`program-vision-document.md` §1–§10 and `enterprise-technical-environment.md`) — they were the *strongest* artifacts produced and are worth keeping as the template. Key required sections: Vision → Capability Map → User Journeys → Module Decomposition → Context Map → Canonical Data Ownership → Integration Contracts (for the vision); and Stack → Cross-cutting standards (envelope, tracing, security) → Standards conformance (DCSA) → Module packaging → Observability (for the tech-env).

### 7.5 `phase-0-checklist.md` (foundations gate)

```markdown
# Phase 0 Foundations Checklist
- [ ] Program Vision authored (capability map, journeys, module decomposition, canonical data, contract names)
- [ ] Enterprise Tech-Env authored (stack, envelope, tracing, security, DCSA conformance)
- [ ] Context Map authored (DDD relationships, external ACLs)
- [ ] Each module has a knowledge-base entry (ubiquitous language, business rules, owned entities)
- [ ] DCSA / standards field dictionary authored
- [ ] Contracts folder created; naming + versioning + sign-off policy agreed
- [ ] Walking skeleton runs one real event end-to-end on the live stack (audited green)
- [ ] CODEOWNERS + branch/merge policy agreed
- [ ] Both audit tools wired into CI as hard exit gates
```

---

## 8. A concrete A-to-Z sequence for the 3-module project from scratch

> **This sequence is already instantiated as a living backlog:** [`docs/intents/00-INTENT-BACKLOG.md`](intents/00-INTENT-BACKLOG.md) holds the full program DAG, the wave/parallel plan, the ownership model, and a written **intent statement** for every intent below (W0-01 … W4-02, plus Phase-2 stubs), each with its Context Pack, seams, Definition of Done, and answered decisions. Use that file as the executable plan; the waves below are its summary.

The order that keeps every intent honest (each ships a working vertical slice; nothing waits on a big-bang):

**Wave 0 — Foundations (parallel):**
- *Enterprise docs + knowledge base + standards dictionary* (Phase 0).
- *Platform eventing foundation* — real broker + Schema Registry + outbox relay + scheduler; walking skeleton event end-to-end.
- *Reference-data completeness* — every canonical entity (customers, ports, currencies, equipment types, **vessels/voyages**) seeded and servable.
- *Design-system foundation* — real UI primitives + tokens (no inline styling).

**Wave 1 — The commercial spine:**
- *Booking quote-to-cash (thin)* — create → validate (live reference) → price (live Charge) → confirm → **real event** → Container Movement opens a journey → status event back → booking **detail page** renders it. *This is the reference pattern; build it for real first.*
- *App shell + auth* — one login, one shell, session flows to modules; kill hardcoded users.

**Wave 2 — Depth per module (parallel):**
- *Charge tariffs & agreements* — real pricing math.
- *Container journey & track-trace* — DCSA event model, journey detail.

**Wave 3 — Close the money loop & change:**
- *D&D rules & rates* → *D&D pricing & invoice* — the "cash" end of quote-to-cash.
- *Booking request completeness* — the typed FCL-dry party/cargo/schedule/equipment-quantity baseline; may run beside D&D rules.
- *Booking amendments* — revision/re-confirmation semantics, after Booking request completeness closes.

**Wave 4 — Product polish & operability:**
- *Module list-detail uplift* — the remaining modules to product-grade UI.
- *Operations & observability* — tracing, dashboards, alerts, runbooks.

Then Phase 2 (EDI intake, public DCSA API, cancellation) and Phase 3 (multi-entity, Bill of Lading) as later intents.

Each wave's intents that share no dependency run in parallel across teams; each intent exits through both audits on a live run before it merges.

---

## 9. Anti-patterns cheat sheet (print this)

| If you catch yourself… | …stop. Do this instead. |
|---|---|
| Making "the module" an intent | Slice a vertical journey across modules |
| Making "the layer" a unit | Slice a thin vertical increment |
| Writing "domain tests pass" as DoD | Write the live behaviour you'll observe |
| Wiring a `Placeholder`/`Noop` adapter into a real path | Implement the real one; stub only in explicit local mode |
| Calling an existence check "verification" | Execute the behaviour, or rename the gate |
| Inventing a field name | Use the canonical/DCSA name from the dictionary |
| Deferring UI to a final "UI unit" | Build UI inside each vertical unit |
| Hiding real fields in an `attributes`/`metadata` bag | Model them as typed value objects |
| Trusting a green build | Distrust it; verify the highest-risk seam live |
| Building against an unfrozen contract | Freeze it first, both teams sign |

---

## 10. Kickoff checklist for day one

1. Complete **Phase 0** (§2) and pass its checklist (§7.5). No feature intent starts until the walking skeleton flows a real event live.
2. Create the **program intent backlog** — one queue of vertical intents with a dependency graph and wave plan (not per-module backlogs). *(For the liner project this already exists: [`docs/intents/00-INTENT-BACKLOG.md`](intents/00-INTENT-BACKLOG.md).)*
3. Assign each intent **one Driver team**; set CODEOWNERS and the contract sign-off policy.
4. Wire **both audits as hard CI gates** and make "live run + audits green" the merge condition.
5. Start **Wave 0 in parallel**; do not begin Wave 1's spine until the eventing foundation is real.
6. For each intent: fill the `intent-statement` (with its Context Pack), let the stages run, and **close it only when its journey is observed working on the live stack.**

---

*The whole method reduces to one habit: **ship thin vertical slices whose "done" is behaviour you watched happen on the real system, built on canonical/DCSA names and real seams, gated by audits you don't trust the build without.** Do that, and the same AI that produced a facade last time produces working software this time.*

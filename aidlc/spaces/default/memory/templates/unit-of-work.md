<!-- BINDING TEMPLATE. Keep the ## headings (required-sections sensor). This template enforces VERTICAL units with end-to-end DoDs. -->

# Units of Work — <intent name>

## Source Alignment

<Which inception artifacts these units consume: components.md, services.md, requirements.md, stories.md, domain-entities.md, the relevant contracts, and the knowledge-base entries.>

## Slicing Rule (do not remove)

Units are **vertical increments**, not architectural layers. Each unit (after the walking skeleton) must move one thin capability through **every layer it needs** (UI → API → domain → persistence → any cross-module seam) and its Definition of Done must be an **observed end-to-end behavior on the running stack** — never "layer X tests pass," and never "without live proof." A unit whose DoD can be met without running the app is mis-sliced; re-slice it.

## Units

<Table. U01 is the walking skeleton (thin end-to-end placeholder path). Every later unit is a vertical increment. DoD column must describe observed behavior.>

| Unit | Name | Vertical scope (layers it cuts) | Definition of Done (observed on live stack) |
| --- | --- | --- | --- |
| U01 | Walking skeleton | UI→API→domain→db, trivial path | On the running stack, one request flows UI→service→DB and returns; health green. |
| U02 | <thin capability #1> | UI·API·domain·db | <e.g. "Create + read a draft booking in the running app; row persisted; detail page renders it."> |
| U0N | … | … | … |

## Cross-Module Seams In This Intent

<For any unit that crosses a module boundary: the contract name, the real mechanism (event on broker / API call), and the requirement that the seam is exercised live in that unit's DoD. No placeholder publishers/adapters may satisfy a DoD.>

## Dependency DAG

<Author the machine-readable units DAG here as the fenced ```yaml units:``` edge block (the required-sections sensor checks it is present, well-formed, and cycle-free for unit-of-work-dependency.md). Keep edges minimal and acyclic.>

## Exit Gate

Intent is not `complete` until the full vertical path across all units has been driven on the real runtime AND `aidlc-audit` + `erp-fidelity-audit` are green. Record the evidence path.

## Open Questions

1. Is U01's walking-skeleton path the right thinnest end-to-end route?
   - A. Yes (recommended)
   - B. Narrow it further
   - C. Widen it
   - X. Other
   - `[Answer]:`

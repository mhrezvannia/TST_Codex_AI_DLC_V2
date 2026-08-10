---
name: erp-fidelity-audit
description: Audit an AI-generated (Codex/AI-DLC) domain application for FIDELITY to its own specs — does the domain model, field naming, standards alignment (e.g. DCSA), and UI actually match what the vision/contract docs promised, or is it a generic CRUD skeleton wearing the domain's vocabulary? Use after a build cycle when "it compiles and tests pass but it isn't really the product." Complements aidlc-audit (which checks runtime integrity); this checks whether the right thing was built at all.
---

# ERP / Domain Fidelity Audit

AI code generators reliably produce a clean, well-layered **generic skeleton** and then *label* it with the target domain's words. The result compiles, passes tests, and looks plausible — but the aggregate is the wrong shape, the field names silently diverge from the contracts, the industry standard is in the docs but not the code, and the UI is a developer workbench rather than a product. This skill catches that. It pairs with `aidlc-audit` (runtime integrity); run both.

Distilled from the LinerCore review — see `docs/erp-business-ui-gap-analysis.md` and `docs/erp-workflow-map.md` for a worked example.

**Core principle: the docs are the spec, the code is the claim — diff them.** A green build says the code is internally consistent, not that it built what the vision/contracts describe.

## When to run

- After any Codex/AI-DLC domain build, before declaring it "useful/working."
- Before promoting a practice/prototype to a real project.
- Whenever the vocabulary looks right but the thing "doesn't feel like the real product."

## Procedure

Run detectors, then the six fidelity checks. Report by layer (domain / contracts / standards / data / UI) with `file:line` evidence and the doc reference each violates.

### Step 1 — Detectors

```bash
bash .claude/skills/erp-fidelity-audit/detectors.sh
```

Flags: aggregate fields vs. contract fields, field-name drift, stringly-typed `attributes`/`metadata` bags, standard (DCSA/etc.) present in docs but absent in code, missing detail routes, inline-style/hardcoded-color UI, single-file design systems, hardcoded auth users, and named capabilities that are zero in code.

### Step 2 — The six fidelity checks

Pass condition is **conformance to the spec**, not internal consistency.

1. **Aggregate shape parity.** Take each core aggregate's authoritative contract/schema (the `.avsc`, OpenAPI, or the vision's canonical-data section). List its fields. Open the domain record. Do they match in *structure* (arrays vs. scalars, nested value objects vs. flat strings)? A contract with `routing[]`/`equipment[]` arrays implemented as flat `originId`/`equipmentType` strings is a **degenerate model** — the top finding, because every layer above inherits it.

2. **Field-name fidelity.** Build a name map: canonical name (contract) → name in domain → name in the wire payload → name in UI. Every hop that renames is a defect; the code disagreeing *with itself* (e.g. `equipmentTypeCode` in schema, `equipmentTypeId` in the emitter) is worse. Names are the interface in a contract-first system.

3. **Stringly-typed escape hatches.** Search for `Map<String,String> attributes`, `metadata`, `Record<string,string>` bags. Real domain fields hidden in these (container numbers, dates, statuses) are missing model, not present model. Count them as gaps.

4. **Standards alignment (DCSA or industry equivalent).** Grep the standard's name/vocabulary in docs, then in code. Present in docs + absent in code = the standard is aspirational only. For a system that may go commercial, standard identifiers (UN/LOCODE, ISO 6346, DCSA event codes) belong in the domain as typed value objects *now*; retrofitting is far costlier.

5. **Capability presence.** Extract the "owned capabilities" list from the vision per module. For each, grep the codebase. Zero hits for a named core capability (invoice, capacity, tariff, track-and-trace) = missing capability, regardless of green tests. Also check reference/seed data covers every canonical entity the flows validate against.

6. **Product vs. workbench UI (senior-designer lens).** Check for: an app shell + navigation (not N disconnected single-page apps); login actually wired into business screens (no hardcoded `local-user`); **list → detail (`/[id]`) routes** per entity; a real design system (primitives + tokens) vs. a single-file component with inline hardcoded colors; loading/empty/error/permission states; domain-true forms (can the form actually capture the real entity?); accessibility (WCAG AA) and responsiveness. A screen that only demos endpoints is not the product.

### Step 3 — Report

Produce/update a gap analysis modeled on `docs/erp-business-ui-gap-analysis.md`:
- Findings by layer, each citing the doc it violates and the `file:line` where.
- A field-name reference table (canonical names to standardize on).
- A prioritized "path to useful/working" that **refines** rather than rewrites, ordered by leverage (fix the aggregate first — everything inherits from it).
- An explicit go/no-go line for promoting to the real project.

## Anti-patterns this catches (name them in findings)

| Anti-pattern | Tell |
|---|---|
| Vocabulary cosplay | Right domain words, generic CRUD shape underneath |
| Degenerate aggregate | Contract arrays/value-objects flattened to scalars/strings |
| Silent rename | Field names drift doc→domain→wire→UI; code disagrees with itself |
| Stringly-typed domain | Real fields hidden in `attributes`/`metadata` maps |
| Standard-on-paper | DCSA/industry standard in docs, 0 in code |
| Workbench-as-product | One page of form+list+status; no shell, no detail routes, no design system |
| Auth theater | A login app exists but business screens hardcode a user |

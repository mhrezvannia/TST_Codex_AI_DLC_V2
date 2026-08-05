# W3-01 — Codex Handoff for Refined Mockups 2.5

**Written:** 2026-08-05 by Claude Code on `intent/W3-01-dnd-rules-and-rates`
**For:** the Codex CLI box that owns the AI-DLC engine and the live Compose stack

## Why this file exists

The W3-01 design work splits across two machines. Everything that is *design
documentation* was completed off-engine. Everything that requires the AI-DLC
engine or the running stack was deliberately **not** done, and is listed below as
your work.

Nothing under `aidlc/` was touched. The intent record is byte-identical to the
`c49fad7` checkpoint. No stage pointer moved, no gate was approved, and no audit
event was emitted from prose. Confirm this before you resume:

```bash
git diff --stat c49fad7..HEAD -- aidlc/     # must be empty
```

## State you are resuming into

| Field | Value |
|---|---|
| Intent | `260803-dnd-rules-rates` |
| Lifecycle phase | INCEPTION |
| Current stage | `refined-mockups` (2.5) |
| Stage status | `[-]` in progress, **parked** 2026-08-03T13:50:53Z |
| Last completed | `user-stories` (2.4), approved |
| Next stage | `application-design` (2.6) |
| State version | 7 |
| Stages complete | 14 of 32 |
| Recorded workspace | `D:\TST_Codex_W3-01` |

Verify `D:\TST_Codex_W3-01` exists on your machine. It does not exist on the
authoring machine, which is why the engine could not run there.

## What was completed off-engine

Steps 2 and 3 of `docs/ui-ux-prompts/EXECUTION-GUIDE.md`:

1. **Step 2 (generate)** — was already complete at the `c49fad7` checkpoint.
   `docs/ui-ux-design/18-dnd-rules-and-rates.md` holds a 17-section candidate
   covering all nine deliverables required by `docs/ui-ux-prompts/18-dnd-rules-and-rates.md`.
   It was **not** regenerated; regenerating would have destroyed committed work.
2. **Step 3 (conformance review)** — executed and recorded in that document's
   header. Passed on every reviewable criterion. Two corrections applied and one
   scope decision recorded.

### Changes made to the design document

| Change | Location |
|---|---|
| Conformance review record added | header, after the status block |
| Font conflict row now names the font the source prompt actually proposed (`Source Sans 3` / `Inter`, not `Fira`); resolution unchanged — `--erp-font-sans` / IBM Plex Sans | §2 conflict table |
| Bounded evaluation UI recorded as **deferred**, not W3-01 release scope | §6.8 |
| Question 1 marked RESOLVED | §16 |
| Stale "optional pending review" checklist line corrected | §17 |

### The scope decision you should know about

`docs/ui-ux-prompts/18-dnd-rules-and-rates.md` reads the bounded evaluation
action as **mandatory** (items 4 and 32, result spec at lines 45-48). The
approved W3-01 Requirements Analysis does **not** require a calculation-preview
UI, and FR-09 permits proving evaluation through the API alone.

Resolved in favour of the approved requirements — evaluation UI is **deferred**.
The design is retained in §6.8 so promotion needs a decision, not a redesign.
**Application Design must not build the evaluation surface while this stands.**

If you disagree, this is the one place the design's scope is genuinely a
judgement call rather than a derivation. Reopen it at the 2.5 gate.

## Your work on this machine

### 1. Gather the live evidence that blocks approval

The design cannot honestly be approved until these are observed. `§13` carries
three `BLOCKED` rows and `§16` question 8 requires the live baseline:

- [ ] `FilterToolbar` / search / filter / sort / pagination against the real
      server-backed provider — confirms the query contract, currently unconfirmed
- [ ] Approval and dirty-guard `Dialog` keyboard proof: focus containment, safe
      Escape, trigger restoration — source-observed only, never run live
- [ ] Charge routes rendering inside the shared authenticated shell with the
      Charge module active and **no journey ribbon** (`journeyStage=null`)
- [ ] Screenshots at 375 / 390 / 768 / 1024 / 1440 px, light and dark, no
      page-level horizontal scroll
- [ ] The full checklist in `§15` of the design document

`§4` of the design document states plainly that no live claim is marked PASS.
Preserve that honesty: record real observations, and if something fails, say so.
Do not convert a source observation into a PASS.

### 2. Resume the engine and produce the 2.5 artifacts

Deliberately not done off-engine — these artifacts must carry the engine's audit
trail and stage transition, which prose cannot produce. Use the Step 4 prompt
from `EXECUTION-GUIDE.md` verbatim:

```text
$aidlc --resume

Read and follow docs/ui-ux-prompts/REFINED-MOCKUP-HANDOFF.md completely.
Apply it to W3-01 D&D Rules and Rates using the reviewed design
docs/ui-ux-design/18-dnd-rules-and-rates.md and the W3-01 LinerCore runbook/page
contracts. Produce the binding Refined Mockups artifacts in the active W3-01
intent record. Do not advance to Application Design until I approve the gate.
```

Expected artifacts, per `REFINED-MOCKUP-HANDOFF.md`: `mockups.md`,
`interaction-spec.md` (using `aidlc/spaces/default/memory/templates/interaction-spec.md`),
`accessibility-checklist.md`, `design-system-mapping.md`, the full state matrix,
and the requirements-to-surface traceability table.

### 3. Approve the gate

Only after the live evidence exists. Step 5 of the EXECUTION-GUIDE.

## Environment notes from the authoring machine

Recorded so you can tell environment problems from design problems. On the
authoring box: `bun` absent (blocks the whole engine), `docker` absent (blocks
live acceptance), `python` resolves to the Windows Store stub (blocks
`search.py`), `node` present. Your box should have all four.

`design-system/linercore/MASTER.md` lines 163-176 **require** a
`ui-ux-pro-max` invocation before refined mockups, application design, code
generation, and UI review, hardcoded to
`python .codex\skills\ui-ux-pro-max\scripts\search.py`. Two notes:

1. The skill now also exists at `.claude/skills/ui-ux-pro-max/`, so the mandated
   path is harness-specific and will not resolve on every harness. Worth making
   harness-neutral.
2. That mandate could not be satisfied on the authoring machine. The review
   relied on the skill's Quick Reference rules instead, which is the fallback the
   skill itself prescribes when Python is unavailable. This mattered less than it
   would on greenfield work: W3-01 must conform to an existing, frozen design
   system rather than generate a new one, and the guide explicitly rejects
   replacement colors and fonts.

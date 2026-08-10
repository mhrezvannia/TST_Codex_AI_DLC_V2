# W3-04 Delivery Planning Questions

## Planning Guardrail

Delivery Planning chooses an economic Bolt sequence through the approved cycle-free U01–U08 topology. It cannot remove a unit dependency, weaken a unit DoD, invent named people/capacity/lead times, substitute a stub for a real provider, edit `packages/ui`, or authorize Construction before the final Inception gate.

The affirmed `team-practices.md` requires PB-01 as the first separately gated Construction slice and one serialized live Compose acceptance run. The approved `unit-of-work-dependency.md` requires U01 → {U02,U03} → {U04,U05} → U06 → U07 → U08, with U06 depending on both U04 and U05. Branch choices remain economic decisions.

## Q1. Sequencing Heuristic

Which economic heuristic should choose the Bolt sequence?

- **Option A — hybrid walking-skeleton-first, then risk-first (recommended):** Preserve the mandated PB-01 walking skeleton as B01. At each independent branch, tackle the cross-owner or migration uncertainty before the lower-risk breadth path, while obeying the DAG.
- **Option B — walking-skeleton-first, then value-first:** After PB-01, prioritize the broadest immediately visible form/operator value before the higher-risk provider/migration seams.
- **Option C — quantitative WSJF:** Assign numeric business value, time criticality, risk reduction, and size scores before sequencing. This is inappropriate unless the user supplies calibrated values.

[Answer]: A

## Q2. WSJF and Scoring

Should the plan publish numeric sequencing scores?

- **Option A — no invented numeric WSJF (recommended):** Use an explicit qualitative matrix—dependency readiness, user value, cross-owner risk, data/compatibility risk, relative size—and record the reason for every branch choice.
- **Option B — user-supplied WSJF:** Pause until the user supplies calibrated scoring values and weightings.
- **Option C — equal-weight synthetic WSJF:** Let AI assign 1–10 values. This creates false precision and a calendar/value claim unsupported by approved artifacts.

[Answer]: A

## Q3. Bolt Granularity

How should the eight Units be wrapped in Construction Bolts?

- **Option A — one Unit per Bolt (recommended):** Eight small deployable/gated Bolts preserve unit DoD, story/evidence traceability, recovery and focused contract reviews. B01 remains the separately approved PB-01 slice.
- **Option B — six bundled Bolts:** Bundle independent U02+U03 and U04+U05. This reduces gates but combines different owners/risks and makes a blocked external dependency stall more work.
- **Option C — one feature Bolt:** Run all eight Units through Construction once. This defeats the approved thin-slice and confidence-gate strategy.

[Answer]: A

## Q4. Parallelism and Gates

Can multiple Bolts run through Construction concurrently?

- **Option A — sequential Bolts with bounded parallel tasks inside a Bolt (recommended):** One Bolt at a time crosses Construction and its human gate; focused provider/UI/quality sessions and non-conflicting tasks may run in parallel inside it. Live Compose acceptance remains serialized.
- **Option B — parallel independent Bolts:** Run U02/U03 and U04/U05 concurrently. This is topologically possible but increases merge conflicts across the shared Booking form/types and conflicts with the current serialized acceptance posture.
- **Option C — unrestricted parallel Bolts:** Maximize concurrency without gate serialization. This weakens the evidence and branch protocol.

[Answer]: A

## Q5. External Readiness and Lead Times

How should unconfirmed named owners, capacity and lead times be represented?

- **Option A — role-based readiness gates, no calendar promise (recommended):** Keep the approved role owners, mark names/backups/capacity/lead times `TBD`, and block each dependent Bolt before commitment until its owner/window is confirmed. No unavailable dependency is replaced locally.
- **Option B — assume immediate availability:** Treat all existing teams as available now. This contradicts Team Formation evidence.
- **Option C — pause Delivery Planning now:** Do not produce a role-based plan until every name, backup and calendar window is supplied.

[Answer]: A

## Q6. Branch Sequence

Within the approved DAG, which valid branch path should the plan bind?

- **Option A — schedule risk before field breadth; migration risk before validation (recommended):** `B01 U01`, `B02 U03`, `B03 U02`, `B04 U04`, `B05 U05`, `B06 U06`, `B07 U07`, `B08 U08`. This validates Shared Platform schedule authority early and tackles the XL migration/correction seam before downstream pricing recovery consumes it.
- **Option B — visible breadth before schedule; validation before migration:** `B01 U01`, `B02 U02`, `B03 U03`, `B04 U05`, `B05 U04`, then U06–U08. This is valid but defers two higher-risk seams.
- **Option C — choose only after calendar availability:** Leave branch sequence conditional on named contributor windows and do not bind an economic plan yet.

[Answer]: A

## Q7. Team Allocation

What allocation model should the plan use without a named roster?

- **Option A — approved role-based Booking delivery cell plus focused seam mobs (recommended):** Assign the Core Booking delivery cell to every Bolt; add Shared Platform, Charge, CMM, LinerCore/UX, migration, quality/security and operations reviewers only where their seam is exercised. Each Bolt remains BLOCKED until the accountable owner, backup and review window are named.
- **Option B — AI developer agent only:** Ignore the executed Team Formation topology and external contract decision rights.
- **Option C — create permanent service/layer teams:** Split frontend/backend/database/testing or form a cross-module mega-team. This violates approved ownership/topology.

[Answer]: A

## Q8. Bolt DoD and Confidence Hypotheses

How should per-Bolt completion and learning be expressed?

- **Option A — inherit each Unit’s live DoD and add one falsifiable confidence hypothesis/demo (recommended):** A Bolt cannot complete on code/tests alone; it must show the named operator behavior, real seams, fresh tagged evidence and its hypothesis result.
- **Option B — automated checks only:** Treat build/unit tests as Bolt completion and defer live proof to B08.
- **Option C — informal demo:** Demo visually without typed contract, data, audit, accessibility or duplicate-effect evidence.

[Answer]: A

## Recommended Per-Bolt Shape

| Bolt | Unit | Walking skeleton | Confidence hypothesis |
|---|---|---|---|
| B01 | U01 PB-01 request spine | Yes | The real shell/BFF/Booking/DB and schedule seam can create/reopen one truthful quantity-3/null-ID request with same-identity recovery. |
| B02 | U03 trusted voyage schedule | No | Shared Platform can supply route-compatible complete schedule provenance and deterministic degraded states without guessed milestones. |
| B03 | U02 complete commercial request | No | The governed field dictionary and released shared primitive can round-trip every accepted fact without optional-value loss or copied masters. |
| B04 | U04 versioned correction/migration | No | Representative legacy/current records can migrate/restart and correct on the same ID without lost/fabricated facts or last-write-wins. |
| B05 | U05 current request validation | No | Server validation can distinguish current/blocked/unavailable evidence and prevent stale or denied pricing work. |
| B06 | U06 exact pricing recovery | No | Charge receives exact authority and every recovery path preserves identity/context with zero duplicate commercial effects or guessed totals. |
| B07 | U07 confirmation/pending assignment | No | One confirmation yields one schema-valid canonical event and one CMM pending assignment with zero fabricated journeys/IDs. |
| B08 | U08 canonical operational workflow | No | One `/booking` composition exposes truthful authorized lifecycle/views at all required responsive/a11y states and closes live audits. |

## Interaction Mode

- **Guided recommendations:** accept all recommended Option A answers and generate the binding Delivery Planning artifacts.
- **Question-by-question:** decide Q1–Q8 interactively.
- **Self-guided:** edit every `[Answer]:` line and return when complete.

[Answer]: Guided recommendations approved by the user on 2026-08-10; all recommended Option A decisions are binding for artifact generation.

# Delivery Planning Questions — W2-02 Design-System Closure

## Fixed Planning Context

The plan consumes `requirements.md`, `stories.md`, `mockups.md`, `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, and `team-practices.md`. The DAG contains one Unit, so the project has one Construction Bolt; questions resolve the economic path and confidence hypothesis inside that Bolt.

## Q1. Which sequencing heuristic should govern the single Bolt?

A. Use a risk-first + walking-skeleton hybrid: close the canonical shell/package/BFF seam and its focused tests early, then expand the same Bolt through the complete live matrix and terminal audits; do not use WSJF when there is only one Bolt (recommended)
B. Use value-first and defer shell-duplication risk until after screenshots
C. Use WSJF with invented comparative scores
D. Run evidence first against the existing duplicate UI
X. Other (please specify)

[Answer]: A — Risk + skeleton (Recommended) — 2026-07-21T14:53:42Z — **Mode:** guided

## Q2. What Bolt granularity and concurrency should apply?

A. Bundle the sole `booking-design-system-closure` Unit into one sequential Bolt; permit only safe internal task overlap that respects shared-file ownership and never creates a second Bolt or partial closure claim (recommended)
B. Split the Unit into parallel package, UI, and audit Bolts
C. Run multiple Bolts concurrently against the same shared files and Compose stack
D. Create a Bolt for every story
X. Other (please specify)

[Answer]: A — One sequential Bolt (Recommended) — 2026-07-21T14:53:42Z — **Mode:** guided

## Q3. Is the Bolt the walking skeleton, and what should it prove?

A. Yes: it is the canonical authenticated `/booking` slice through shared UI, shell, BFF/services, isolated live states, demo safety, evidence, and audits; shipping proves the unresolved W2-02 DoD is actually closed (recommended)
B. No: treat only package unit tests as the skeleton
C. Yes, but a detached mock frontend is sufficient
D. Limit the hypothesis to visual similarity
X. Other (please specify)

[Answer]: A — Full canonical slice (Recommended) — 2026-07-21T14:53:42Z — **Mode:** guided

## Q4. Who owns the Bolt and which dependencies gate it?

A. Use the affirmed Codex-led single-driver mob with AI-DLC navigators and user-owned human gates; dependencies are local tool/runtime availability and existing services/data only, with no external-team or production approval dependency (recommended)
B. Require a new external frontend team handoff
C. Require an AWS platform team and cloud approval
D. Remove user approval gates
X. Other (please specify)

[Answer]: A — Codex-led mob (Recommended) — 2026-07-21T14:54:49Z — **Mode:** guided

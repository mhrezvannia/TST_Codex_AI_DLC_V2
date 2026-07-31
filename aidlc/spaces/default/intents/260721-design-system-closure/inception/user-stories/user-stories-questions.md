# User Stories Plan Questions — W2-02 Design-System Closure

## Planning Context

The plan reconciles `requirements.md`, `business-overview.md`, `component-inventory.md`, and `team-practices.md`. Stories will use INVEST notes and Given/When/Then acceptance criteria, but all remain part of one vertical W2-02 closure boundary.

## Q1. Which personas should receive explicit stories?

A. Booking operator, frontend developer, quality/release reviewer, and manager-demo owner; program-owner closure truth is included in the reviewer story (recommended)
B. Booking operator only; treat package, evidence, and demo protection as implementation tasks
C. Booking operator and frontend developer only; omit reviewer and demo-owner outcomes
D. Add separate personas for every backend service owner even though their behavior is preserved
X. Other (please specify)

[Answer]: A — Four personas (Recommended) — 2026-07-21T13:49:08Z — **Mode:** guided

## Q2. How should the story set be broken down?

A. Six small stories by user journey and actor outcome—list/states, keyboard create-to-confirm, shared-package boundary, reproducible live evidence, demo safety, and truthful closure—linked under one non-separable closure epic (recommended)
B. One very large story containing the entire Definition of Done
C. Horizontal stories by repository layer that may each claim independent completion
D. Separate stories for every shared primitive regardless of observed gap
X. Other (please specify)

[Answer]: A — Six linked stories (Recommended) — 2026-07-21T13:49:08Z — **Mode:** guided

## Q3. How should stories be prioritized?

A. Mark all six as Must because each maps to a hard W2-02 closure gate; record no Should/Could scope in this intent (recommended)
B. Mark only the operator happy path as Must and the state/evidence/demo stories as Should
C. Use relative RICE scores even though no reliable reach or effort data exists
D. Allow live audits and manager-demo protection to move below the closure boundary
X. Other (please specify)

[Answer]: A — All Must (Recommended) — 2026-07-21T13:49:08Z — **Mode:** guided

## Proposed Plan

- **Persona count:** four explicit personas.
- **Story count:** six Must stories under one W2-02 closure epic.
- **Breakdown:** workflow-and-actor outcomes with requirement traceability, dependency order, 3–6 Given/When/Then acceptance criteria per story, and concise INVEST notes.
- **UI scope:** list/create/detail, difficult states, keyboard/focus/announcements, themes, and required responsive widths inside the shared shell.

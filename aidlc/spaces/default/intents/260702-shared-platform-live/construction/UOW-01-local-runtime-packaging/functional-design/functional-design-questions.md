# Functional Design Questions - UOW-01 Local Runtime Packaging

## Context

Consumes `unit-of-work`, `unit-of-work-story-map`, `requirements`, `components`, `component-methods`, and `services`. Answers are inferred from the approved B01 walking skeleton.

## Questions and Answers

- Runtime proof focus: prerequisite check plus reproducible app/service startup path. [Answer]: Use Node/Yarn/Java/Maven/Docker/port/env checks and distinguish blocked prerequisites from code failures.
- Packaging model: [Answer]: Prefer buildable Dockerfiles or documented Compose dev profiles, keeping Compose local/on-prem.
- Evidence output: [Answer]: Emit machine-readable and human-readable readiness summaries usable by B05 later.


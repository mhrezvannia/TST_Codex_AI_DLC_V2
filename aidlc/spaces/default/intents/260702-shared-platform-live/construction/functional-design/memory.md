# Functional Design Memory

## Interpretations

- 2026-07-03T10:34:17Z - Because the engine did not provide `directive.unit`, Functional Design is being applied to the approved B01 walking-skeleton units from `bolt-plan`: UOW-01, UOW-02, UOW-03, UOW-04, UOW-05, and UOW-07.
- 2026-07-03T10:34:17Z - Treating B01 as a minimal end-to-end design across runtime, auth, identity, reference-data service, BFF, persistence, outbox/status, and smoke evidence.

## Deviations

- 2026-07-03T10:34:17Z - Inferred functional-design questions from approved Inception artifacts because the user asked to continue without optional prompts.
- 2026-07-03T10:39:05Z - `linter` and `type-check` sensors were non-applicable to markdown Functional Design artifacts; the sensor tool refused `.md` paths because those sensors match only code file extensions.
- 2026-07-03T10:39:32Z - Learnings surface tool could not find `functional-design` in `runtime-graph.json`; walking-skeleton Functional Design artifacts passed validation, so the approval gate continued with this caveat recorded.

## Tradeoffs

- 2026-07-03T10:34:17Z - Kept UOW-06 workbench write UX out of B01 Functional Design even though UI is important; B01 proves architecture through BFF/service/status first, then B02 completes rich UI behavior.

## Open questions

- 2026-07-03T10:34:17Z - Confirm during code generation whether Java/Maven/Docker are available locally; otherwise B01 proof must report prerequisite blockers and use available frontend/unit checks.

# Infrastructure Design Memory

## Interpretations

- 2026-07-03T11:20:09Z - Applied Infrastructure Design to B01 walking-skeleton units because the engine did not provide a specific unit.
- 2026-07-03T11:20:09Z - Treated infrastructure as local/on-prem Compose and dev profiles, not AWS managed services, because `team-practices` and application decisions exclude public cloud for this intent.

## Deviations

- 2026-07-03T11:20:09Z - Inferred infrastructure-design answers from approved artifacts to keep progressing without optional prompts.
- 2026-07-03T11:25:41Z - `linter` and `type-check` sensors are non-applicable to markdown-only Infrastructure Design artifacts; no generated `.ts`, `.js`, or `.tsx` files exist in this stage.
- 2026-07-03T11:25:41Z - Learnings surface tool could not find `infrastructure-design` in `runtime-graph.json`; Infrastructure Design artifacts passed validation, so the approval gate continued with this caveat recorded.

## Tradeoffs

- 2026-07-03T11:20:09Z - Centralized most B01 infrastructure decisions around shared Compose services to avoid duplicating conflicting infrastructure across unit folders.

## Open questions

- 2026-07-03T11:20:09Z - Code Generation must choose whether to add Dockerfiles or Compose dev profiles first based on fastest reproducible local runtime.

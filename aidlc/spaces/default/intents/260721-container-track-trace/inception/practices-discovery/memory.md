# Practices Discovery Memory

## Interpretations

- 2026-07-21T14:10:01Z - Treat existing W2-01-specific team practices as re-run evidence, not as automatically generalized W2-04 policy; the user affirmed the W2-04-specific gaps explicitly.

## Deviations

- 2026-07-21T14:10:01Z - With four total agent slots, the primary agent performed the pipeline/deployment lead scan while quality, developer, and security support scans were dispatched concurrently; the time-boxed security subagent did not return, so its lane was completed from codekb plus targeted CI/config evidence.

## Tradeoffs

- 2026-07-21T14:10:01Z - Keep Playwright and the live Wave A journey as a mandatory serialized final gate instead of ordinary PR CI, avoiding contention for the single acceptance stack while retaining a hard release condition.
- 2026-07-21T14:10:01Z - Prefer risk and acceptance-criterion coverage over an invented numeric floor until executable coverage instrumentation exists.

## Open questions

- 2026-07-21T14:10:01Z - No practice decision remains open; missing automated security scans and numeric coverage enforcement remain observable repository gaps for later pipeline work, not claims of completion.

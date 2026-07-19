<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is maintained by the orchestrator during stage execution. Add observations at the gate ritual, not by editing here directly.

## Interpretations
- 2026-07-18T05:50:27Z — Used the freshly indexed codebase-memory MCP graph as the primary reverse-engineering source for `TST_Codex_integ`; Graphify remains stale and advisory only.

## Deviations
- 2026-07-18T05:50:27Z — Completed reverse engineering inline from MCP graph/source verification rather than a role-specific subagent because the fresh graph already provided the required scan and avoids repeating expensive broad reads.

## Tradeoffs
- 2026-07-18T05:50:27Z — Scoped the codekb to full repo structure while highlighting W2-01 auth/shell/Booking seams, because the intent needs targeted implementation context rather than a new enterprise-wide redesign.

## Open questions
- 2026-07-18T05:50:27Z — Requirements analysis should decide whether existing `apps/auth` becomes the shell host or a separate auth surface consumed by a new shell app.

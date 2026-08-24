# CLAUDE.md

Project instructions for Claude Code. **Read `AGENTS.md` first — it is the
authoritative engineering contract for this repository** (architecture,
contracts-first workflow, design-system rules, testing and commit conventions).
Everything in `AGENTS.md` applies here verbatim; this file only adds the
Claude-Code-specific harness wiring for the AI-DLC workflow.

## The AI-DLC workflow

This repository is driven by AI-DLC (AI-Driven Development Life Cycle): a
32-stage, gated lifecycle whose state lives in version-controlled markdown under
`aidlc/spaces/<space>/intents/<intent>/`.

- **Entry point**: `/aidlc` (the skill at `.claude/skills/aidlc/SKILL.md`).
- **The engine owns all routing.** `bun .codex/tools/aidlc-orchestrate.ts next`
  returns exactly one typed directive; you execute that single move, then
  `report` it. Never re-derive stage sequencing, gate status, or scope
  resolution in prose, and never call the state tools (`aidlc-state.ts
  approve/advance/…`) directly — `report` dispatches them.
- **Stop at every approval gate.** Gates are rendered with `AskUserQuestion`
  per `.claude/skills/aidlc/question-rendering.md`. Never approve, skip, or
  advance a stage the human did not approve; park instead
  (`bun .codex/tools/aidlc-orchestrate.ts park`).

### Where the engine lives (`.codex/`, deliberately)

This tree is the **Codex-packaged** output of a multi-harness framework, so the
engine, stages, protocols, knowledge, rules, and agent personas all live under
`.codex/`. That is not drift:

- `harnessDir()` derives the harness from the tools' own script path
  (`.codex/tools/aidlc-lib.ts`), and `.codex/tools/data/harness.json` pins
  `{ "harnessDir": ".codex", "rulesSubdir": "aidlc-rules" }`.
- The `.ts` hook bodies under `.codex/hooks/` are *packaged core*, byte-shared
  across harnesses and already written against the Claude Code hook-input
  shape — which is why `.claude/settings.json` invokes them directly with no
  adapter shim (Codex needs one; Claude Code does not).

**Never set `AIDLC_HARNESS_DIR`** — overriding it breaks rules and knowledge
resolution.

### Claude-side wiring (this harness)

| Surface | Location |
|---|---|
| Runner skill (`/aidlc`) | `.claude/skills/aidlc/SKILL.md` |
| Gate rendering annex | `.claude/skills/aidlc/question-rendering.md` |
| Agent personas (13) | `.claude/agents/aidlc-*-agent.md` |
| Hooks + statusline + env | `.claude/settings.json` |
| Audit skills | `.claude/skills/aidlc-audit/`, `.claude/skills/erp-fidelity-audit/` |

Hooks registered in `.claude/settings.json` (all pointing at the shared core
bodies in `.codex/hooks/`): `SessionStart`, `PostToolUse` (`Write|Edit` →
audit-logger + sensor-fire; `TaskUpdate` → statusline sync; `Bash` →
runtime-compile), `PreCompact`, `SubagentStop`, `Stop`, and `SessionEnd`.

### Stage visibility

Keep stage-level tasks current with `TaskCreate`/`TaskUpdate`: one task per
running stage, its `activeForm` ending with the stage's `[slug]` suffix (e.g.
`Running NFR Requirements [nfr-requirements]`). The `PostToolUse` hook parses
that suffix to sync `aidlc-state.md`; the registered `statusLine` renders the
workflow position.

### Resuming after a fresh clone

The space/intent cursors (`aidlc/active-space`,
`aidlc/spaces/*/intents/active-intent`) are gitignored per-user state, so a
fresh clone reports *"No active AI-DLC workflow found."* even when
`intents.json` shows an in-flight intent. Re-point it once, then resume:

```bash
bun .codex/tools/aidlc-utility.ts intent <dirName>   # bare `intent` lists them
```

Then `/aidlc --resume`.

## Toolchain notes

- **Package manager is yarn** (see `package.json` / `yarn.lock`) — do not
  introduce npm or pnpm lockfiles.
- **`bun` runs the AI-DLC engine only**; it is not the application runtime.
- Run repository checks the way `AGENTS.md` prescribes; prefer the existing
  turbo/vitest/playwright entry points over ad-hoc commands.

# Recovered Local Archive

This directory preserves durable material discovered in old TST Codex worktrees that should remain available for migration or forensic recovery but must not replace canonical production code or active AI-DLC state.

- `recovered-uncommitted/` contains W2-03 planning and implementation drafts superseded by the completed W2-03 implementation.
- `abandoned-intents/` contains a draft W2-04 closure workflow that was superseded by the completed W2-04 record and is not registered as active.
- `orphaned-audits/` preserves audit material found under an accidentally nested AI-DLC roof.
- `ui-recovery-patches/` preserves the UI recovery patch sequence.
- `editor-history/` retains only AI-DLC and documentation history; editor-specific Codex configuration was excluded.
- `local-cleanup-backups/` retains small backup metadata and archives. Oversized exclusions are recorded in `docs/consolidation/PROJECT-CONSOLIDATION-MANIFEST.md`.

Nothing under this directory is an implementation authority. Use the current source tree, `docs/intents/`, `design-system/linercore/`, and registered `aidlc/spaces/default/intents/` records first.

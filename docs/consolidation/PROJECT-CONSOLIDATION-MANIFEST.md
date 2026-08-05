# TST Codex Project Consolidation Manifest

Date: 2026-08-05

## Canonical Branch

`integ/main-reconciled` is the portable, consolidated project branch. It contains the application source, shared infrastructure, contracts, design system, prompts, documentation, completed AI-DLC intent records, durable audit material, code knowledge, historical graph snapshots, deliverables, and retained acceptance evidence.

The canonical branch deliberately does not activate unfinished intent state. The only isolated in-progress intent branches are:

| Intent | Branch | Checkpoint commit |
| --- | --- | --- |
| W3-01 D&D Rules and Rates | `intent/W3-01-dnd-rules-and-rates` | `c49fad7c61f2eae87ddcec90c38e617412793796` |
| W3-04 Booking Request Completeness | `intent/W3-04-booking-request-completeness` | `08be3d4145bf3ffd77c2121af6dd5466c8104e6c` |
| W4-01 Module List/Detail Uplift | `intent/W4-01-module-list-detail-uplift` | `1b52ad59816527a1d963b9a1e1fff841bbae28f3` |

## Completed and Shared History

The audit verified that these histories were already ancestors of the canonical integration branch before consolidation:

- `enterprise/linercore`
- `intent/W2-02-design-system`
- `intent/W2-04-container-journey-track-trace`
- `demo/booking-ui-reference-sync`

The three W2-01 branch-only commits were retained through an `ours` history merge because their net UI experiment was reverted and their remaining Charge route change is superseded by the canonical Compose and Nginx configuration. This preserves provenance without replacing newer integration files.

The canonical AI-DLC registry retains these durable records:

- `260630-shared-platform`
- `260702-shared-platform-live`
- `260704-charge-agreement`
- `260708-linercore-enterprise` (program umbrella)
- `260714-booking-quote-cash`
- `260717-app-shell-auth`
- `260721-design-system-closure`
- `260721-charge-tariff-agreements`
- `260721-container-track-trace`

## Recovered Material Added by Consolidation

- The missing W2-01 reverse-engineering CodeKB at `aidlc/spaces/default/codekb/TST_Codex_integ/`.
- The AI-DLC v2 Booking Quote-to-Cash assessment, its generator, and accessibility QA result under `deliverables/`.
- The dated 2026-07-26 Graphify snapshot, four useful query memories, and the W2-04 learning snapshot.
- Unique local acceptance evidence that was absent from integration, excluding the reproducible Docker image archive listed below.
- UI recovery patches and editor history for durable AI-DLC/docs files.
- A legacy Phase 1 UI/UX prompt document under `docs/archive/ui-ux/`; current structured prompts remain authoritative.
- Pre-intent W2-03 planning, superseded implementation drafts, an abandoned W2-04 closure draft, and an orphaned audit under `archive/`. These are preserved for recovery and provenance but are not active workflow or production source.
- Cleanup-backup metadata and the small recovery archives. The oversized superseded patch is recorded below rather than committed.

## Audited Local Sources

- `D:\TST_Codex`
- `D:\TST_Codex_integ`
- `D:\TST_Codex_merge_w2`
- `D:\TST_Codex_phase1_merge`
- `D:\TST_Codex_ui_recovery`
- `D:\TST_Codex_W2-04`
- `D:\TST_Codex_W3-01`
- `D:\TST_Codex_W3-04`
- `D:\TST_Codex_W4-01`
- `D:\TST_Codex-cleanup-backup-20260715-010116`
- `D:\TST_Codex-integ-cleanup-backup-20260715-010245`

The empty `D:\TST_Codex_w001`, `D:\TST_Codex_W2-02-closure`, and `D:\TST_Codex_W2-03` directories contained no files to migrate.

## Intentionally Excluded Local State

The following material is not portable source and must not be committed:

- `active-intent`, `active-space`, `.aidlc-clone-id`, `.aidlc-sessions`, hook-health scratch, runtime graphs, local sensor scratch, and recovery cursors.
- `.codex-runtime-shadow`, `.codex/tmp`, `.turbo-cache`, build caches, generated virtual environments, and editor-specific Codex configuration history.
- The accidental trailing `w` edit in the old W2-01 intent statement.
- Obsolete working copies where the canonical integration implementation is newer. Useful drafts are retained only under `archive/recovered-uncommitted/`.
- Redundant failed/retry evidence already represented by retained final evidence, except small unique attempt files recovered during this consolidation.

Two large local-only recovery objects are excluded from Git:

| Local object | Bytes | SHA-256 | Reason |
| --- | ---: | --- | --- |
| `D:\TST_Codex_integ\artifacts\docker-images\linercore-apps-booking-demo-20260721.tar` | 492,005,888 | `67d1081e1386e2b8ae56510b6d1d8e0ffa5c5784a022ff9e13bfe72e55f2b81e` | Reproducible Docker image archive; exceeds normal GitHub file limits and is not source. |
| `D:\TST_Codex-cleanup-backup-20260715-010116\tracked-changes.patch` | 133,377,136 | `504a32b2b2e9792400e5805d3afd8367c1e0a3fce9b14636b7c74767fcf3729a` | Superseded cleanup patch containing large generated/binary deltas; exceeds GitHub's single-file limit. |

## Remote Restoration

Clone the canonical branch and fetch the three active intent branches:

```powershell
git clone --branch integ/main-reconciled `
  git@github.com:mhrezvannia/TST_Codex_AI_DLC_V2.git `
  TST_Codex_phase1_merge

cd TST_Codex_phase1_merge
git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"
git fetch origin --prune
```

Create sibling worktrees only when resuming an active intent. Machine-local AI-DLC cursors must then be recreated with `/aidlc intent <record-name>` before `/aidlc --resume`.

# Phase 1 Remaining-Intent Preflight

Date: 2026-07-21

Branch: `preflight/phase1-remaining`

Baseline: `integ/main-reconciled` at `fc502a986edd62cd50267a38db9f4599ea036d0c`

## Result

**READY WITH ONE CLOSURE GATE.** The remaining Phase 1 program can proceed in
dependency-safe parallel worktrees after this preflight is integrated. W2-02
must complete its Booking migration before W4-01 consumes it.

## Reconciled Status

| Intent | Preflight status | Evidence or action |
|---|---|---|
| W0-01 | Closed | `artifacts/w0-01-live/README.md` |
| W0-02 | Closed | `artifacts/w0-02-live/live-proof-summary.json` |
| W1-01 | Closed | Real PASS in `artifacts/w1-01-live/w1-real-pass-20260720-verified/manifest.json` |
| W2-01 | Closed | `artifacts/w2-01-live/app-shell-auth/manifest.json` |
| W2-02 | Acceptance blocked | `w2-02-closure-gap.md` |
| W2-03 through W4-02 | Not started | Launch by dependency wave below |

W1 history remains explicit: the earlier blocked live manifest and test-project
waiver are historical records, not rewritten as a real PASS. The later real
PASS is separate evidence.

## UI Governance

- Project skill packaged at `.codex/skills/ui-ux-pro-max/` without runtime caches.
- Binding UI baseline persisted at `design-system/linercore/MASTER.md`.
- AI-DLC project rules require the skill and master for every UI-bearing intent.
- One authenticated shell owns auth, navigation, chrome, and canonical routes.
- Modules contribute routed content; no module may create a second canonical UI.
- UI evidence covers keyboard access, all async/error states, both themes, and
  375px, 768px, 1024px, and 1440px viewports.

## Dependency-Safe Launch

Each item remains its own vertical intent, branch, worktree, AI-DLC state, live
acceptance package, and merge. Do not combine them into an umbrella run.

| Wave | Parallel work | Gate |
|---|---|---|
| A | W2-02 closure unit, W2-03, W2-04 | Start from this preflight after integration |
| B | W3-01, W3-03 | W3-01 waits for W2-03; W3-03 consumes closed W1-01 |
| C | W3-02, W4-01 | W3-02 waits for W3-01 and W2-04; W4-01 waits for W2-02 closure |
| D | W4-02 | May run once team capacity allows; consumes closed W1-01 |

Before each launch, rebase the intent worktree from the latest
`integ/main-reconciled`, load its statement Context Pack, and follow
`docs/aidlc-v2-slicing-playbook.md`. UI-bearing work also loads the LinerCore
master design system before design or code generation.

Exact branch names, worktree commands, dependency checks, and the mandatory
AI-DLC start contract are in `launch-map.md`.

## Phase 1 Target

The completion architecture is one shared authenticated shell with canonical
routes for Booking, Reference Data, Charge Agreements, and Container Movement.
Direct module ports remain development surfaces only. Phase 1 is not complete
until every remaining intent is observed on the live Compose stack and both
required audits are green.

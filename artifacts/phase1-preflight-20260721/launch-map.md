# Phase 1 Intent Launch Map

Run these steps only after `preflight/phase1-remaining` is merged into
`integ/main-reconciled`. Resolve the new integration hash immediately before
creating each worktree:

```powershell
git -C D:\TST_Codex_phase1_preflight rev-parse integ/main-reconciled
```

Every intent gets a separate branch, worktree, AI-DLC record, acceptance
package, review, and integration merge.

## Wave A

```powershell
git -C D:\TST_Codex_phase1_preflight worktree add -b intent/W2-02-design-system-closure D:\TST_Codex_W2-02-closure integ/main-reconciled
git -C D:\TST_Codex_phase1_preflight worktree add -b intent/W2-03-charge-tariffs-and-agreements D:\TST_Codex_W2-03 integ/main-reconciled
git -C D:\TST_Codex_phase1_preflight worktree add -b intent/W2-04-container-journey-track-trace D:\TST_Codex_W2-04 integ/main-reconciled
```

W2-02 is a focused closure unit for the existing intent. W2-03 and W2-04 are
independent vertical intents. Merge each independently after its live gates.

## Wave B

Create these only from an integration head containing their dependencies:

```powershell
git -C D:\TST_Codex_phase1_preflight worktree add -b intent/W3-01-dnd-rules-and-rates D:\TST_Codex_W3-01 integ/main-reconciled
git -C D:\TST_Codex_phase1_preflight worktree add -b intent/W3-03-booking-amendments D:\TST_Codex_W3-03 integ/main-reconciled
```

W3-01 requires merged W2-03. W3-03 requires the already closed W1-01.

## Wave C

```powershell
git -C D:\TST_Codex_phase1_preflight worktree add -b intent/W3-02-dnd-pricing-and-invoice D:\TST_Codex_W3-02 integ/main-reconciled
git -C D:\TST_Codex_phase1_preflight worktree add -b intent/W4-01-module-list-detail-uplift D:\TST_Codex_W4-01 integ/main-reconciled
```

W3-02 requires merged W3-01 and W2-04. W4-01 requires the W2-02 closure and
closed W2-01.

## Wave D

```powershell
git -C D:\TST_Codex_phase1_preflight worktree add -b intent/W4-02-operations-observability D:\TST_Codex_W4-02 integ/main-reconciled
```

W4-02 already has its W1-01 dependency, but remains in the final wave to avoid
oversubscribing Platform/DevOps capacity.

## AI-DLC Start Contract

Use this prompt in the corresponding worktree, replacing the placeholders:

```text
$aidlc Start a new program intent from docs/intents/<statement>.md.

Base branch is integ/main-reconciled at <resolved-hash>. Work on
intent/<intent-branch>. Follow docs/intents/00-INTENT-BACKLOG.md and
docs/aidlc-v2-slicing-playbook.md. Load the statement Context Pack first.
This is a vertical program intent, not an umbrella redesign. Preserve all prior
merged work and historical acceptance evidence. For every UI-bearing unit, use
the project ui-ux-pro-max skill and load design-system/linercore/MASTER.md before
design or code generation. Extend the shared authenticated shell; do not create
a second canonical module app, shell, auth path, palette, or navigation model.
Observe the Definition of Done on the live Compose stack and require both
aidlc-audit and erp-fidelity-audit to pass before closure.
```

For W2-02, resume the existing intent semantics and use
`w2-02-closure-gap.md` as the required completion unit; do not regenerate the
already delivered foundation.

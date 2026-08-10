# Bolt Plan — W2-02 Design-System Closure

## Planning Basis

This plan consumes `requirements.md`, `stories.md`, `mockups.md`, `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, and `team-practices.md`. The one-node DAG permits exactly one Bolt. Internal checkpoints are economically sequenced but cannot claim independent Bolt or W2-02 completion.

## Bolt 1 — booking-design-system-closure

| Field | Plan |
|---|---|
| Included Unit | `booking-design-system-closure` |
| Walking skeleton | Yes — the canonical authenticated `/booking` slice across shared UI, shell, BFF/services, isolated runtime, evidence, and audits |
| Heuristic | Risk-first + walking-skeleton hybrid |
| Execution | Sequential Bolt; safe internal overlap only where shared files/runtime are not contended |
| Mob | Codex-led single-driver mob with stage personas/navigators and user-owned gates |
| Complexity | XL |

### Confidence hypothesis

Shipping this Bolt will prove or falsify that the existing W2-02 foundation can become the sole shared, accessible Booking reference without replacing the Wave A baseline: the canonical shell will consume `@erp/ui`, the existing BFF/service journey will still complete, all required UI states/themes/widths will be observable, the manager demo will remain healthy, and independent audits will accept the durable evidence.

### Internal confidence sequence

1. **Protect and characterize:** Verify baseline/branch ancestry, unchanged manager demo, indexed duplicate-presentation seam, and focused failing reproductions for confirmed gaps.
2. **Enforce the shared boundary:** Close only generic `packages/ui` gaps, package hygiene, and application CSS/style-system rejection; prove negative probes.
3. **Canonicalize the Booking UI:** Migrate shell-owned list/create/detail/lifecycle compositions and explicit states to shared primitives; decommission/redirect standalone Booking pages while preserving BFF endpoints.
4. **Prove focused compatibility:** Run package, shell, Booking BFF/route, accessibility, lint, typecheck, test, and production-build checks.
5. **Prove the walking skeleton live:** Run pre-demo guard, wrapper-only `linercore-wave-a`, authenticated keyboard create → validate → price → confirm → detail, and controlled difficult-state checks.
6. **Complete the UI matrix:** Capture light/dark, 375/768/1024/1440, focus/announcements, reduced motion, contrast, and overflow evidence with exact setup metadata.
7. **Close truthfully:** Preserve evidence, run final demo guard and both audits with unmasked exit status, then update W2-02 backlog status only if everything is green.

The sequence identifies an internal economic path, not separate deliverables. A later checkpoint cannot waive an earlier failure.

### Bolt Definition of Done

- Sole canonical `apps/shell` Booking presentation; no duplicate shell/theme/navigation.
- Applicable Booking presentation imports/renders `@erp/ui`; semantic-native exceptions are named and tested.
- Loading, populated, empty/no-match, error/retry, denied, validation, pending, success, not-found, and degraded states are observable.
- Keyboard-only live create-to-confirm reaches canonical detail with focus, announcements, value retention, and no inaccessible dead end.
- Both themes and all four widths pass contrast/layout/overflow assertions.
- Existing BFF auth/correlation/idempotency/limit/timeout and service/event/data contracts remain intact.
- Hardcoded application color/local style-system negative probes reject without worktree residue.
- Relevant lint, typecheck, tests, and production build pass without weakened gates.
- `npm run demo:guard` passes before and after; only `scripts/wave-a-compose.mjs`/`linercore-wave-a` is used.
- `artifacts/w2-02-live/` maps every requirement/story to commands and durable results.
- `aidlc-audit` and `erp-fidelity-audit` are green with unmasked exit codes.
- Backlog cites the evidence path; historical W1 blocked/waived evidence remains unchanged.

### Expected demo

On the isolated Wave A edge route, authenticate, open the shared-shell Booking list, show loading and one controlled recovery state, create a booking entirely by keyboard, validate, price, confirm, and open detail. Switch themes and demonstrate narrow/wide layouts. Then show negative lint rejection, the evidence manifest, both green audits, and pre/post demo-guard results while the manager demo at port 8088 remains available.

## Go/No-Go Checkpoints

| Checkpoint | Go condition | No-go response |
|---|---|---|
| Construction start | Baseline and demo guard verified; design artifacts approved | Stop and preserve evidence; no stack mutation |
| Shared boundary | Focused tests and negative probes green | Fix in-scope boundary before route migration acceptance |
| Canonical UI | Duplicate presentation inactive; route/component checks green | Keep Bolt open; do not begin final evidence claims |
| Live start | Static/build checks green; pre-demo guard green | Preserve failure; do not operate Wave A |
| Audit | Complete evidence and post-demo guard green | Keep backlog acceptance-pending |
| Closure | Both audits green, W1 truth confirmed | Update backlog only here |

## Construction Handoff

Construction receives one Bolt and one Unit. All configured Construction stages run for the same vertical boundary. No worker may split audits, evidence, package adoption, or demo safety into a separately completed Bolt.

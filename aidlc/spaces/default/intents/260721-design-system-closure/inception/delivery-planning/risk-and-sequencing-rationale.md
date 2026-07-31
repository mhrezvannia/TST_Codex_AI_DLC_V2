# Risk and Sequencing Rationale — W2-02 Design-System Closure

## Planning Basis

This rationale sequences the one Unit defined by `unit-of-work.md` and `unit-of-work-dependency.md`, using the traceability in `unit-of-work-story-map.md`. It preserves the outcomes and gates in `requirements.md`, `stories.md`, `mockups.md`, and `components.md`, and applies the risk-based, tests-alongside, canonical-live practices in `team-practices.md`.

## Method Choice

The Bolt uses a **risk-first plus walking-skeleton** sequence. The highest risks are boundary drift, duplicate presentation ownership, and acceptance that appears green without exercising the canonical shell-to-service path. Addressing those risks early makes the final live journey credible while keeping every change inside one vertical closure Bolt.

WSJF is not used. There is one non-separable Unit and one Bolt, so economic ranking would create false precision without changing order. Story dependencies and hard acceptance constraints supply the useful order.

## Internal Sequence

1. Protect the manager demo and characterize current shared-package, shell, Booking, BFF, test, and lint behavior.
2. Close the shared `packages/ui` and application anti-drift boundary with focused tests and non-writing negative probes.
3. Migrate the canonical shell Booking list/create/detail compositions and states while preserving the BFF and service contracts.
4. Run focused regression, lint, typecheck, test, and production-build gates before starting live acceptance.
5. Prove the authenticated create-to-confirm walking skeleton through the real BFF/backend on `linercore-wave-a`.
6. Complete the state, theme, viewport, keyboard, focus, announcement, overflow, and accessibility matrix on the same running route.
7. Retain the final demo guard and unmasked audit outputs, then update backlog status only if all evidence is green.

This is an internal confidence sequence, not a multi-Bolt DAG. The approved one-node dependency graph remains unchanged.

## Risk Register and Go/No-Go Controls

| Risk | Impact | Early signal | Mitigation and go/no-go control |
|---|---|---|---|
| Duplicate Booking UI or a second canonical route survives | Violates the one-shell contract and makes proof ambiguous | Duplicate landmarks, navigation, theme, or route compositions | Inventory both apps first; retain `apps/booking` BFF endpoints while decommissioning/redirecting duplicate presentation. Do not start live acceptance until canonical ownership is unambiguous. |
| `@erp/ui` is declared but not actually rendered | W2-02 appears complete while the reference module still drifts | Import/DOM inventory finds raw applicable presentation | Add only proven generic gaps to `packages/ui`; require focused render tests and live DOM evidence before passing shared-boundary checkpoint. |
| CSS literals or local `CSSProperties` systems evade lint | Drift reappears outside the migrated files | Positive lint passes but injected probe is not rejected | Apply app-wide applicable TS/TSX/CSS enforcement and run non-writing negative probes. A probe that does not fail is a no-go. |
| Booking BFF/auth/correlation/idempotency behavior regresses | Canonical UI no longer represents the real workflow | Contract test, network trace, or lifecycle action fails | Preserve C4/C5 interfaces; characterize first; make only traced compatibility fixes. Focused regression and production build must pass before Compose proof. |
| Local Docker, Bun, Yarn, browser, image, port, or test-data prerequisite is unavailable | Live closure cannot be reproduced | Doctor/preflight or wrapper command fails | Record the exact failure, avoid stack substitution, and keep W2-02 acceptance-pending until the local prerequisite is restored. |
| Wave A verification disturbs the manager demo | User-visible demo outage | Pre/post `demo:guard` failure or forbidden Compose project name | Run the guard before and after; operate only through `scripts/wave-a-compose.mjs` and `linercore-wave-a`. Any guard failure is a hard no-go. |
| Difficult UI states are nondeterministic | State matrix becomes flaky or incomplete | Loading/denied/degraded state cannot be reliably observed | Use documented request interception or controlled service conditions on the running canonical route; retain method and network evidence. Never substitute a detached page. |
| Evidence packaging or audit output masks a failure | False closure and unreproducible review | Missing exit code, unresolved manifest link, incomplete requirement map | Capture direct command/exit results and manifest every artifact. Any missing item keeps the Bolt open and forces affected proof plus final guard/audits to rerun. |
| Historical W1 waiver is rewritten as PASS | Program record becomes false | Backlog/audit language labels W1 live proof green | Treat W1 blocked/waived evidence as immutable; reviewers explicitly compare final wording. Any reclassification is a no-go. |

## Completion Decision

The Bolt can close only when all six stories, FR-001 through FR-012, and NFR-001 through NFR-009 pass together. Partial implementation, static-only checks, happy-path-only proof, or a waived audit does not qualify. A failed gate is retained, corrected only within scope, and rerun with the final demo guard and both audits.


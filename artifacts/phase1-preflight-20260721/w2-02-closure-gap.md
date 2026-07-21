# W2-02 Acceptance Gap

Date: 2026-07-21

Baseline: `integ/main-reconciled` at `fc502a986edd62cd50267a38db9f4599ea036d0c`

Result: **BLOCKED**

W2-02 is merged in part, but its statement cannot yet be closed against the
observed Definition of Done. This is an acceptance gap, not a rollback of the
design-system package already delivered.

## Verified Passing

- `packages/ui` contains the shared token and primitive foundation.
- Focused Vitest run for `packages/ui` and `apps/booking`: 7 files and 49 tests passed.
- TypeScript checks passed for `packages/ui` and `apps/booking`.
- ESLint passed for `apps/booking` and `packages/ui/src`.
- Booking TSX contains zero hardcoded hex colors and zero local
  `CSSProperties` style systems.
- A non-writing lint probe that introduced `#ff0000` was rejected as expected.

## Blocking Observations

- Booking TSX does not import or render `@erp/ui` primitives; the package is
  referenced only as a dependency.
- Booking screens still use raw `button`, `input`, `select`, and `table`
  elements with the local `booking-*` class system.
- No Booking async surface renders the shared `Skeleton` primitive.
- No formal live evidence package proves the keyboard-only create-to-confirm
  journey, both themes, or loading/empty/error states under network changes.

These observations fail the W2-02 requirement that Booking be the migrated
reference application. Passing package tests and the color lint rule alone do
not satisfy that live requirement.

## Required Closure Unit

Before W4-01 starts its module-wide uplift:

1. Migrate Booking screens to the existing `@erp/ui` primitives and token API.
2. Add stable loading Skeletons without regressing empty and error states.
3. Run the keyboard-only create-to-confirm workflow on the Compose stack.
4. Capture light and dark theme contrast evidence and responsive screenshots.
5. Re-run the lint rejection proof, relevant tests, production build,
   `aidlc-audit`, and `erp-fidelity-audit`.

The historical W2-02 implementation remains preserved. Closure should be a
focused completion unit on the W2-02 intent, not an umbrella redesign.

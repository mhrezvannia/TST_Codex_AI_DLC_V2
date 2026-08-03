# Quality Gates

## Design gate

- Business scope and ownership trace to approved requirements.
- Shared shell and design authority are named.
- Every element maps to a shared primitive/token or justified platform gap.
- Loading, empty, denied, validation, pending, success, conflict, error,
  degraded, stale, and recovery states are addressed where applicable.
- Mobile, tablet, desktop, keyboard, focus, announcements, contrast, and reduced
  motion are specified.

## Code gate

- No duplicated shell, authentication layout, global navigation, or canonical
  frontend.
- No unauthorized hardcoded colors or local theme system.
- Shared controls come from the approved UI package.
- Domain components contain domain behavior rather than copied primitives.
- Commands prevent duplicate submission and preserve recoverable context.
- Authorization and provider failures retain their true meaning.

## Verification gate

- Static checks reject forbidden local styles and imports.
- Component and integration tests cover primary and recovery states.
- Automated accessibility checks pass; keyboard/focus receives manual review.
- Visual regression covers approved breakpoints.
- Integrated browser tests exercise real service data and degradation.
- Shared-package changes pass consumer compatibility checks.

## Evidence language

Use `PASS` only for observed evidence, `BLOCKED` for unmet dependencies, and
`NOT APPLICABLE` with a reason. Never convert a design intention, mock,
screenshot, test stub, or unavailable environment into a PASS.

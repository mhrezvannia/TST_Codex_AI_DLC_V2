# Frontend Components - U08 Quality Gates

## Source Trace

This U08 frontend impact design derives from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

U08 has no product UI ownership. Its frontend concern is the quality gate surface for `apps/auth`, `apps/reference-data`, and approved `@erp/*` packages.

## Frontend Gate Surfaces

| Surface | Required gate behavior |
|---|---|
| `apps/auth` | TypeScript strict checks, lint, tests, auth-flow accessibility-relevant checks where configured. |
| `apps/reference-data` | TypeScript strict checks, lint, tests, reference workspace/form/accessibility-relevant checks where configured. |
| `@erp/ui` | Component tests and lint/type checks for shared UI components. |
| `@erp/api-core` | Type checks and tests for BFF/client request handling. |
| `@erp/auth` | Type checks and tests for session/auth helpers. |
| `@erp/transformers` | Tests for DTO/view model transformations. |
| `@erp/shared-types` | Type checks and contract alignment checks. |

## Frontend CI Workflow

```text
Frontend path changes
  -> restore Yarn cache
  -> install from yarn.lock
  -> run workspace type checks
  -> run lint
  -> run targeted tests
  -> run accessibility-relevant checks where configured
  -> publish evidence
```

## Frontend Gate Rules

FBR-U08-001: Frontend gates must use Yarn, not npm or pnpm.

FBR-U08-002: TypeScript strict checks must run for affected frontend apps and packages.

FBR-U08-003: Lint must run for affected frontend apps and packages.

FBR-U08-004: Tests must run for affected frontend apps and packages where configured.

FBR-U08-005: Accessibility-relevant checks must cover labels, keyboard operation, focus behavior, validation/error text, live status, and color-independent status where practical.

FBR-U08-006: A frontend gate failure for an affected required package/app blocks merge.

FBR-U08-007: Prohibited frontend libraries or package managers must fail the gate.

## Evidence View Model

U08 may expose quality-gate evidence to later status views or approval summaries:

| Field | Purpose |
|---|---|
| `appOrPackage` | Affected frontend target. |
| `checkName` | Type, lint, test, or accessibility-relevant check. |
| `status` | Passed, failed, skipped, or unknown. |
| `summary` | Short result summary. |
| `evidencePath` | CI artifact/log path. |
| `required` | Whether failure blocks merge. |

## Non-Goals

- No frontend feature implementation.
- No replacement for U06 UI behavior.
- No custom package manager.
- No manual-only quality gate.

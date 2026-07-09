# Accessibility Checklist - Shared Platform Local Functionality

## Context

This accessibility checklist consumes `wireframes`, `user-flow`, `stories`, `requirements`, and `team-practices`. It targets the Shared Platform Reference Data workbench and its supporting auth, seed, publication, contract, and readiness screens.

## Baseline

| Requirement | Target |
| --- | --- |
| Standard | WCAG 2.1 AA baseline. |
| Keyboard | Core flows are usable without a mouse. |
| Screen reader | Headings, landmarks, tables, dialogs, status changes, and errors are announced. |
| Focus | Focus moves predictably on dialog open/close, validation error, denied access, and async updates. |
| Color | No status relies on color alone. |
| Forms | Labels, required fields, validation summaries, and field errors are explicit. |

## Screen Checklist

| Screen | Checklist |
| --- | --- |
| Auth sign-in/session | `h1`, main landmark, keyboard-reachable sign-in/sign-out, local bypass visibly labelled, no token exposure, session fields in description-list form. |
| Reference Data workbench | `h1`, labelled reference-set navigation, table caption/header cells, selected row announced, permission banner announced, action states named. |
| Create/edit drawer | Dialog labelled by heading, focus enters first editable field, validation summary uses alert behavior, first invalid field receives focus, Escape does not discard unsaved changes silently. |
| Deactivate dialog | Dialog labelled by destructive action heading, reason input required, confirm disabled until valid, impact text announced before action. |
| Seed runs | Mode selector labelled, dry-run/apply distinction textual, run history table captioned, failed row detail linked from table. |
| Publication status | Region labelled `Publication status`, pending/published/retrying/failed text visible, retry action labelled, status changes announced. |
| Local readiness | Status groups have headings, failures appear in alert region, each blocker includes action-oriented remediation text. |

## Keyboard Acceptance Criteria

1. User can sign in, inspect session, sign out, and return to the workbench using keyboard only.
2. User can search, toggle inactive records, select a record, and inspect detail/history/publication status using keyboard only.
3. Authorized user can open create/edit drawer, submit valid data, recover from validation errors, and close the drawer using keyboard only.
4. Authorized user can open deactivate dialog, enter reason, cancel, or confirm using keyboard only.
5. User can run seed dry-run/apply flow through labelled controls and confirmation dialog.
6. User can open retry action for failed publication status if permitted.

## Screen Reader Acceptance Criteria

1. Workbench announces current reference set and selected record.
2. Permission state is announced as writable, read-only, denied, or unavailable.
3. Field validation errors are announced with field names and recovery text.
4. Mutation success announces that list/detail/history/publication status refreshed.
5. Local readiness blockers are announced as blocker states, not generic failures.

## Error State Checklist

| Error | Accessibility requirement |
| --- | --- |
| Missing session | Focus sign-in heading or action; explain return path. |
| Missing permission | Alert/region announces denial reason and correlation id. |
| Backend unavailable | Alert includes service name and retry/recovery hint. |
| Validation failure | Alert summary and field-level errors are linked or adjacent. |
| Stale version | Conflict message describes reload/compare action. |
| Publication failed | Failed status is text, retry control has accessible label. |
| Seed partial failure | Failed row table includes set, key, and error. |

## Verification Notes

- Later implementation should include focused accessibility checks for form labels, table semantics, dialog focus, and keyboard flows.
- Manual smoke should include one keyboard-only mutation path and one screen-reader-oriented inspection path.
- Quality evidence should not claim accessibility readiness until these checks are run against the implemented UI.

## Review

Verdict: READY

Inline fallback review finds the checklist aligned with `wireframes`, `user-flow`, `stories`, `requirements`, and `team-practices`. It is scoped to the Shared Platform UX that must become locally functional.


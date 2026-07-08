# Accessibility Checklist - Shared Platform MVP

## Source Trace

This checklist applies WCAG 2.1 AA to the refined UX defined from `wireframes.md`, `user-flow.md`, `stories.md`, `requirements.md`, `team-practices.md`, and `refined-mockups-questions.md`.

## Global Requirements

| Check | Applies to | Acceptance evidence |
|---|---|---|
| One h1 per route | All routes | Heading audit confirms one page-level h1. |
| Logical heading order | All routes | h2/h3 sections do not skip hierarchy. |
| Landmarks | Auth and reference apps | `header`, `nav`, `main`, `aside`, `footer` used where appropriate. |
| Skip link | App shells | First focusable element skips to main content. |
| Visible focus | All interactive elements | Focus indicator visible with 3:1 contrast. |
| Keyboard operation | All workflows | Sign in, sign out, navigation, search, detail, form, publish, event status, and contract tabs work without mouse. |
| No keyboard trap | Dialogs, menus, tabs | Escape/close/back path available; modal focus returns to trigger. |
| Labels | Forms and controls | Every input has visible label or accessible name. |
| Error text | Forms and auth states | Errors are written in text and associated with fields/status. |
| Live regions | Dynamic status | Auth errors, validation summary, event status, and freshness warnings use polite announcements. |
| Contrast | Text and UI | Normal text 4.5:1, large text 3:1, UI components 3:1. |
| Color independence | Status and validation | Status uses text/icon, not color alone. |
| Responsive zoom | Apps | Layout remains usable at 200% browser zoom and mobile widths. |

## Auth Flow Checks

| Check | Requirement |
|---|---|
| SSO action | Button is reachable by keyboard and has visible label. |
| Redirect/loading | Loading status is announced without shifting focus unexpectedly. |
| Access denied | h1, explanation, requested app, and correlation id are readable and copyable where safe. |
| Request access | Action has clear label and success/error state. |
| Sign out | Confirmation dialog traps focus and returns focus after close. |

## Reference Workspace Checks

| Check | Requirement |
|---|---|
| Reference-set navigation | `nav` is labelled and active item is programmatically identifiable. |
| Table semantics | Native table, caption, column headers, row selection keyboard support. |
| Search/filter | Controls have labels, preserve state on error, and announce result count. |
| Empty state | Text explains the selected reference set and allowed next action. |
| Read-only state | Disabled or hidden mutating actions include visible reason. |
| Mobile lookup | Result cards expose the same essential labels as table columns. |

## Form Checks

| Check | Requirement |
|---|---|
| Field labels | All fields have persistent visible labels. |
| Required fields | Required state is announced and not color-only. |
| Validation summary | Summary appears before fields, is focusable, and links to invalid fields. |
| Inline errors | Error text appears near field and is associated with the control. |
| Draft preservation | Validation/network failure does not clear entered data. |
| Confirmation dialogs | Publish/deactivate/reactivate dialogs name the affected record and consequence. |
| Sensitive fields | Party/Customer PII fields include classification/access cue where required. |

## Event and Contract Checks

| Check | Requirement |
|---|---|
| Event status | Pending, published, failed, and stale states use text and live-region updates. |
| Copy actions | Copy event id and correlation id buttons have accessible names. |
| Contract tabs | Tabs follow accessible tablist/tabpanel pattern or native equivalent. |
| Code examples | OpenAPI/Avro examples are readable by screen readers or have text alternatives. |
| Compatibility status | Pass/fail/warning is text-based and not color-only. |

## Testing Approach

- Run automated accessibility scan in CI where configured.
- Keyboard-test sign-in, access denied, reference lookup, create/edit, publish, event status, and contract views.
- Test with Windows NVDA or equivalent screen reader for the core flows.
- Test at 200% zoom and at mobile, tablet, and desktop breakpoints.
- Include accessibility assertions in frontend tests for labels, roles, focus management, and error announcements where practical.

## Known Follow-Ups

- Exact field-level labels and validation messages for each reference set must be finalized during functional design.
- Final color contrast evidence depends on the concrete `@erp/ui` token values in implementation.
- Full mobile create/edit accessibility is out of MVP scope unless mobile editing is approved later.

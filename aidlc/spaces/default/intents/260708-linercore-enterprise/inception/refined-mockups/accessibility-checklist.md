# Accessibility Checklist - LinerCore Enterprise

## Source Context

This checklist consumes `wireframes.md`, `user-flow.md`, `stories.md`, `requirements.md`, and `team-practices.md`. It applies to all refined mockup routes and components for the enterprise UI.

## Baseline

Target: WCAG 2.1 AA.

The enterprise UI is operational and data dense, so accessibility must be built into navigation, tables, forms, status updates, exception workflows, timelines, and right-side evidence rails from the first implementation slice.

## Global Checklist

| Area | Requirement | Applies to |
|---|---|---|
| Landmarks | Each route has header, nav, main, and complementary/aside landmarks where used | All routes |
| Skip link | First focusable item skips to main workspace | All routes |
| Headings | One h1 per route; nested h2/h3 follow visual hierarchy | All routes |
| Keyboard | All controls, tables, row actions, tabs, steppers, drawers, and modals are keyboard reachable | All routes |
| Focus | Focus state is visible and not color-only | All interactive elements |
| Labels | Inputs, selects, buttons, icon buttons, and status controls have accessible names | Forms/navigation |
| Error text | Field errors are tied to fields and summarized at form level | Booking, pricing, movement, D&D, admin |
| Status updates | Async pricing, movement status, D&D result, save/publish, and health changes use polite announcements | Dynamic panels |
| Contrast | Text, icons, borders, status chips, and focus outlines meet contrast requirements | Visual system |
| Non-color signals | Success/warning/error/manual/read-only states include text or icon plus color | Status chips/tables |

## Route-Level Checklist

### Enterprise Work Queue

- Work table supports keyboard sorting, filtering, row expansion, and row action menu.
- Severity uses text label plus icon.
- Runtime health updates are announced without stealing focus.
- Empty state is concise and includes module shortcuts permitted for the user.

### Pricing And Agreement

- Agreement tabs use keyboard arrow navigation.
- Inline edit fields have labels, validation text, and save/cancel controls.
- Pricing simulation results are announced after completion.
- D&D rule conflicts are listed in text and link to the affected rule fields.

### Booking Creation And Confirmation

- Booking stepper is an ordered list with current, blocked, completed, and overridden states.
- Pricing evidence rail updates are announced.
- Confirmation remains disabled with a text reason until gates pass.
- Manual fallback drawer traps focus and returns focus to the originating control.

### Container Journey And Movement Status

- Timeline is an ordered list with event type, occurred time, received time, source, and validation state.
- Movement capture form supports full keyboard entry and error recovery.
- Duplicate, late, and out-of-order events include text labels and icons.
- Published status event links expose contract/audit details to screen readers.

### D&D Outcome

- Trigger evidence and Charge calculation are separate labelled regions.
- Free time, chargeable days, rate, total, and rule ID are readable as text, not only tiles.
- Manual review action explains why review is required.
- CorrelationId and request/result IDs are copyable with accessible labels.

### Platform Administration

- Reference data tables expose header semantics and row-level edit actions.
- Capability assignment controls identify user, role, capability, module, and effect.
- Event/outbox status panels indicate freshness and lag in text.

### Operations And Observability

- Health grid tiles expose service name, state, last check, and affected flows.
- Flow evidence pass/fail state is text visible.
- Runbook links are descriptive.
- Logs/traces links include correlation or object context.

## Responsive Accessibility

| Breakpoint | Requirement |
|---|---|
| Desktop | Full keyboard traversal through left rail, top bar, workspace, evidence rail |
| Tablet | Collapsed evidence drawer is reachable, labelled, and focus-trapped when modal |
| Mobile | Triage, approvals, search, and read-only details remain usable without horizontal scrolling |

## Acceptance Criteria For Later Build

- Automated accessibility tests run for route smoke coverage.
- Manual keyboard walkthrough is performed for booking, pricing, movement, D&D, admin, and operations workflows.
- Color contrast is checked against the actual implemented tokens.
- Screen reader labels are verified for icon rail, journey ribbon, stepper, timelines, drawers, and status chips.
- No mock screen is accepted if its inaccessible pattern would block keyboard or screen reader users.

## Source Traceability

| Source | Accessibility implication |
|---|---|
| `wireframes.md` | Defines core screens, rails, tables, and timelines requiring accessible structure |
| `user-flow.md` | Defines state changes and error recovery requiring announcements and focus management |
| `stories.md` | Defines user-visible workflows requiring testable UX acceptance |
| `requirements.md` | Requires real authenticated workflows, auditability, security, and no fake completion |
| `team-practices.md` | Requires testable, enterprise-ready outputs aligned with existing frontend stack |


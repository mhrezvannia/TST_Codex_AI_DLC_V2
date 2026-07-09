# Design System Mapping - Shared Platform Local Functionality

## Context

This design-system mapping consumes `wireframes`, `user-flow`, `stories`, `requirements`, and `team-practices`. It maps the refined Shared Platform UX to reusable UI primitives without inventing a marketing-style surface.

## UI Principles

1. Treat Shared Platform as an internal operations tool.
2. Keep Reference Data administration dense, scannable, and predictable.
3. Preserve a stable workbench layout so loading, permissions, and errors do not shift the page.
4. Use visible status text with icons/chips, never color alone.
5. Keep browser traffic behind BFF routes; UI components do not directly call backend services.

## Component Mapping

| UX element | Design-system primitive | Expected implementation |
| --- | --- | --- |
| Top-level shell | App shell, toolbar, status chips | Existing Next.js app layout with shared tokens and correlation id display. |
| Reference-set navigation | Side nav, listbox, segmented menu on mobile | Stable set list with selected state and counts. |
| Search and filters | Text input, checkbox, pagination controls | Search box, include inactive checkbox, page controls. |
| Records table | Data table with row actions | Backend-backed rows, selected row, status columns. |
| Detail panel | Description list, tabs/sections | Record metadata, history, publication, correlation id. |
| Create/edit drawer | Dialog/drawer, form fields, validation summary | Shared form for create and update with immutable key handling. |
| Deactivate confirmation | Modal dialog, destructive action button | Required reason, clear impact text. |
| Seed runs | Toolbar, data table, confirmation dialog | Dry-run/apply selector, run history, failed-row detail. |
| Publication status | Status chip, timeline/list, retry button | Pending/published/retrying/failed states. |
| Readiness dashboard | Status table, alert region, evidence links | Prerequisite, service, and quality-gate status. |

## Tokens and Visual Style

| Token area | Guidance |
| --- | --- |
| Spacing | Compact 8px rhythm for tables/forms; avoid large marketing spacing. |
| Radius | 4px to 8px for buttons, inputs, panels, and dialogs. |
| Typography | Small internal-tool headings inside panels; reserve large type for page headings only. |
| Color | Neutral base with semantic status colors only; all status must include text. |
| Layout | Full-width operational surfaces, not nested decorative cards. |
| Density | Table and detail content optimized for repeated scanning. |

## Status Semantics

| Status | Text | Icon intent | Color role |
| --- | --- | --- | --- |
| Ready | `Ready` or `Published` | check | success |
| Pending | `Pending` | clock | warning/neutral |
| Retrying | `Retrying` | refresh | warning |
| Failed | `Failed` | alert | danger |
| Blocked | `Blocked` | stop/alert | danger |
| Read-only | `Read-only` | lock | neutral/warning |
| Local bypass | `Local bypass` | key/alert | warning |

## Responsive Mapping

| Area | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Workbench shell | Single-column sections. | Nav above records, detail below or side. | Three-column nav/table/detail. |
| Records | Stacked record summaries. | Table with fewer columns. | Full table. |
| Detail | Below selected record. | Below or right column. | Persistent right panel. |
| Drawers | Full-screen dialog. | Wide drawer. | Side drawer. |
| Readiness | Stacked status groups. | Two-column groups. | Three-column status grid. |

## Implementation Constraints

- Mutation controls must have disabled, loading, success, validation-error, and service-error states.
- Components should accept explicit permission and correlation-id props rather than infer global state.
- Shared components should live in existing workspace packages where appropriate.
- Reference Data app must use BFF route handlers for backend and identity calls.
- Auth bypass indicators must only render from server-confirmed local profile state.

## Review

Verdict: READY

Inline fallback review finds this mapping consistent with `wireframes`, `user-flow`, `stories`, `requirements`, and `team-practices`. It gives implementation a clear internal-tool design posture and avoids adding unrelated landing-page or downstream-module UI.


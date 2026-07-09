# Design System Mapping - Charge & Customer Agreement

## Source Alignment

This mapping follows `team-practices.md`, `requirements.md`, `stories.md`, and existing app workbench patterns.

## Component Mapping

| UI need | Component pattern |
| --- | --- |
| Page shell | Existing app-style header plus main workspace. |
| Status/warnings | Inline banner with text status and optional action. |
| Filters | Labelled text/select/date controls. |
| Agreement list | HTML table with caption and column headers. |
| Detail panel | Definition list plus sectioned terms/activity panels. |
| Editor | Form with fieldsets or grouped sections. |
| Charge terms | Editable table rows with stable column widths. |
| Actions | Text buttons for commands; disabled state with text explanation nearby. |
| Lookup result | Compact result section with terms table and no-match state. |

## Visual Tokens

| Token | Guidance |
| --- | --- |
| Border radius | 4-6px, matching existing restrained app style. |
| Palette | Neutral operational base with clear status accents; avoid one-note color theme. |
| Typography | Compact headings inside workbench panels; no hero-scale type. |
| Spacing | Dense but readable 8/12/16/24px rhythm. |
| Tables | Stable columns and horizontal overflow handling on narrow screens. |

## Existing Pattern Reuse

The first implementation can reuse style approaches from `apps/reference-data/app/ReferenceDataWorkbench.tsx`: header, status banner, table, detail aside, form panel, and inline status text. Charge Agreement should improve domain-specific workflow without introducing a new visual system.

## Implementation Notes

1. Use semantic HTML before introducing custom components.
2. Keep controls labelled and keyboard reachable.
3. Keep list/detail/editor dimensions stable to avoid layout shift.
4. Use text status labels in addition to any color.

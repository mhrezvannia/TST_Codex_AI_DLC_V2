# Accessibility Checklist - Charge & Customer Agreement

## Source Alignment

Checklist covers `requirements.md`, `stories.md`, `wireframes.md`, and `mockups.md`.

## Required Checks

| Check | Acceptance |
| --- | --- |
| Page title | One `h1` identifies Customer Agreements. |
| Landmark structure | Header, nav if present, and main regions are semantic. |
| Keyboard navigation | New, filter, row open, edit, add term, save, approve, and lookup controls are reachable by keyboard. |
| Focus management | Validation summary receives focus after failed submit; modal/confirm flows trap focus if introduced. |
| Labels | Every input/select/date control has a visible label. |
| Tables | Tables include captions or nearby headings, column headers, and row action labels. |
| Status text | Draft/Approved/Suspended/Expired are represented by text, not color alone. |
| Error text | Error messages identify the field and fix. |
| Loading state | Loading text does not replace the whole page or move focus unexpectedly. |
| Responsive behavior | Narrow screens preserve access through horizontal table overflow or stacked sections. |

## Test Targets

1. Render workbench and assert `h1`, form labels, table headers, and primary buttons.
2. Submit invalid form and assert validation summary text.
3. Approve invalid agreement and assert no status change plus accessible error.
4. Active lookup no-match state is announced as text.
5. Keyboard-only manual pass before module completion.

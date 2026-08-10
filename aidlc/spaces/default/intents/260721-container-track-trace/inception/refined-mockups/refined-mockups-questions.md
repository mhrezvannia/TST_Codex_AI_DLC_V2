# Refined Mockups Questions - W2-04 Container Movement

## Context

These questions refine, but do not replace, `wireframes.md`, `user-flow.md`,
`stories.md`, `requirements.md`, and `team-practices.md`. The shared shell,
`@erp/ui`, canonical list/detail routes, four DCSA codes, required UI states,
responsive widths, themes, WCAG behavior, and W2-04 ownership are already fixed.

## Questions

### Q1. Capture placement by width

How should the capture form adapt across the required widths?

- A. Persistent right action panel at 1024/1440, accessible drawer at 768, and in-flow expansion immediately after the trigger at 375 (recommended)
- B. In-flow form at every width
- C. Drawer/dialog at every width
- X. Other (please specify)
- `[Answer]:` A. Persistent right action panel at 1024/1440, accessible drawer at 768, and in-flow expansion immediately after the trigger at 375 (recommended)

### Q2. Timeline information density

How should expected and actual movements be presented on journey detail?

- A. One ordered semantic timeline with code + readable label always visible and occurred/received/source details progressively disclosed (recommended)
- B. Separate Expected and Actual tabs
- C. One dense table with every technical field always visible
- X. Other (please specify)
- `[Answer]:` A. One ordered semantic timeline with code + readable label always visible and occurred/received/source details progressively disclosed (recommended)

### Q3. Next-code assistance

How should the four-code capture selector help Elena without replacing server authority?

- A. Preselect the next legal code and explain it, but keep all four codes selectable so server rejection remains observable (recommended)
- B. Disable every code except the next legal code
- C. Leave the selector blank with no next-code suggestion
- X. Other (please specify)
- `[Answer]:` A. Preselect the next legal code and explain it, but keep all four codes selectable so server rejection remains observable (recommended)

### Q4. Success and rejection feedback

What is the primary feedback pattern after capture submission?

- A. Persistent inline status/error summary with focus/live announcement; toast may supplement success but is never the only evidence (recommended)
- B. Toast-only success and error feedback
- C. Navigate away to a separate result page
- X. Other (please specify)
- `[Answer]:` A. Persistent inline status/error summary with focus/live announcement; toast may supplement success but is never the only evidence (recommended)

### Q5. Mobile list transformation

How should journey results render at 375 pixels?

- A. Semantic record list/cards with one named journey link, while 768+ keeps the compact table with intentional inner overflow (recommended)
- B. Keep the full desktop table with horizontal scrolling at all widths
- C. Show only equipment and lifecycle on mobile, hiding route/next-action data
- X. Other (please specify)
- `[Answer]:` A. Semantic record list/cards with one named journey link, while 768+ keeps the compact table with intentional inner overflow (recommended)

### Q6. Degraded capture policy

When lifecycle/next-move freshness cannot be confirmed, what should the detail
page allow?

- A. Show labelled last-known timeline, disable capture with a reason, and offer Retry; never accept a potentially stale command from the UI (recommended)
- B. Keep capture enabled with a warning and let the server decide
- C. Hide the entire journey detail until fresh data returns
- X. Other (please specify)
- `[Answer]:` A. Show labelled last-known timeline, disable capture with a reason, and offer Retry; never accept a potentially stale command from the UI (recommended)

## Fixed Design Inputs

- Navigation: `/container-movement` and
  `/container-movement/journeys/{id}` inside the shared authenticated shell.
- Page ownership additions remain only in
  `design-system/linercore/pages/container-movement.md`; no master,
  `packages/ui`, or shared-shell redesign.
- Forms use real session authority, live reference lookups, persistent labels,
  preserved values, field-associated errors, and DCSA/UN/LOCODE vocabulary.
- Verify loading, empty/not-found, retryable error, denied, populated,
  validation, duplicate, sequence, success, publication pending, Booking
  applied, and degraded states at 375/768/1024/1440 in light and dark themes.

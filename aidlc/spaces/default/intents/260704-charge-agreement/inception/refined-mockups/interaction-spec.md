# Interaction Specification - Charge & Customer Agreement

## Source Alignment

Interactions map to `stories.md`, `requirements.md`, `wireframes.md`, `user-flow.md`, and `team-practices.md`.

## User Actions

| Action | Trigger | Expected result |
| --- | --- | --- |
| Filter list | Change filter input/select | Agreement table updates without clearing selection unless selected row no longer matches. |
| Create agreement | Click New Agreement | Editor opens in create mode with empty draft and one term row. |
| Save draft | Submit valid editor form | Agreement persists as Draft and detail loads. |
| Edit agreement | Click Edit on Draft detail | Editor opens with current values. |
| Add charge term | Click Add Charge Term | New editable row appears with required fields. |
| Remove charge term | Click row remove control | Row is removed after confirmation only if persisted; unsaved row removes immediately. |
| Approve agreement | Click Approve | If valid, status becomes Approved; otherwise validation summary appears. |
| Suspend/Expire | Click lifecycle action | Status changes and active lookup excludes agreement. |
| Active lookup | Submit lookup inputs | Match or no-match result appears. |

## Validation Rules

| Rule | UI response |
| --- | --- |
| Missing customer | Inline field error and validation summary. |
| Valid to before valid from | Inline date error; save disabled or rejected. |
| No charge terms on approval | Approve disabled or rejected with summary. |
| Charge amount <= 0 | Inline amount error. |
| Term dates outside agreement dates | Inline term-date error. |
| Reference service unavailable | Banner plus retry; preserve draft. |

## Error Handling

| Error | Message pattern |
| --- | --- |
| 400 validation | "Fix the highlighted fields before saving." |
| 403 authorization | "You do not have permission to perform this action." |
| 404 agreement | "Agreement was not found or is no longer available." |
| 409 stale version | "This agreement changed since you opened it. Reload before saving." |
| 503 upstream | "A required service is unavailable. Your unsaved input is preserved." |

## Routing Recommendation

For the first slice, implement a single route:

`/` in `apps/charge-agreements`

The route hosts the workbench and BFF API route handlers under `/api/charge-agreements/*`. Separate detail routes can be introduced after the end-to-end flow is working.

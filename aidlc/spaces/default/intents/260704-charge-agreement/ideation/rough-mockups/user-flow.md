# User Flow - Charge & Customer Agreement

## Upstream Inputs

This flow consumes:

| Input | Flow effect |
| --- | --- |
| `intent-statement.md` | Centers the journey on commercial users creating approved charge agreements for Booking. |
| `scope-document.md` | Keeps the flow within agreement and charge-term management. |
| `intent-backlog.md` | Aligns the flow with CA-01 through CA-10, especially approval and active lookup. |

## Happy Path

```text
[Open Agreements]
        |
        v
[Search or filter list]
        |
        v
[Create new agreement]
        |
        v
[Select customer and validity]
        |
        v
[Add charge terms from Shared Platform refs]
        |
        v
[Save draft]
        |
        v
[Review agreement detail]
        |
        v
[Approve agreement]
        |
        v
[Run active lookup preview]
        |
        v
[Ready for Booking handoff]
```

Text fallback: the user opens agreements, creates a draft, selects shared reference data, adds charge terms, saves, reviews, approves, and validates that active lookup can return the approved terms.

## Branches and Recovery

| Step | Branch | Recovery |
| --- | --- | --- |
| Search/list | No matching agreements | Clear filters or create a new agreement. |
| Select customer/reference data | Reference service unavailable | Show non-destructive error and keep draft values editable. |
| Add charge term | Missing required field or invalid amount/date | Inline field error plus validation summary. |
| Save draft | API validation fails | Preserve form state and display server messages. |
| Approve | Agreement has no charge terms | Disable approve and show required action. |
| Active lookup | No approved agreement found | Display no-result state and link back to agreements. |

## State Model Visible to Users

| State | User meaning | Allowed next actions |
| --- | --- | --- |
| Draft | Agreement can be edited and is not available to Booking. | Edit, add terms, approve, delete if later allowed. |
| Approved | Agreement can be returned by active lookup. | Suspend, expire, view. |
| Suspended | Temporarily unavailable to Booking. | Reactivate if later supported, expire. |
| Expired | No longer active after validity window. | View, clone if later supported. |

## Keyboard Flow

1. Skip link to main content.
2. Primary action button: New Agreement.
3. Filter controls in left-to-right order.
4. Agreement table rows expose Open action per row.
5. Detail page actions are ordered Edit, Approve/Suspend/Expire.
6. Form submit buttons are reachable after fields and before validation summary fallback.

## First Slice Flow Boundary

The first implementation must prove list/detail/create-edit/approve/lookup. It does not need public tariffs, booking creation, invoicing, carrier connectivity, or index-linked pricing.

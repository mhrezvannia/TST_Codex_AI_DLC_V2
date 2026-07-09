# Refined Mockups - Charge & Customer Agreement

## Source Alignment

This artifact refines `wireframes.md`, `user-flow.md`, `stories.md`, `requirements.md`, and `team-practices.md` into an implementation-ready first UI slice.

## Primary Layout

First implementation should use a single workbench screen so the module becomes functional quickly:

| Region | Content | Behavior |
| --- | --- | --- |
| Header | Module title, local status, primary New Agreement action. | Always visible at top. |
| Status banner | Auth/write state and upstream service state. | Shows local bypass or service errors. |
| Filter/list panel | Customer, status, lane, valid-on filters and agreement table. | Selecting a row loads detail. |
| Detail panel | Agreement metadata, terms, lifecycle activity, action buttons. | Shows selected agreement or empty state. |
| Editor panel | Header form and charge-term rows. | Appears for create/edit mode. |
| Lookup panel | Booking-oriented active lookup preview. | Can be below list/detail or tabbed in the same page. |

## Screen States

| State | Required UI behavior |
| --- | --- |
| Loading | Show skeleton/compact loading text inside table/detail areas without layout shift. |
| Empty list | Show "No agreements match these filters" and a Clear Filters action. |
| No selection | Detail panel prompts user to select or create an agreement. |
| Create draft | Editor opens with blank header and one empty charge-term row. |
| Edit draft | Editor opens with persisted values and terms. |
| Validation error | Preserve form state, focus validation summary, mark invalid fields. |
| Approved detail | Edit disabled or limited; Suspend/Expire available where permitted. |
| Active lookup match | Show agreement number, status, validity, and terms. |
| Active lookup no match | Show no-match text and link to create/search agreements. |
| Upstream unavailable | Show non-destructive banner; do not discard user input. |

## Field Specification

| Field | Type | Required | Source |
| --- | --- | --- | --- |
| Agreement number | Text input | Yes | User-entered or generated later. |
| Customer | Select/search | Yes | Shared Platform `PARTY_CUSTOMER`. |
| Valid from/to | Date inputs | Yes | User-entered. |
| Trade lane | Select/search | Yes for lookup readiness | Shared Platform `TRADE_LANE`. |
| Commodity | Select/search | Optional initially, lookup dimension | Shared Platform `COMMODITY`. |
| Charge code | Select/search | Yes per term | Shared Platform `CHARGE_CODE`. |
| Basis | Select | Yes per term | Local enum: TEU, CONTAINER, SHIPMENT, BL. |
| Currency | Select/search | Yes per term | Shared Platform `CURRENCY`. |
| Amount | Decimal input | Yes per term | Positive decimal. |
| Notes | Text input | No | User-entered. |

## Product Review

Verdict: READY

Inline product-lead review completed because the configured reviewer subagent model is unavailable in this account. The refined mockups are scoped to the approved first slice, map to user stories, include validation/error states, and avoid deferred RMS features.

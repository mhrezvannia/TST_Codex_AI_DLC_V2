# Frontend Components - dnd-exact-historical-calculation

## Authority and scope

This UI contract refines approved `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, Application Design `components.md`, `component-methods.md`, and `services.md`, plus approved Refined Mockups and LinerCore authority.

The UI is evidence presentation within existing terms detail/audit compositions. It adds no evaluation panel, simulator, Booking trigger, shell, palette, font or shared primitive. Compatible UI/UX Pro Max accessibility/responsive/server-read advice is retained; marketing, chart-first, promotional animation and replacement styling are rejected.

## Component hierarchy and data contract

```text
DndTermsDetailPage
  DndTermsIdentityHeader
  SelectedVersionStatus
  CommercialTermsSection
  PricingBasisEvidenceSection
  PortTimezoneEvidence
  DndVersionHistory
  CollapsedEvaluationEvidence
```

`CollapsedEvaluationEvidence` consumes an authorised discriminated view:

| Discriminator | Required facts | UI treatment |
| --- | --- | --- |
| `success` | result/attempt ids, basis/source versions, timezone, days, rate/amount, correlation | Readable calculation sequence and exact links |
| `replay` | immutable result id, original calculation/source facts, replay label | Same facts plus textual Replay meaning |
| `unavailable` | correlation and affected provider only | Preserve terms facts; StatusStrip + Retry |
| `denied` | no count/identity/data | No-disclosure section state |

U04 later adds full failure disposition breadth without changing success/replay rendering.

## Interaction and state behavior

- Server components load authorised terms and selected version; evidence may load as a scoped discriminated section.
- `?version=<dndTermsVersionId>` selects immutable history directly. Selected and current are separate textual states.
- Agreement/Tariff evidence labels its discriminator and exact version/source links; absent inapplicable fields are not shown as `unknown` ids.
- The calculation reads as elapsed calendar days -> free days -> chargeable days -> flat daily rate -> amount, with currency on every money value.
- Port code has readable label when available; timezone shows exact IANA id. DCSA codes have readable meanings.
- Retry refreshes only the scoped evidence provider and cannot recalculate or create a charge.

## Responsive and accessibility contract

| Width | Composition |
| --- | --- |
| 375 | One continuous reading order; identifiers wrap; calculation is a labelled sequence; evidence follows terms |
| 768 | Evidence follows main content or uses an accessible disclosure; history tables use labelled inner overflow |
| 1024 | Main facts plus narrow evidence rail without overlay |
| 1440 | Compact two-region detail with controlled line length |

- Focus order follows headings and disclosure triggers; collapsed evidence communicates expanded state.
- Status meaning uses text plus token/icon, never color alone.
- Loading uses geometry-matched Skeleton; no spinner-only blank surface.
- Error/denied states retain correct heading semantics and do not erase known facts.
- Light/dark WCAG AA, 200% zoom, reduced motion, keyboard access and no mobile page overflow remain mandatory.

## Evidence state matrix

| State | Recovery | Status before live evidence |
| --- | --- | --- |
| Loading | Wait; terms remain stable | BLOCKED |
| Ready zero line | Read exact 0.00 evidence | BLOCKED |
| Ready positive line | Read exact calculation/source evidence | BLOCKED |
| Historical old/successor | Navigate exact version links | BLOCKED |
| Scoped unavailable | Retry evidence only | BLOCKED |
| Denied | No disclosed count/identity | BLOCKED |
| Not found/stale link | Return to preserved list/history | BLOCKED |

## API integration and traceability

The Charge BFF calls the approved detail/audit endpoints with server session and correlation. It forwards no internal service credential and performs no calculation. Evidence must match direct provider response and persisted ids after restart.

| Surface | Requirement/story coverage | Shared reuse | Status |
| --- | --- | --- | --- |
| Exact history/source facts | FR-04, FR-07, FR-10; US-03 | Detail, disclosure, StatusStrip | BLOCKED pending live Bolt |
| Zero/non-zero calculation sequence | FR-05, FR-07; AC-03-AC-05 | Typography/tokens/semantic lists | BLOCKED pending live Bolt |
| Responsive/a11y evidence | NFR-06 | Shell, focus, Skeleton, shared controls | BLOCKED pending Playwright |

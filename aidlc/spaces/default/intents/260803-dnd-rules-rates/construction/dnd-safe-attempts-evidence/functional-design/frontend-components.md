# Frontend Components - dnd-safe-attempts-evidence

## Authority and scope

This UI contract refines approved `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, Application Design `components.md`, `component-methods.md`, and `services.md`, plus approved Refined Mockups and LinerCore authority.

The UI renders authorised disposition evidence through existing terms detail/audit surfaces plus the exact Charge-owned `/charge-agreements/dnd/audit` route required for attempts with no terms id. It creates no evaluation command, raw-payload console, dashboard, chart, shell, palette, font or shared primitive. Compatible UI/UX Pro Max state/accessibility/responsive guidance is retained; marketing and decorative output is rejected.

## Component hierarchy and discriminated views

```text
DndAuditRoute /charge-agreements/dnd/audit
  EvidenceSearchForm
  EvidenceResultList | EvidenceTable
  EvidenceDispositionDetail
DndTermsDetailPage
  BusinessFacts
  CollapsedAuditEvidence
    EvidenceFilters
    EvidenceResultList | EvidenceTable
    EvidenceDispositionDetail
    ScopedEvidenceStatus
```

The D&D terms list provides a secondary `Evaluation evidence` link to the audit route. Exact attempt/correlation links preserve query state. The route remains inside the shared authenticated Charge Agreements shell with no journey ribbon.

| Discriminator | Visible business-safe facts | Forbidden/fallback behavior |
| --- | --- | --- |
| `success` | result, terms/source versions, calculation, correlation | No raw body/token |
| `replay` | original immutable result/source facts, Replay text | No recalculation |
| `noRate` | echoed applicability, reason, correlation | No fabricated terms/rate/calculation |
| `validation` | field/semantic category, request identity where parsed | No partial line |
| `conflict` | fingerprint disposition, correlation | No competing payload exposure |
| `inProgress` | in-progress meaning and correlation | No owner token/lease internals |
| `unavailable` | affected dependency category and correlation | Retry affected section only |
| `denied` | denial presentation only | No count, identifier, filters or result shape |

## Query and interaction rules

- Server authorization occurs before BFF/provider query. Denied composition receives no total/count/data props.
- Filters are bounded and explicit: attempt id, correlation, booking/equipment/closing event, outcome/time and terms id. Apply updates URL/server state; unknown/duplicate values normalize safely.
- Search form enforces one selective identity or a complete at-most-31-day range. It emits exact API query names and supports page 1+, size 25/50 and occurred-time ascending/descending sort.
- Empty means an authorised query has no results; filtered empty retains filters and offers Clear/edit. Neither is used for denied.
- Selecting evidence opens a readable detail/disclosure, not a raw JSON panel.
- Retry is available only for scoped provider unavailability. It does not repeat a pricing command.
- Known terms facts remain visible when the evidence provider fails.

## Designed states and recovery

| State | Composition | Recovery | Status |
| --- | --- | --- | --- |
| Loading | Stable Skeleton rows/detail | Wait | BLOCKED pending live evidence |
| True/filtered empty | Distinct copy; Clear for filtered | Adjust filters | BLOCKED |
| Ready dispositions | Text label + applicable facts | Inspect/navigate exact links | BLOCKED |
| Denied | No-disclosure section | Return to permitted content | BLOCKED |
| Unavailable | StatusStrip with correlation | Retry section | BLOCKED |
| Not found/stale attempt | Named missing link | Return to preserved terms/history | BLOCKED |

No design artifact, mock response or screenshot changes `BLOCKED` to `PASS`.

## Responsive and accessibility contract

- 375: filters expand in flow, results are labelled records, evidence detail follows trigger, identifiers wrap.
- 768: compact filters; table may use labelled inner overflow; detail uses accessible disclosure.
- 1024/1440: compact table/result list with secondary detail/evidence region and controlled line length.
- Status always pairs semantic token/icon with explicit outcome text.
- DCSA codes have readable labels; money has currency/basis; missing facts are explained by disposition rather than blank placeholders.
- Keyboard users can apply/clear filters, open/close disclosures and follow exact links in visual order with visible focus.
- Async loading/result/error announcements are concise; reduced motion, WCAG AA light/dark, 200% zoom and no page-level mobile overflow are required.

## API integration and security boundary

The Charge BFF calls `GET /api/charge-dnd-terms/audit` using exact single-valued parameters `attemptId`, `correlationId`, `bookingRef`, `equipmentId`, `closingMovementEventId`, `outcome`, `occurredFrom`, `occurredTo`, `dndTermsId`, `page`, `size`, and `sort`. It rejects unknown/duplicate/incompatible values before forwarding and maps the exact 200 page plus 400/401/403/404/503 envelopes. It never serializes service credentials, owner tokens, fingerprints beyond approved display, raw payloads or denied totals. The ten server discriminators and allowed-null matrix are exhaustive; an unknown discriminator is a route-level safe error, not a guessed status.

## Acceptance traceability

| UI outcome | Requirements/stories | Shared reuse | Status |
| --- | --- | --- | --- |
| Exact disposition evidence | FR-06, FR-08, FR-12; US-04 | Table/list, disclosure, StatusStrip | BLOCKED pending live U04 |
| No-disclosure denial | NFR-03, AC-10 | Shared denied semantics | BLOCKED pending real auth |
| Scoped recovery | NFR-04 | Skeleton, StatusStrip, Button | BLOCKED pending provider-degradation proof |
| Responsive/a11y matrix | NFR-06 | Shell/tokens/focus primitives | BLOCKED pending Playwright |

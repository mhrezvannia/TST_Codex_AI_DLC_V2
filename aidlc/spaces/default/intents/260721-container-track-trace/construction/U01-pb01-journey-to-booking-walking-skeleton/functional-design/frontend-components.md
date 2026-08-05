# Frontend Components - U01 PB-01 Journey-to-Booking Walking Skeleton

## Source Alignment

The component design implements U01 in `unit-of-work.md`, assigned UI stories
in `unit-of-work-story-map.md`, FR-03/06/11-13 in `requirements.md`, and the
read/capture boundaries in `components.md`, `component-methods.md`, and
`services.md`. It follows refined mockups and the LinerCore MASTER/session/page
record, but adds no shared primitive or shell redesign.

## Route and Component Hierarchy

```text
/container-movement
  ContainerMovementListPage (server)
    PageHeader + filter/search controls
    JourneyTable | EmptyState | RetryableError | DeniedState

/container-movement/journeys/[journeyId]
  ContainerJourneyDetailPage (server)
    JourneyHeader + lifecycle/next-action summary
    RouteEquipmentSummary
    MovementTimeline (expected + actual + rejection evidence)
    CaptureMovementPanel (client island)
      CaptureMovementForm
      InlineFieldErrors + ErrorSummary
      PendingNotice | SuccessNotice | ConflictNotice
    BookingLink
```

Booking detail receives only its owned `LatestContainerProgressPanel` change;
it shows pending/applied/retry/degraded latest status and the permission-aware
canonical CMM link, not the full timeline. The status projection stores
`bookingRef/containerRef`, not journey ID. The link enters the CMM-owned
`/container-movement/bookings/{bookingReference}/journey` resolver, which uses
the authorized booking-reference lookup and redirects to the stable detail URL.

## Data and State Ownership

- Server components call list/detail application use cases that freshly authorize `container-movement:read` before loading read-model data and render stable routes.
- `CaptureMovementForm` owns only draft fields, submission status, and returned field/conflict errors.
- Successful capture triggers server refresh/revalidation; no client-side duplicate journey cache is introduced.
- Error payload is a tagged union for validation, `DUPLICATE_MOVEMENT`, `OUT_OF_SEQUENCE_MOVEMENT`, authorization, and retryable infrastructure failure.
- No RTK/global store is used because the binding technical standard prohibits it and no shared client cache is needed.

## List Interaction

Columns: booking, equipment, POL -> POD, lifecycle, next action, last update,
and stable detail link. At narrow widths the existing responsive table pattern
preserves labels/reading order rather than turning into a decorative dashboard.
Search/filter state stays in URL query parameters for navigation recovery.

## Detail and Timeline Interaction

One h1 names the equipment journey and booking. Lifecycle and next action use
text plus existing semantic badges. The timeline renders expected LOAD/DISC,
seq-0 planned status, accepted GTOT seq-1, and the U01 rejection row/evidence as
distinct semantic items. Correlation/event IDs stay in a collapsed Audit
surface, not the primary workflow.

## Capture Form Contract

Fields: fixed/selected GTOT code, ACT classifier, equipment reference,
UN/LOCODE, occurrence time, source, idempotency key, and LADEN indicator.
Client validation improves immediacy but server/domain validation is authority.

On 409 `OUT_OF_SEQUENCE_MOVEMENT`, keep all values, place focus on the error
summary, announce it through the existing live-region pattern, state that LOAD
is required next, and link summary items to field/next-action guidance. On
success, announce Gated-out/GTOT and refresh timeline/next action. Interactive
controls use stable semantic test IDs only where existing project practice
requires them.

## Operational States and Accessibility

| State | UI behavior |
| --- | --- |
| Loading | Existing shell skeleton/progress semantics; no spinner-only content |
| Empty/not found | Explain no journeys/unknown identity and provide safe recovery navigation |
| Retryable error | Plain-language failure plus retry action; preserve route/form state |
| Denied | Explain missing read/capture permission; capture hidden/disabled as appropriate |
| Validation | Field-linked errors and top summary; entered values preserved |
| Pending | Disable repeat submit, announce progress, retain visible values |
| Success | Focus/announce updated lifecycle and next action |
| Rejection | Exact code meaning, original/current/required-next evidence, recovery action |

Keyboard order follows heading -> summary -> timeline -> capture -> Booking
link. Status never relies on color, long operational identifiers wrap, labels
remain programmatic, and light/dark tokens come only from the shared design
system. Evidence will cover 375/768/1024/1440 at the intent Exit Gate.

## API Integration

- `GET /api/container-movement/journeys` (authorized canonical list port)
- `GET /api/container-movement/journeys/{journeyId}` (authorized detail/timeline read model)
- `GET /api/container-movement/bookings/{bookingReference}/journey` (authorized canonical lookup used by the CMM web resolver)
- `POST /api/container-movement/journeys/{journeyId}/movements` (capture; typed accepted/409/403/validation responses)
- Booking uses its existing detail API extended by the Booking-owned latest projection.

These are the approved application routes; code generation adapts existing
controllers to them without introducing a public DCSA endpoint.

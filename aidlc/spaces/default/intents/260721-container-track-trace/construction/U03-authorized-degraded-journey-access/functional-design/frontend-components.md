# Frontend Components - U03 Authorized Degraded Journey Access

## Source Alignment

This UI design specializes U03 from `unit-of-work.md` and
`unit-of-work-story-map.md`, implements the state/accessibility requirements in
`requirements.md`, and retains `components.md`, `component-methods.md`, and
`services.md`. It follows the approved LinerCore MASTER/session guidance and
the Container Movement page override. No shared-shell or `packages/ui` change
is owned here.

## Component Hierarchy

U03 extends the U01 Container Movement list and detail routes only:

```text
ContainerMovementListPage
  JourneyListStateBoundary
  ReferenceFreshnessStrip
  JourneyTable / EmptyState / RetrySurface

ContainerMovementDetailPage
  JourneyHeader
  ReferenceFreshnessStrip
  JourneyFacts
  MovementTimeline
  CaptureMovementPanel
    CaptureAvailabilityNotice
    CaptureOutcomeSummary
  AuditEvidenceDisclosure
```

All primitives come from the synchronized shared UI package; U03 owns their
page composition and state wiring, not their implementation or the shell.

## Props and View State

`ReferenceFreshnessStrip` receives `fresh|last-known`, dependency-safe reason,
current dependency `checkedAt`, truthful `dataUpdatedAt` from the existing
journey `updatedAt`, capture-enabled state, and Retry callback. The UI labels
`dataUpdatedAt` as when journey data last changed, never as a reference
verification. It displays no raw provider URL or transport body.
`CaptureMovementPanel` receives the existing
journey/next-move props plus `captureEnabled` and a typed disabled reason:
permission denied, capability unavailable, or Reference Data unavailable. The
GET capability is a UI hint only; the POST never sends or trusts it and the
application independently re-authorizes capture.

The route-state union is:

- `loading`; `empty` or `not-found`; `ready-fresh`;
- `denied` from 403 `CMM_AUTHORIZATION_DENIED` with no protected payload;
- `identity-unavailable` from 503 `IDENTITY_DEPENDENCY_UNAVAILABLE` with Retry;
- `ready-last-known` after current read ALLOW plus Reference Data outage;
- `retryable-error` for CMM/database failures.

Direct capture outcomes add denied, `IDENTITY_DEPENDENCY_UNAVAILABLE`, or
`REFERENCE_DATA_UNAVAILABLE` to the U02 capture union. All preserve operator-
entered draft values, focus the persistent summary, state that nothing was
recorded, and never refresh/advance timeline.

The frontend API mirrors one exact response family:

- GET ready: required `kind=ready`, protected `data` including `dataUpdatedAt`
  mapped from existing journey `updatedAt`, `correlationId`, and
  freshness `{ state, checkedAt, captureEnabled, dependency?, reasonCode?,
  captureDisabledReason? }`;
- denied 403: `{ kind=denied, error: { code=CMM_AUTHORIZATION_DENIED,
  correlationId, retryable=false, guidance } }`, with no protected data;
- unavailable 503: `{ kind=dependency-unavailable, error: {
  code=IDENTITY_DEPENDENCY_UNAVAILABLE|REFERENCE_DATA_UNAVAILABLE,
  correlationId, retryable=true, guidance } }`, with no protected data.

`last-known` requires dependency/reason/last-verified values and capture off.
Only capture error variants retain local `preservedInput`; GET errors cannot
contain journey, booking, equipment, or lifecycle fields.

## Interaction and Recovery

- Customer Service can list/open but sees capture disabled by permission; a
  forged/deep-link POST still produces the focused 403 outcome and denial audit.
- With Identity unavailable, a fresh route displays no new domain data. A page
  already in memory may retain visibly stale facts, but disables links/actions
  that would refresh or submit and offers Retry.
- With Reference Data unavailable after read ALLOW, list/detail keep persisted
  facts visible under a prominent `Last-known` strip, disable capture with the
  dependency-specific explanation, and expose Retry.
- Retry reissues the server route/request. It never auto-submits the capture
  draft; after recovery the user explicitly reviews and submits.
- Successful retry removes `Last-known` only when the returned DTO is `fresh`.

## Accessibility and Responsive Behavior

Route loading uses stable skeleton regions. Denied and retryable page outcomes
have a main heading and named recovery link/button. Capture denial/outage uses a
programmatically focused summary linked to the disabled-reason text. Status is
communicated by text plus icon, not color alone; timestamps have readable labels;
disabled controls remain explained in adjacent text. Keyboard and screen-reader
order stays heading, freshness status, facts/timeline, capture availability,
audit disclosure. Narrow layouts stack these existing regions without horizontal
scrolling; long IDs wrap; light/dark and reduced-motion behavior comes from
shared tokens.

## API Integration and Ownership

- Existing CMM list/detail/booking-reference GETs return the typed freshness
  metadata and non-authoritative capability hint only after read authorization.
- Existing movement POST returns exact 403/503 typed outcomes before domain
  evaluation when authority or references are unavailable.
- The browser never calls Identity or Reference Data directly and never caches
  entitlements as authority.
- Booking UI, shared shell/navigation, and `packages/ui` remain outside U03.

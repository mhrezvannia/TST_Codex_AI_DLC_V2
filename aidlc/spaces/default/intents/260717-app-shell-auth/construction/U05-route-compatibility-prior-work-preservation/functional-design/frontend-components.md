# Frontend Components - U05 Route Compatibility and Preservation

## Source Context

This frontend design consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. U05 covers compatibility routing and UI preservation checks around the mounted Booking routes.

## Component Hierarchy

| Component | Owner | Responsibility |
| --- | --- | --- |
| `LegacyBookingRouteRedirect` | `apps/shell` or Nginx/shell route adapter | Maps `/bookings*` requests to canonical `/booking*`. |
| `CanonicalBookingRouteFrame` | `apps/shell` | Ensures redirected/resolved routes show shell chrome, breadcrumbs, and active Booking nav. |
| `PreservedBookingListView` | Booking adapter | Reuses existing Booking list behavior inside shell. |
| `PreservedBookingCreateView` | Booking adapter | Reuses existing Booking create behavior inside shell. |
| `PreservedBookingDetailView` | Booking adapter | Reuses existing Booking detail behavior inside shell. |
| `PreservationEvidenceViewModel` | Evidence harness/docs | Records old route, new route, prior-work touch status, and verification result. |

## Interaction Flow

1. User opens `/bookings`, `/bookings/new`, or `/bookings/[id]`.
2. Route adapter redirects or resolves to canonical `/booking*`.
3. Protected shell route validates session and actor propagation.
4. Preserved Booking list/create/detail behavior renders inside shell.
5. Evidence records source route, canonical route, actor/correlation where relevant, and outcome.
6. Preservation review records W0-01/W0-02/W1-01/W2-02 touch status.

## UI Rules

- Breadcrumbs use `Home / Booking` or `Home / Booking / <id>`.
- Compatibility redirects do not expose a standalone Booking island as the final user-facing page.
- Preserved Booking controls keep existing labels and behavior unless a W2-01 actor/session adapter requires a narrow change.
- Route status/error states include correlation id where available.

## Frontend Constraints

- Use existing Next.js/React/TypeScript workspace patterns.
- Do not introduce Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js.
- Do not add broad W2-02 design-system foundation work.
- Do not migrate reference-data, charge agreement, or container movement screens into the shell.

## Evidence Surface

U05 may expose evidence in generated markdown/log artifacts rather than an in-app user surface. If an in-app QA evidence panel is used, it must remain QA-safe: subject/correlation/route outcome only, no raw tokens or sensitive internals.

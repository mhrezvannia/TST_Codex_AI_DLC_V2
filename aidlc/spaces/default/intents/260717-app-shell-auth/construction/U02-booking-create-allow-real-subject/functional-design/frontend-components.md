# Frontend Components - U02 Booking Create Allow

## Source Context

This frontend design consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. U02 adds shell-mounted Booking create and detail surfaces for the `local.booking.user` allow path.

## Component Hierarchy

| Component | Owner | Responsibility |
| --- | --- | --- |
| `BookingCreateShellPage` | `apps/shell` route `/booking/new` | Wrap preserved Booking create form in shell guard, breadcrumbs, and session actor context. |
| `BookingCreateFormAdapter` | Shell/Booking adapter | Reuse existing Booking form fields and validation while supplying actor/correlation/idempotency. |
| `BookingDetailShellPage` | `apps/shell` route `/booking/[id]` | Render created Booking detail inside shell and load with session-derived actor. |
| `AuthorizationEvidenceSummary` | Shell/evidence surface | Show QA-safe allow decision, subject, and correlation id where available. |
| `CreateErrorState` | Booking UI adapter | Render validation, authorization, or service errors without hiding actor failures. |

## Interaction Flow

1. `local.booking.user` signs in and opens `/booking/new`.
2. Shell guard resolves session and actor subject.
3. Create form submits through Booking BFF with actor, correlation id, service credentials, and idempotency key.
4. booking-service authorizes through identity-service.
5. On allow and successful create, shell navigates to `/booking/[id]`.
6. Detail page loads with the same real actor behavior.
7. Evidence summary or captured logs show actor, allow decision, booking id, and correlation id.

## Props and State

| Data | Components | Constraint |
| --- | --- | --- |
| Safe session summary | `BookingCreateShellPage`, `BookingDetailShellPage` | Server-derived; no raw tokens. |
| Actor subject | Form/detail adapters | Required and never defaulted to `local-user`. |
| Create draft values | `BookingCreateFormAdapter` | Existing W1 Booking form contract and validation. |
| Idempotency key | BFF create call | Preserved where existing create API requires it. |
| Authorization evidence | `AuthorizationEvidenceSummary` | QA-safe subject/action/decision/correlation only. |

## Validation and Error States

| State | UI behavior |
| --- | --- |
| Form validation error | Existing Booking validation messages render inside shell. |
| Missing subject | Fail-closed state; no backend create as `local-user`. |
| Authorization denied/error | In-shell denied/error state with correlation id; no mutation. |
| Create success | Navigate to canonical `/booking/[id]` and show success/evidence. |
| Detail load error | Inline error with correlation id; U02 DoD remains unmet until resolved. |

## Frontend Constraints

- Use existing Next.js/React/TypeScript workspace patterns.
- Do not introduce Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js.
- Preserve W1 Booking form/detail UX unless a W2-01 actor/session change requires a narrow adapter.
- Do not expand into W2-02 design-system foundation or W4-01 module migration.
- Keep form controls, breadcrumbs, and evidence text responsive without overlap at common desktop and mobile widths.

# Frontend Components - U03 Booking Deny

## Source Context

This frontend design consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. U03 designs the in-shell access-denied surface for an authenticated subject without Booking permission.

## Component Hierarchy

| Component | Owner | Responsibility |
| --- | --- | --- |
| `BookingAccessGuard` | Shell/Booking adapter | Interprets BFF/backend authorization results and selects content vs denied state. |
| `AccessDeniedShellPage` | `apps/shell` | Renders denied state inside shell with breadcrumbs, active nav, explanation, and actions. |
| `DecisionReference` | Shell/evidence surface | Shows QA-safe correlation or decision reference without exposing tokens. |
| `RequestAccessAction` | Existing auth/access surface link | Routes to existing request-access behavior if available. |
| `BackToHomeAction` | `apps/shell` | Returns user to safe shell landing. |

## Interaction Flow

1. `local.reference.admin` signs in and opens `/booking`.
2. Shell renders normal shell frame because the user is authenticated.
3. Booking access request is authorized through booking-service and identity-service.
4. Deny response returns to the shell adapter.
5. `AccessDeniedShellPage` renders with clear authenticated-but-unauthorized copy, request-access/back actions, and decision/correlation reference.
6. Evidence captures the deny subject, action, decision, and correlation id.

## Props and State

| Data | Component | Constraint |
| --- | --- | --- |
| Safe session summary | `AccessDeniedShellPage` | Display-safe subject only, no raw tokens. |
| Authorization result | `BookingAccessGuard` | Deny maps to denied UI; allow proceeds only in other units. |
| Correlation/decision reference | `DecisionReference` | QA-safe and copyable where feasible. |
| Action availability | `RequestAccessAction`, `BackToHomeAction` | Request-access may link to existing auth route; back action always safe. |

## Accessibility and Responsive Rules

- One visible `h1` such as "Access denied".
- Denied explanation states the user is signed in but Booking access is unavailable.
- Request-access and back actions are keyboard reachable with visible focus.
- Correlation/decision reference text wraps or truncates without overlapping controls.
- No color-only denied indicator.
- Mobile layout remains single-column inside the shell frame.

## Frontend Constraints

- Use existing Next.js/React/TypeScript workspace patterns.
- Do not introduce Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js.
- Do not create broad W2-02 foundation components.
- Do not hide denied state as an empty list or route-not-found page.

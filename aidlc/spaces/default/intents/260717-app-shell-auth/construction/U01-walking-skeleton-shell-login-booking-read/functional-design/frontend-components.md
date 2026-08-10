# Frontend Components - U01 Walking Skeleton

## Source Context

This frontend design consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. It implements only U01 shell login, shell layout, `/booking` mounted read, and session-derived actor handoff.

## Component Hierarchy

| Component | Owner | Responsibility | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `ShellRootLayout` | `apps/shell` | Protected route frame for shell pages. | Request/session context, route children. | Shell chrome or auth redirect. |
| `ProtectedShellRoute` | `apps/shell` | Calls `requireShellSession` and blocks protected content without a session. | Request context. | `SessionSummary` or redirect/fail-closed state. |
| `ShellTopBar` | `apps/shell` | Brand, optional search slot, user menu trigger. | Safe session display fields. | Top navigation region. |
| `ShellNavigation` | `apps/shell` | Booking active nav item; disabled/link-only placeholders for out-of-scope modules. | Route context, module availability. | Accessible navigation. |
| `ShellBreadcrumbs` | `apps/shell` | `Home` and `Booking` breadcrumb trail. | `ShellRouteContext`. | Breadcrumb list. |
| `UserMenuSummary` | `apps/shell` | Displays safe subject summary; sign-out action is designed in U04. | Safe session summary. | Menu surface without raw tokens. |
| `BookingMountPage` | `apps/shell` route `/booking` | Mounts preserved Booking read/list behavior inside shell. | Session actor, query params, correlation id. | Booking read/list content, loading, empty, or error state. |
| `BookingReadEvidencePanel` | Shell/Booking evidence surface | Shows QA-safe subject/correlation status when available. | Actor id, correlation id, read outcome. | Collapsible or inline evidence summary. |

## Interaction Flow

1. Browser opens `/` or `/booking` through Nginx.
2. `ProtectedShellRoute` requests a safe session summary.
3. Missing session redirects to existing auth/Keycloak.
4. Valid session renders `ShellRootLayout`.
5. `/booking` route resolves actor subject from the session.
6. Missing actor renders fail-closed state; it does not call Booking as `local-user`.
7. Valid actor calls the Booking read path and renders preserved Booking list/read content inside the shell.
8. Evidence panel or captured logs show actor and correlation id for U01 proof.

## Props and State

| Data | Component(s) | Constraint |
| --- | --- | --- |
| Safe display name/subject | `ShellTopBar`, `UserMenuSummary` | Derived server-side; raw tokens are absent. |
| Active route | `ShellNavigation`, `ShellBreadcrumbs` | `/booking` is active for the mounted read path. |
| Actor subject | `BookingMountPage` | Required; no default to `local-user`. |
| Correlation id | `BookingMountPage`, `BookingReadEvidencePanel` | Preserved through Booking BFF and evidence. |
| Booking read state | `BookingMountPage` | Loading, empty, loaded, and error states use existing Booking semantics. |

## Validation and Error States

| State | UI behavior |
| --- | --- |
| Checking session | Content-shaped shell/auth status; no protected Booking content. |
| No session | Redirect/status to existing auth flow. |
| Session without subject | Fail-closed shell error with correlation id where available. |
| Booking read loading | Preserve Booking loading pattern inside shell frame. |
| Booking read empty | Preserve Booking empty state inside shell frame. |
| Booking read error | Inline error with retry and correlation id; no fake empty success. |

## Frontend Constraints

- Use existing Next.js App Router, React, TypeScript, and workspace conventions.
- Do not introduce Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js.
- Do not create W2-02 design-system foundation work; consume existing primitives and record gaps.
- Stable layout: top bar about 56px, desktop nav about 240px, mobile drawer pattern from `mockups.md`; text and controls must not overlap.
- Accessibility baseline for U01: one visible page heading, landmark navigation, keyboard-reachable nav/user menu, focus not trapped during redirect/loading states.

## Integration Points

| Integration | Component | Contract |
| --- | --- | --- |
| Shell to auth | `ProtectedShellRoute` | Existing session helper and auth redirects. |
| Shell to Booking BFF | `BookingMountPage` | Session actor and correlation context required. |
| Booking BFF to booking-service | Booking read adapter | `X-LinerCore-Actor-Id` is session-derived and non-blank. |
| Evidence | `BookingReadEvidencePanel` and logs | QA-safe subject/correlation display; no token disclosure. |

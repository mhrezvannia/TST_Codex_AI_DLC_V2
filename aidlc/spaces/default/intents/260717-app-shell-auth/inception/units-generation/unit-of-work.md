# Units of Work - W2-01 App Shell and Auth

## Source Alignment

These units consume `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, `decisions.md`, `requirements.md`, and `stories.md`. They also apply the vertical slicing rule from `docs/aidlc-v2-slicing-playbook.md` and the W2-01 Context Pack: one authenticated shell, Booking as the first mounted module, real subject propagation, explicit W1 live-proof waiver handling, and preservation of W0-01, W0-02, W1-01, and W2-02.

## Slicing Rule (do not remove)

Units are **vertical increments**, not architectural layers. Each unit (after the walking skeleton) must move one thin capability through **every layer it needs** (UI -> API -> domain -> persistence -> any cross-module seam) and its Definition of Done must be an **observed end-to-end behavior on the running stack** - never "layer X tests pass," and never "without live proof." A unit whose DoD can be met without running the app is mis-sliced; re-slice it.

## Units

| Unit | Name | Vertical scope (layers it cuts) | Definition of Done (observed on live stack) |
| --- | --- | --- | --- |
| U01 | Walking Skeleton - Shell Login to One Booking Read | Nginx -> `apps/shell` -> `apps/auth`/Keycloak -> session helper -> Booking BFF read -> booking-service read | On the running Compose stack through Nginx, an unauthenticated user signs in, lands in `apps/shell`, opens `/booking`, and one Booking read reaches booking-service with a non-`local-user` actor and correlation id. |
| U02 | Booking Create Allow Path With Real Subject | Shell `/booking/new` UI -> Booking BFF POST -> booking-service create -> identity-service authorization -> Booking persistence/audit | On the running stack, `local.booking.user` creates a Booking from inside the shell; identity-service allows the action; the created Booking is retrievable in `/booking/[id]`; evidence shows the real subject, not `local-user`. |
| U03 | Booking Deny Path Inside Shell | Shell nav -> Booking BFF/API -> identity-service deny -> shell access-denied state -> audit/evidence | On the running stack, `local.reference.admin` signs in, navigates to `/booking`, receives access denied inside the shell, and deny evidence names the real subject/correlation id. |
| U04 | Sign-Out and Session Expiry Guard | Shell user menu -> auth sign-out -> session cookie clear -> protected route guard -> Booking BFF fail-closed | On the running stack, a signed-in user signs out; revisiting `/` or `/booking` requires login; no stale shell or Booking BFF call can proceed as `local-user`. |
| U05 | Route Compatibility and Prior-Work Preservation | Nginx/shell route adapter -> `/bookings*` redirect -> preserved Booking UI behavior -> diff/evidence review | On the running stack, `/bookings`, `/bookings/new`, and `/bookings/[id]` redirect or resolve to canonical `/booking*` shell routes; preserved W1 Booking list/detail/create behavior still works; W0-01, W0-02, W1-01, and W2-02 preservation checks are recorded. |
| U06 | Final Live Acceptance, Detector, and Audit Package | Live Compose scenario -> allow/deny/sign-out proof -> detector 6d -> `aidlc-audit` -> evidence package | On the running stack, the complete W2-01 journey passes `erp-fidelity-audit` detector 6d and `aidlc-audit`; evidence is stored under `artifacts/w2-01-live/app-shell-auth/`; W1's live-proof waiver remains explicit as BLOCKED at `compose-start`, not PASS. |

## Cross-Module Seams In This Intent

| Seam | Unit(s) exercising it live | Real mechanism | Live DoD requirement |
| --- | --- | --- | --- |
| Browser edge to shell | U01, U06 | Nginx route to `apps/shell` in Compose | Browser enters through Nginx, not direct app-only shortcuts. |
| Shell to auth | U01, U04 | Existing `apps/auth` sign-in/callback/session/sign-out routes and `packages/auth` DTOs | Sign-in and sign-out are observed live; raw tokens are not exposed to browser JavaScript. |
| Shell/Booking UI to Booking BFF | U01, U02, U03, U04, U05 | Server/BFF calls from mounted shell routes | Requests include session-derived actor and correlation; missing actor fails closed. |
| Booking BFF to booking-service | U01, U02, U03, U05 | HTTP with service id/token, actor, idempotency, correlation | Booking read/create/deny paths reach booking-service with real actor, not `local-user`. |
| booking-service to identity-service | U02, U03, U06 | `POST /internal/identity/authorize` through Booking authorization adapter | Allow and deny decisions are observed with `booking` resource/action mapping and fail-closed behavior. |
| Booking to reference/charge/platform prior work | U02, U05, U06 | Existing stable service contracts and platform/eventing seams | W2-01 consumes these seams only where existing Booking behavior requires them; no W0-01/W0-02/W1-01 redesign. |
| Evidence and audit | U02, U03, U04, U05, U06 | Live evidence package, detector 6d, `aidlc-audit` | Evidence names real subjects and keeps W1 waiver explicit. |

## Dependency DAG

```yaml
units:
  - name: U01-walking-skeleton-shell-login-booking-read
    depends_on: []
  - name: U02-booking-create-allow-real-subject
    depends_on: [U01-walking-skeleton-shell-login-booking-read]
  - name: U03-booking-deny-inside-shell
    depends_on: [U01-walking-skeleton-shell-login-booking-read]
  - name: U04-signout-session-expiry-guard
    depends_on: [U01-walking-skeleton-shell-login-booking-read]
  - name: U05-route-compatibility-prior-work-preservation
    depends_on: [U01-walking-skeleton-shell-login-booking-read, U02-booking-create-allow-real-subject]
  - name: U06-final-live-acceptance-detector-audit
    depends_on: [U02-booking-create-allow-real-subject, U03-booking-deny-inside-shell, U04-signout-session-expiry-guard, U05-route-compatibility-prior-work-preservation]
```

## Unit Detail

### U01 - Walking Skeleton - Shell Login to One Booking Read

Responsibilities:

- Create `apps/shell` and route it through Compose/Nginx.
- Reuse `apps/auth` and `packages/auth` for protected shell login/session.
- Mount the thinnest `/booking` read path inside shell.
- Fix enough actor propagation that one Booking read cannot use `local-user`.
- Carry NFR-07: stay in existing Next.js/React/TypeScript patterns and do not introduce Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js.

Observed DoD:

- In live Compose through Nginx, no-session request redirects to auth/Keycloak and returns to shell.
- `/booking` renders inside shell.
- Backend evidence for one Booking read contains a real deterministic subject and correlation id, not `local-user`.

### U02 - Booking Create Allow Path With Real Subject

Responsibilities:

- Add Booking identity permissions/grants and `local.booking.user` fixture as part of the create path.
- Implement Booking authorization adapter to identity-service for create/read actions needed by the path.
- Harden BFF and backend actor handling for create/detail.
- Preserve existing W1 Booking create/detail behavior.
- Carry NFR-07 for frontend code touched in shell/Booking create/detail.

Observed DoD:

- In live Compose through Nginx, `local.booking.user` creates a Booking at `/booking/new`.
- identity-service allows the `booking:create` decision or equivalent mapped action.
- `/booking/[id]` renders the created Booking.
- Audit/log/evidence shows `local.booking.user` or the corresponding Keycloak subject and correlation id.

### U03 - Booking Deny Path Inside Shell

Responsibilities:

- Preserve `local.reference.admin` as a deterministic authenticated deny user without Booking access.
- Exercise identity-service deny behavior for Booking read/action.
- Render access denied inside shell with request-access/back actions.
- Keep denied state accessible and keyboard reachable.
- Carry NFR-07 for the denied-path UI: stay in existing Next.js/React/TypeScript patterns and do not introduce Redux Toolkit, SWR, CSS Modules, styled-components, Emotion, jQuery, or Moment.js.

Observed DoD:

- In live Compose through Nginx, `local.reference.admin` signs in and opens `/booking`.
- Shell renders access denied inside the shell frame.
- Backend/BFF/identity evidence records a deny for the real subject and correlation id.

### U04 - Sign-Out and Session Expiry Guard

Responsibilities:

- Implement user-menu sign-out against existing auth sign-out behavior.
- Clear session and prevent stale shell chrome from calling Booking APIs.
- Ensure protected shell and Booking routes require login after sign-out.
- Cover session-expired or missing-subject fail-closed behavior.

Observed DoD:

- In live Compose through Nginx, a signed-in user signs out from the shell user menu.
- Reopening `/` or `/booking` requires login.
- A post-sign-out Booking BFF attempt fails closed and does not call booking-service as `local-user`.

### U05 - Route Compatibility and Prior-Work Preservation

Responsibilities:

- Map existing `/bookings`, `/bookings/new`, and `/bookings/[id]` to canonical `/booking*` shell routes.
- Preserve existing W1 Booking list/detail/create behavior under shell.
- Verify W0-01 platform/eventing, W0-02 reference-data, W1-01 Booking, and W2-02 design-system foundation files are unchanged or touched only with W2-01-specific justification.
- Carry NFR-07 in any frontend route/redirect implementation.

Observed DoD:

- In live Compose through Nginx, `/bookings*` redirects or resolves to canonical `/booking*` shell routes.
- Preserved Booking list/detail/create behavior still works inside shell.
- Preservation evidence records W0-01, W0-02, W1-01, and W2-02 checks and keeps W1 live-proof waiver/BLOCKED wording unchanged.

### U06 - Final Live Acceptance, Detector, and Audit Package

Responsibilities:

- Package evidence from U01-U05 under `artifacts/w2-01-live/app-shell-auth/`.
- Run detector 6d for hardcoded auth on mounted shell/Booking surfaces.
- Run `aidlc-audit` for the W2-01 intent.
- Record Compose/runtime blockers honestly if they occur.

Observed DoD:

- On live Compose through Nginx and Keycloak, the full journey login -> shell -> Booking allow -> Booking deny -> sign-out is driven.
- `erp-fidelity-audit` detector 6d reports zero hardcoded-auth hits for mounted shell/Booking surfaces.
- `aidlc-audit` is green for this intent.
- W1's prior live-proof waiver remains explicit as BLOCKED at `compose-start`, not a real PASS.

## Exit Gate

Intent is not `complete` until the full vertical path across all units has been driven on the real runtime and `aidlc-audit` plus `erp-fidelity-audit` are green. Evidence path: `artifacts/w2-01-live/app-shell-auth/`.

If Docker/Compose dependencies block live proof, W2-01 must record a concrete BLOCKED evidence state for this intent. It must not convert that blocker, or W1-01's existing blocker, into a false PASS.

## Open Questions

1. Is U01's walking-skeleton path the right thinnest end-to-end route?
   - A. Yes - shell login to one Booking read with real actor is the right thinnest route.
   - B. Narrow it further to shell login only.
   - C. Widen it to Booking create in the walking skeleton.
   - X. Other (please specify)
   - `[Answer]:` A - `team-practices.md` says the first W2-01 Construction slice should prove protected shell entry, session handoff, and one Booking call that cannot fall back to `local-user`.

## Review - Iteration 2 Remediation

Architecture review iteration 2 was NOT-READY only because U03's access-denied UI did not explicitly carry NFR-07. The review confirmed the units are vertical increments with live-stack DoDs, the binding headings are present, the DAG is acyclic, W1 remains BLOCKED at `compose-start`, prior-work preservation is explicit, and story coverage is coherent.

Remediation applied: U03 now carries the prohibited-library constraint, and `unit-of-work-story-map.md` maps NFR-07 and the cross-cutting maintainability concern to U03.

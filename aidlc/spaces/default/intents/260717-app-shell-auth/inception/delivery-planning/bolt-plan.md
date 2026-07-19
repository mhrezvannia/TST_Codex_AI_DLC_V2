# Bolt Plan - W2-01 App Shell and Auth

## Source Context

This plan consumes `requirements.md`, `stories.md`, `mockups.md`, `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, and `team-practices.md`. The approved units are vertical live increments, and this plan chooses the economic Construction path through their DAG.

## Sequencing Heuristic

Use a hybrid walking-skeleton-first and risk-first sequence:

- Walking skeleton first: B01 proves Nginx, auth/Keycloak, shell, Booking BFF, and booking-service read with a real actor.
- Risk first after B01: B02 and B03 prove allow/deny authorization before polishing compatibility.
- Session safety before final evidence: B04 proves sign-out and stale-call fail-closed behavior before B05/B06 package compatibility and audit evidence.
- Preservation stays explicit: B05 and B06 keep W0-01, W0-02, W1-01, W2-02, and the W1 BLOCKED-at-`compose-start` waiver visible.

## Ordered Bolts

| Order | Bolt | Units | Scope | Definition of Done | Confidence hypothesis | Expected demo |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | B01 Shell Login and Booking Read Skeleton | U01 | Create/routable `apps/shell`; reuse `apps/auth`; protect shell routes; mount thinnest `/booking` read path; remove protected read fallback to `local-user`. | On live Compose through Nginx, unauthenticated access redirects to auth/Keycloak, returns to shell, opens `/booking`, and one Booking read reaches booking-service with a non-`local-user` actor and correlation id. | The selected shell-host and actor-propagation seam is viable end to end. | Browser login to shell, Booking list/read inside shell, captured backend actor/correlation evidence. |
| 2 | B02 Booking Create Allow With Real Subject | U02 | Add Booking identity permissions/grants and `local.booking.user`; implement booking-service authorization adapter to identity-service for create/read; preserve W1 create/detail. | `local.booking.user` creates a Booking at `/booking/new`, identity-service allows the mapped action, `/booking/[id]` renders it, and evidence names the real subject/correlation id. | The allow path works through identity-service and does not regress Booking behavior. | Create Booking in shell, open detail, show allow decision and audit/log evidence. |
| 3 | B03 Booking Deny Inside Shell | U03 | Preserve `local.reference.admin` as deny user; exercise identity deny; render access denied in shell; keep UI accessible and within NFR-07 library constraints. | `local.reference.admin` signs in, opens `/booking`, sees access denied inside shell, and deny evidence records real subject/correlation id. | Fail-closed authorization produces useful UX and auditable denial. | Sign in as deny user, navigate to Booking, inspect deny state and evidence. |
| 4 | B04 Sign-Out and Session Expiry Guard | U04 | Reuse auth sign-out; clear session; guard protected shell/Booking routes; block stale BFF calls with missing subject. | After sign-out, `/` and `/booking` require login again, and a post-sign-out Booking BFF attempt fails closed without reaching booking-service as `local-user`. | Session lifecycle cannot silently leak stale shell state into Booking calls. | Sign out from user menu, reopen protected routes, inspect failed stale-call evidence. |
| 5 | B05 Route Compatibility and Preservation Proof | U05 | Redirect/resolve `/bookings*` to `/booking*`; verify W1 list/detail/create still work; record W0-01/W0-02/W1-01/W2-02 preservation evidence. | Live `/bookings*` compatibility works, preserved Booking behavior works inside shell, and preservation evidence records any touched prior-work file with W2-01-specific justification. | Existing links and prior merged work survive the shell mount without scope expansion. | Open old Booking URLs, observe canonical shell routes, run preservation checks. |
| 6 | B06 Final Live Acceptance and Audit Package | U06 | Drive full allow/deny/sign-out scenario; run detector 6d, `erp-fidelity-audit`, `aidlc-audit`; package evidence under `artifacts/w2-01-live/app-shell-auth/`. | Full W2-01 live journey passes or records an honest W2-01 blocker; detector 6d has zero hardcoded-auth hits; W1 waiver remains BLOCKED at `compose-start`, not PASS. | The intent can be accepted from live runtime evidence and audit gates. | Evidence walkthrough: login, allow, deny, sign-out, detector output, audits, W1 waiver reference. |

## Dependency Compliance

The sequence respects `unit-of-work-dependency.md`:

- B01 has no dependencies.
- B02, B03, and B04 depend only on B01.
- B05 depends on B01 and B02.
- B06 depends on B02, B03, B04, and B05.

No Bolt is sequenced before a prerequisite unit. B03 and B04 could be parallel after B01, but the default plan keeps one serial path because the same session and shell surfaces carry both behaviors.

## Construction Exit Gate

The intent is not complete until live Compose/Nginx evidence, detector 6d, `erp-fidelity-audit`, and `aidlc-audit` are green or a concrete runtime blocker is recorded for W2-01. W1's prior live-proof waiver remains a separate explicit BLOCKED record at `compose-start`.

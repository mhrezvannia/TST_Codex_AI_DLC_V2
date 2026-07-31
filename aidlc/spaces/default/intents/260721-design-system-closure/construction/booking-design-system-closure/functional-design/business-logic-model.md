# Business Logic Model — booking-design-system-closure

## Design Basis

This model elaborates the single closure Unit in `unit-of-work.md` and its six-story allocation in `unit-of-work-story-map.md`. It implements `requirements.md` through the boundaries in `components.md`, the interfaces in `component-methods.md`, and the preserved runtime topology in `services.md`. No new Booking business rule, persistence model, API, frontend, shell, or theme is introduced.

## Canonical Route Resolution

1. An authenticated user enters the shared edge route `/booking`, `/booking/new`, or `/booking/{bookingId}`.
2. nginx resolves the request to the existing authenticated shell.
3. The shell supplies exactly one banner, navigation, breadcrumb chain, theme context, identity surface, workflow context, and main landmark.
4. The shell Booking route reads through its existing same-origin adapter and the retained Booking BFF.
5. A request to a retired standalone `apps/booking` presentation route maps only the safe route identity and query context, then redirects to the corresponding shared-edge shell route.
6. BFF routes in `apps/booking/app/api/**` do not redirect and retain their existing transport/security behavior.

Redirect mapping is deterministic:

| Standalone presentation intent | Canonical destination | Preserved data |
|---|---|---|
| Booking list | `/booking` | Supported filters/search/pagination only |
| Create | `/booking/new` | No draft payload in URL |
| Detail | `/booking/{bookingId}` | Valid encoded Booking identity |
| Unknown/unsafe path | `/booking` | None |

## Read and Presentation Workflow

List and detail reads remain server-oriented. The route loader forwards cookies and correlation through the shell adapter, BFF, and Booking service, then maps transport outcomes into a discriminated presentation result:

| Input outcome | Presentation state | Required behavior |
|---|---|---|
| Request not resolved | `loading` | Stable-size shared Skeleton; shell remains present |
| 2xx with records | `populated` | Shared Table/record detail, count/context, commands |
| 2xx with zero records | `empty` | Guided EmptyState and reachable create action |
| 401/403 | `denied` | Non-color-only denied explanation and safe navigation |
| Known dependency unavailable/partial | `degraded` | Retain usable content, name unavailable capability, offer safe retry |
| Timeout/other safe non-OK | `error` | Announced error, correlation-safe context, keyboard-reachable retry |

Filtering updates supported URL query parameters so refresh/back navigation remain coherent. Narrow layouts contain table overflow inside the shared Table region; they never create page-level horizontal overflow.

The route adapter normalizes existing shell load results exactly once: unresolved route
work maps to `loading`; `ok: true` plus zero list items maps to `empty`; every other
`ok: true` payload maps to `populated`; 401/403 maps to `denied`; a documented
partial-dependency response with usable payload maps to `degraded`; and all other
normalized non-OK results map to `error`. Components, rules, tests, and evidence use
this vocabulary and do not introduce a `ready` alias.

## Create-to-Confirm Workflow

The UI orchestrates existing commands without becoming a business-workflow authority:

1. Initialize the create form from current reference lookups and existing defaults.
2. Accept labelled operator input into route-local form state.
3. Perform client affordance validation only for immediately knowable shape/presence constraints; the service remains authoritative for domain validation.
4. On create, prevent a second submission, issue one idempotent command through the shell route and BFF, and retain the current form snapshot.
5. On success, store returned Booking identity/state and expose the Validate command.
6. On Validate, Price, or Confirm, set one command as `pending`, disable only conflicting commands, and announce the operation.
7. Apply the returned Booking representation as the sole lifecycle truth. Never infer a successful status from HTTP completion alone.
8. On validation rejection, associate field-specific details where possible, focus the error summary, and retain all valid input.
9. On recoverable transport/service failure, retain the last confirmed Booking representation and form context, expose retry, and reuse existing idempotency behavior.
10. On confirmation success, announce success and navigate to canonical detail inside the same shell.

The action outcome state machine is:

`idle → pending(command) → success(returnedBooking) → idle`

or

`idle → pending(command) → recoverableError(normalizedFailure) → pending(retry)`.

It also has terminal presentation branches from `pending`: `validationBlocked`,
`denied`, `degraded`, and `fatalError`. `validationBlocked` retains values and
requires correction before resubmission. `denied` retains only safe, already rendered
context, announces denial, focuses the denied heading/safe action, and offers no command
retry. `degraded` retains the last returned Booking and unaffected capabilities,
announces the named unavailable capability, and offers only an explicitly safe retry.
`fatalError` retains failure evidence, focuses the route error boundary, and offers
safe navigation rather than an automatic retry. Denied and fatal/unexpected outcomes
do not auto-retry. No command is presented unless permitted by the returned
status/validation information already used by the current application.

## Failure, Focus, and Recovery Algorithm

| Event | State retained | Focus destination | Live announcement | Recovery |
|---|---|---|---|---|
| Client field error | All field values | First invalid field after summary link | Validation summary | Correct field and resubmit |
| Service validation rejection | Valid values and returned details | Error summary | Count and concise cause | Correct or retry as allowed |
| Lookup degradation | Entered values and available options | Degraded status only when action-blocking | Named unavailable lookup | Retry lookup or safe navigation |
| Pricing failure | Booking identity/validation and inputs | Pricing status region | Pricing unavailable | Retry Price |
| Confirm timeout/error | Last returned Booking state | Confirm status/action | Confirmation not established | Retry using existing protection |
| Authorization denial | No sensitive payload | Denied heading/safe action | Access denied | Return to canonical safe route |
| Partial dependency response | Last returned Booking and unaffected commands | Degraded status when action-blocking | Named capability unavailable | Retry only that capability |
| Fatal/unexpected UI failure | Durable failure context only | Route error boundary | Operation could not continue | Safe navigation; no command retry |

## Redirect Decision Algorithm

The redirect helper accepts the full `Request` and a trusted canonical shell origin.
It returns `null` for `/api/**` and every non-presentation path. It maps only
`/bookings`, `/bookings/new`, and `/bookings/{bookingId}`; malformed, missing, or
multi-segment detail identity falls back to `/booking`. List query preservation is
allow-listed to `page`, `pageSize`, `sort`, `direction`, `status`, and `q`,
using the first non-empty value. Create preserves no query. Detail preserves only the
literal `created=1`; `returnTo`, absolute URLs, fragments, credentials, duplicate
values, and unknown keys are discarded. The destination is constructed against the
trusted canonical shell origin and returned with status 308, never against the internal
standalone app origin.

Focus is never moved merely because server data refreshes. Dialogs trap focus while open, close with Escape when safe, and return focus to the trigger.

## Deterministic Evidence Workflow

1. Run `npm run demo:guard`; stop acceptance on failure.
2. Use only `scripts/wave-a-compose.mjs` to operate `linercore-wave-a`.
3. Authenticate through the live edge/shell route.
4. Complete one real create → validate → price → confirm → detail journey through the BFF/backend path.
5. Produce difficult presentation states using Playwright request interception or documented isolated service conditions on that same running route.
6. For each applicable route/state, assert semantic content, focus/announcement behavior, theme, viewport, overflow, and primary-action reachability.
7. Write durable results, screenshots/traces, setup method, network proof, command/exit data, and requirement mappings under `artifacts/w2-02-live/`.
8. Run the final demo guard, then both closure audits with direct exit status.
9. Update W2-02 backlog status only if every gate is green. Preserve any failure and keep historical W1 evidence BLOCKED/waived.

## Invariants

- There is one authenticated shell, one canonical Booking presentation, one shared token/primitive owner, and one Unit/Bolt completion boundary.
- Production code contains no test-state query flag, debug state picker, detached acceptance page, or module-local theme.
- UI state never changes Booking domain truth; it only renders returned service truth and command progress.
- A static, component, screenshot-only, or partially green result cannot close the Unit.

## Review

**Verdict: READY**

The mandatory second review found the revised design coherent and implementable.
The route discriminator is normalized to `populated` with one explicit adapter,
the lifecycle model covers validation-blocked, recoverable, denied, degraded, and
fatal outcomes with complete interaction semantics, and the redirect contract is
request-aware, same-origin-safe, allow-listed, permanent, and excludes every BFF
API route.

**Mandatory corrections:** None.

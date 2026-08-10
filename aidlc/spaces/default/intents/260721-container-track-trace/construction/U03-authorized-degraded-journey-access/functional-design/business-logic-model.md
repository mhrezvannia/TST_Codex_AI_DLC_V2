# Business Logic Model - U03 Authorized Degraded Journey Access

## Source Alignment

This model specializes U03 from `unit-of-work.md` and
`unit-of-work-story-map.md`, implements the authorization and operational-state
rules in `requirements.md`, and preserves the boundaries in `components.md`,
`component-methods.md`, and `services.md`. U01 owns the persisted journey/read
routes and U02 owns movement conflict depth; U03 adds no new data source, cache,
shell, or capture transition.

## Authorization-First Read Workflow

For every fresh list, detail, or booking-reference lookup:

1. The adapter requires a nonblank verified subject and creates a correlation
   ID. Missing/invalid authentication fails before any protected repository
   lookup; it is never mapped to 404.
2. The application use case calls the existing singular
   `AuthorizationPort.evaluate(subject, resource, action, correlationId)` for
   `container-movement:read`. Read ALLOW is the enforcement decision; REST or
   UI visibility is never authoritative.
3. A DENY returns HTTP 403 `CMM_AUTHORIZATION_DENIED`, appends a safe denial
   audit with subject/resource/action/reason/correlation, and loads no journey.
4. Identity timeout/unavailability returns HTTP 503
   `IDENTITY_DEPENDENCY_UNAVAILABLE` with Retry/correlation, serves no newly
   requested domain data, and records only safe dependency log/metric evidence.
5. After read ALLOW, the query calls the named CMM repository operation for the
   request: `list`, `find(journeyId)`, or
   `findByBooking(bookingReference)`. Only an absent journey/booking result at
   this point becomes 404.
6. Only after read ALLOW, the use case makes a second ordered fresh call to the
   same singular port for `container-movement:capture-movement`. This decision
   is a non-authoritative UI hint. ALLOW permits `captureEnabled` only if
   references are also fresh; DENY sets `INSUFFICIENT_PERMISSION`; UNAVAILABLE
   sets `CAPABILITY_UNAVAILABLE`. Passive DENY/UNAVAILABLE writes no denial
   audit or CMM row, only safe decision telemetry. Every POST independently
   calls the singular port again and never trusts this hint.
7. Reference Data confirms current route/equipment/location facts. When it is
   healthy the DTO has `freshness=fresh`; when unavailable the authorized DTO
   retains persisted facts with `freshness=last-known`, dependency
   `REFERENCE_DATA`, a safe reason, `checkedAt`, the existing journey
   `dataUpdatedAt`, and `captureEnabled=false`.

No authorization result is cached. A browser may retain a previously rendered
page during Identity failure, but it labels it stale/inert and cannot refresh,
navigate to a newly protected record, or submit capture.

## Capture Workflow

Every direct, deep-link, or UI capture reaches the same application boundary:

1. Authenticate and evaluate `container-movement:capture-movement` through
   `AuthorizationPort` before journey lookup, reference calls, idempotency, or
   transition evaluation.
2. DENY returns 403 `CMM_AUTHORIZATION_DENIED`, appends denial audit, and writes
   no attempt/request/movement/rejection/lifecycle/outbox/Booking effect.
3. Identity unavailable returns 503 `IDENTITY_DEPENDENCY_UNAVAILABLE`; no
   domain row is read for disclosure and no capture database effect is written.
4. After ALLOW, Reference Data validates required active facts. Invalid or
   inactive input remains the U02 400 field-validation path.
5. Reference Data unavailable returns HTTP 503
   `REFERENCE_DATA_UNAVAILABLE` before the idempotency claim. It writes no
   attempt/request/rejection/domain/outbox row and retains only correlated
   boundary log/metric evidence.
6. Only fresh authorization plus fresh valid references delegates to the U01/
   U02 capture transaction.

Customer Service therefore cannot bypass disabled UI by POSTing directly.
Equipment Control receives the same checks and succeeds only while both
authorities are current.

## Decision Matrix

| Request | Identity decision | Reference state | HTTP/result | Domain disclosure/effect |
| --- | --- | --- | --- | --- |
| list/detail | ALLOW read/capture capability | fresh | 200 `fresh`, capture enabled | authorized persisted view; hint only |
| list/detail | ALLOW read, capture DENY/UNAVAILABLE | fresh | 200 `fresh`, capture disabled | view allowed; telemetry only |
| list/detail | DENY | not called | 403 `CMM_AUTHORIZATION_DENIED` | none; denial audit only |
| list/detail | unavailable | not called | 503 `IDENTITY_DEPENDENCY_UNAVAILABLE` | no new data |
| list/detail | ALLOW read | unavailable | 200 `last-known` | persisted facts, capture disabled |
| capture | DENY/read-only role | not called | 403 `CMM_AUTHORIZATION_DENIED` | denial audit; no capture effect |
| capture | unavailable | not called | 503 `IDENTITY_DEPENDENCY_UNAVAILABLE` | zero capture effect |
| capture | ALLOW capture | unavailable | 503 `REFERENCE_DATA_UNAVAILABLE` | zero capture database rows |
| capture | ALLOW capture | fresh/valid | U01/U02 result | normal typed transition path |

## Executable Response Contracts

Every GET success is a 200 envelope containing required `kind=ready`, protected
`data` (journey page/detail/resolved journey), `correlationId`, and
`freshness`. Protected data requires `dataUpdatedAt`, mapped from the already
persisted `ContainerJourney.updatedAt`; it is labelled as when journey data last
changed, never as reference verification. The freshness object requires
`state`, `checkedAt`, and `captureEnabled`, and optionally carries dependency
and reasonCode. `fresh` omits dependency/reason. `last-known` requires
`dependency=REFERENCE_DATA`, `reasonCode=REFERENCE_DATA_UNAVAILABLE`, and
`captureEnabled=false`. The capability hint also requires
`captureDisabledReason` set to `INSUFFICIENT_PERMISSION`,
`CAPABILITY_UNAVAILABLE`, or `REFERENCE_DATA_UNAVAILABLE` whenever disabled.

All list/detail/booking-reference/capture boundary failures use the same safe
error envelope with required `kind`, `error.code`, `error.correlationId`,
`error.retryable`, and operator guidance; it contains no protected `data`:

| HTTP | kind/code | retryable/guidance |
| --- | --- | --- |
| 403 | `denied` / `CMM_AUTHORIZATION_DENIED` | false / request access or return |
| 503 | `dependency-unavailable` / `IDENTITY_DEPENDENCY_UNAVAILABLE` | true / Retry |
| 503 | `dependency-unavailable` / `REFERENCE_DATA_UNAVAILABLE` | true / Retry |

Only capture's 403/503 variants may echo the already-held `preservedInput`; GET
errors never carry journey, booking, equipment, lifecycle, or permission data.

## Recovery and Observable Scenarios

Retry always starts a new authentication/authorization evaluation, then a new
Reference Data check; it never reuses a successful result. Recovery from an
outage changes display freshness only after a successful check and never queues
or replays a capture. Live proof compares capture-attempt, request-disposition,
movement/history, rejection, journey version/lifecycle, outbox, and Booking
projection counts/hashes before and after each denied/unavailable POST. A real
DENY writes exactly one complete authorization-denial audit and no other CMM
row. Identity/Reference Data outage and passive GET capability hints write no
CMM audit or business row and create no false denial/request disposition; they
emit safe correlated logs/metrics only. Identity failure responses contain zero
protected data.

## Review Iteration 1

**Verdict: NOT-READY**

The design preserves U03's narrow scope and correctly establishes the principal
ordering: authenticate, authorize inside the application use case, then access
the protected repository or Reference Data; Identity unavailability fails
closed without an authorization cache; an authorized Reference Data outage may
serve only persisted last-known facts and cannot reach capture idempotency or
domain evaluation. UI composition remains Container Movement-owned, reuses the
shared shell/primitives, and includes non-color, focus, keyboard, screen-reader,
responsive, and retry behavior. The following contract gaps remain:

1. **Define how the UI obtains `captureEnabled` without turning a GET result
   into authority.** List/detail currently evaluate only
   `container-movement:read`, yet `ReferenceFreshness.captureEnabled` is true
   only with fresh capture authorization and the Customer Service detail must
   render capture disabled by permission. Specify the server-side capability
   decision performed after read ALLOW, including its DENY/UNAVAILABLE
   presentation and evidence behavior. State explicitly that it is a UI hint
   only and that every POST independently reevaluates
   `container-movement:capture-movement`; no capability returned by a prior GET
   may authorize capture.
2. **Correct the read lookup/API ordering ambiguity.** Step 5 says "Missing
   identity returns 404" after Identity has already returned ALLOW. A missing or
   blank authenticated subject must fail closed before protected lookup; only a
   missing journey after read ALLOW may return 404. Name the list/detail/
   booking-reference repository lookup at that point so implementations cannot
   interpret 404 as an authentication outcome or touch the repository before
   authorization.
3. **Make the degraded/denied REST contracts executable.** The artifacts name
   status codes and machine codes but do not define the response unions/shapes
   added beyond the current Application Design surface. Specify the safe 403
   and both 503 bodies (machine code, correlation, retryability/guidance and no
   protected payload), plus the authorized 200 freshness shape and placement of
   `state`, dependency/reason, `lastVerifiedAt`, `checkedAt`, and
   `captureEnabled`. Mirror those variants in the frontend API union so list,
   detail, booking lookup, and direct capture cannot invent incompatible DTOs.
4. **Reconcile and prove the exact denial/outage write sets.** The capture
   workflow lists no attempt/request/rejection/domain/outbox rows for Reference
   Data failure, while the entity invariant says no capture database row and
   the proof omits the capture-attempt count. State unambiguously whether an
   outage writes any CMM audit row; the surrounding rule says outage evidence
   is log/metric only, unlike a real DENY's sole denial-audit write. Extend the
   live proof to assert attempt, request, rejection, accepted movement/history,
   journey version/lifecycle, outbox, and Booking counts, exactly one complete
   denial audit for a real DENY, and no false denial/request disposition for
   either dependency outage.

No migration, broker-recovery, Booking-UI, shared-shell, `packages/ui`, EDI,
public DCSA API, multi-leg, fleet/depot, or M&R scope expansion is needed to
resolve these findings.

## Builder Remediation after Review Iteration 1

The builder defined a fresh server-side capability hint that never authorizes a
POST, corrected authenticated-subject/repository/404 ordering, added one exact
200/403/503 response family mirrored by the frontend, and made real-denial
versus dependency-outage database/log write sets and live assertions explicit.

## Review Iteration 2

**Verdict: NOT-READY**

Iteration-one findings are substantially resolved: a GET capability is now an
explicit non-authoritative hint and every POST reauthorizes; authentication,
read authorization, named repository lookup, and resource-only 404 ordering are
unambiguous; safe ready/403/503 shapes are mirrored in the frontend; and real
DENY, passive hint, Identity outage, and Reference Data outage have distinct,
testable database/log write sets. Identity remains fail-closed with no cached
authority, last-known reads require current read ALLOW, UI ownership and
accessibility stay within the CMM pages, and no excluded scope has leaked in.

The following exact implementation contradictions remain:

1. **Align the capability lookup with the cited authorization port.** The read
   workflow requires one `AuthorizationPort` call returning a decision map for
   both permissions, but `component-methods.md` defines only singular
   `evaluate(subject, resource, action, correlationId) -> AuthorizationDecision`.
   Specify two ordered fresh evaluations using that port (read first; optional
   capture hint only after read ALLOW), or explicitly define the batch-port
   contract and partial-result semantics. The current text cannot be
   implemented against its claimed upstream interface without inventing an API.
2. **Define the durable source of `lastVerifiedAt`.** A last-known 200 requires
   the most recent successful Reference Data verification time during the very
   outage in which Reference Data cannot supply it, but no U01 field, existing
   repository field, or persistence update/source is named, while U03 disclaims
   migrations, caches, and new data sources. Identify an already-persisted
   verification timestamp populated by U01/U02, or change the contract to an
   available truthful timestamp. Page render time, outage `checkedAt`, and
   journey update time cannot silently masquerade as reference verification.
3. **Include Identity failure consistently in direct-capture UI outcomes.**
   `frontend-components.md` says direct capture adds only denied or
   `REFERENCE_DATA_UNAVAILABLE` to the U02 union, while the capture workflow and
   the very next frontend response-family definition also require
   `IDENTITY_DEPENDENCY_UNAVAILABLE`. Add the Identity 503 capture outcome to
   the preserved-draft/focused-summary/no-refresh behavior so the component
   union and API contract agree.

These corrections require contract clarification only; they do not justify a
new migration owner, shared-shell or `packages/ui` change, Booking UI work, or
any EDI/public-API/multi-leg/fleet/depot/M&R expansion.

## Builder Remediation after Review Iteration 2

The final independent verdict remains NOT-READY because the two-iteration limit
is exhausted. Builder remediation now uses two ordered calls to the existing
singular authorization port, labels the already-persisted
`ContainerJourney.updatedAt` only as `dataUpdatedAt` instead of inventing a
reference-verification timestamp, and includes Identity-unavailable in direct
capture UI recovery.

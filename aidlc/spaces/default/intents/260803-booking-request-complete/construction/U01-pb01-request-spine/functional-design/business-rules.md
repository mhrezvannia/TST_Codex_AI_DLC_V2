# Business Rules - U01 PB-01 Request Spine

## Scope and Precedence

These rules govern only `U01-pb01-request-spine`. They consume `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`, plus the approved Refined Mockups. When rules conflict, approved W3-04 scope and requirements, security/accessibility standards, LinerCore, and executable `@erp/ui` take precedence over advisory UI output.

U01 establishes a truthful create/reopen and operation-recovery spine. It does not take the complete commercial dictionary from U02, the full voyage-state matrix from U03, pre-W3 migration from U04, confirmation from U07, or legacy-route convergence from U08.

## Request and Route Rules

| Rule | Binding behavior | Failure/result |
| --- | --- | --- |
| BR-U01-001 | `/booking/new` is the canonical create page in the authenticated shared shell. | Any parallel create implementation is non-conformant. |
| BR-U01-002 | New W3-04 creates use shell `POST /api/booking/bookings/drafts` to Booking `POST /api/bookings/drafts`. | Existing `POST /api/bookings` remains unchanged until U08. |
| BR-U01-003 | One accepted command creates one immutable `bookingId`, one booking reference and revision `1`. | Partial or duplicate effects roll back or replay. |
| BR-U01-004 | A created request is `DRAFT`; U01 performs no validation, pricing, confirmation, outbox publication or physical assignment. | Later lifecycle actions remain unavailable. |
| BR-U01-005 | Reopen uses canonical `/booking/{bookingId}?tab=overview`; unknown or omitted tab resolves to Overview. | Legacy `/bookings/{id}` is not a new U01 target. |
| BR-U01-006 | Successful navigation announces created/saved status once and focuses `h1#booking-record-title`. | Reopening later does not replay the transient announcement. |

## Request-Spine Field Rules

| Rule | Field(s) | Constraint |
| --- | --- | --- |
| BR-U01-010 | `portOfLoadingUnLocode`, `portOfDischargeUnLocode` | Required syntactically valid UN/LOCODE values, active through the live authority when provider evidence is available, and distinct. |
| BR-U01-011 | `requestedDepartureDate` | Required ISO local date interpreted in the POL context; remains operator authority and is never overwritten by ETD. |
| BR-U01-012 | `voyageId`, `voyageVersion`, source | A selected voyage identity and source are mandatory and come from the live route-compatible seam; version may be absent only when the authority does not supply it. Typed but uncommitted free text is not canonical. |
| BR-U01-013 | `carrierVoyageNumber`, `estimatedDepartureAt`, `estimatedArrivalAt`, `cargoCutoffAt`, `documentationDeadlineAt` | Provider-derived, read-only and captured only when supplied by the authoritative selected voyage. |
| BR-U01-014 | `equipmentTypeCode` | Required canonical FCL-dry ISO size/type code from the permitted option set. |
| BR-U01-015 | `quantity` | Required integer `1..9999`; PB-01 live evidence uses exactly `3`. It must not be collapsed to one or expanded to physical units. |
| BR-U01-016 | `equipmentId` | Must be null on initial U01 draft. Empty string, placeholder, synthetic ID and per-quantity fabricated IDs are forbidden. |
| BR-U01-017 | Fixed scope | Currency remains `USD`, cargo mode `FCL_DRY`, reefer false, dangerous goods false. These fixed facts do not authorize guessed commercial data. |
| BR-U01-018 | Persistence | Every authoritative U01 field is explicit in the typed current snapshot/projection; no new authoritative fact lives only in `attributes`. |

The complete U02 text, party, commodity, packaging, weight and volume rules are not silently enforced as U01 proof. Existing compatibility inputs may remain necessary for the current service, but they do not broaden U01 acceptance or become guessed defaults.

## Voyage Authority Rules

| Rule | Binding behavior |
| --- | --- |
| BR-U01-020 | Reference Data remains the voyage and schedule authority; Booking stores a governed snapshot, not a copied master. |
| BR-U01-021 | Candidate lookup is constrained by POL, POD and requested departure, and the committed candidate must match the chosen `voyageId` and route. |
| BR-U01-022 | Requested date and carrier ETD are distinct facts even when their local dates differ. U01 applies no unapproved tolerance. |
| BR-U01-023 | Booking captures source/version plus every available carrier number and schedule instant from the selected candidate. |
| BR-U01-024 | Missing provider facts do not block draft save. The record remains truthfully incomplete and no missing instant, number, source or version is guessed. |
| BR-U01-025 | Full stale/partial/incompatible/temporal classification, variance explanation and recovery behavior are U03 responsibilities. U01 exposes only the thin truthful seam needed to preserve available evidence. |

## Idempotency and Operation Rules

| Rule | Binding behavior |
| --- | --- |
| BR-U01-030 | The browser generates one opaque UUID `operationId` before create; the same value is the create idempotency key. |
| BR-U01-031 | Duplicate click, Enter, touch, network retry and explicit permitted retry reuse the same identity for the same normalized payload. |
| BR-U01-032 | The operation binds to actor/tenant scope, operation type and normalized payload fingerprint. Same identity plus different payload returns `IDEMPOTENCY_CONFLICT` without mutation. |
| BR-U01-033 | Same identity plus same payload returns the recorded result and produces no duplicate booking, activity, audit transition or outbox effect. |
| BR-U01-034 | `IN_PROGRESS` or `OUTCOME_UNKNOWN` permits only non-mutating status Refresh. It never authorizes a second create or new identity. |
| BR-U01-035 | Stored or effective `NOT_ACCEPTED` permits one same-identity retry only when evidence proves no effect, `retryEligible=true`, and status supplies expected claim version plus a signed scope/type/fingerprint/version-bound retry grant. |
| BR-U01-036 | `EXPIRED` is an inspect/manual-resolution terminal state and never implies retry safety. |
| BR-U01-037 | Status lookup works before a booking ID is known and authorizes using recorded actor/tenant scope and original create policy. |
| BR-U01-038 | Missing and inaccessible operation IDs return the same safe protected-absence response. |
| BR-U01-039 | Payload edit before a command starts may mint a new identity. Once a command is in flight, the original identity is retained for status recovery. |
| BR-U01-039A | The fingerprint covers the exact canonical U01 command JSON: schema version, booking customer, ordered routing leg(s), requested date, mandatory selected-voyage identity and explicit nullable version, ordered equipment line(s), and fixed scope facts. It excludes service-resolved source/schedule output, operation/correlation/actor and display labels. |

## Transaction and Persistence Rules

| Rule | Binding behavior |
| --- | --- |
| BR-U01-040 | New U01 records use the additive current snapshot/projection writer. |
| BR-U01-041 | Claim transaction C1 inserts a globally unique `operationId` row with immutable scope/type/fingerprint, opaque owner token, monotonic claim version, bounded lease and attempt. |
| BR-U01-042 | Result transaction C2 locks and fences the active claim; Booking snapshot, searchable projection, revision, safe activity/audit fact and `SUCCEEDED` operation result then commit atomically. |
| BR-U01-043 | A failed C2 transaction exposes no successful result and leaves no partial draft/projection/activity; the nonterminal claim becomes reclaimable only after lease expiry and fencing. |
| BR-U01-044 | Status Refresh is read-only and may derive effective `NOT_ACCEPTED` without changing stored `IN_PROGRESS`. Only dedicated `POST /operations/{operationId}/retry` with expected claim version, signed retry grant and original canonical request may compare-and-set an expired/proven-effect-free claim. |
| BR-U01-045 | Current-record reads return exact date, instant, code/version, integer quantity, nullable equipment ID and revision values. Display formatting is not persistence authority. |
| BR-U01-046 | Pre-W3 upcast, backfill, migration ledger, restart and correction are U04 work. U01 neither rewrites nor fabricates legacy data. |
| BR-U01-047 | U01 emits no `booking.confirmed` event and creates no confirmation outbox row. |

## Authorization, Privacy and Error Rules

| Rule | Binding behavior |
| --- | --- |
| BR-U01-050 | The BFF and Booking service enforce `create` independently; reopen requires `read`. |
| BR-U01-051 | Denial occurs before protected provider lookup, persistence mutation, audit detail or result disclosure. |
| BR-U01-052 | Errors contain stable code, safe field path/reason, recovery class and correlation reference where applicable. Raw exceptions do not cross the trusted boundary. |
| BR-U01-053 | Logs, metrics, traces, operation records and evidence exclude raw party/customer/cargo text, secrets and full provider payloads. |
| BR-U01-054 | Correlation propagates browser/BFF/Booking/provider/persistence evidence without becoming a high-cardinality metric label. |
| BR-U01-055 | Not-found and unauthorized reads disclose no booking existence, customer, route or schedule fact. |

## UI State and Recovery Rules

| Rule | State | Required behavior |
| --- | --- | --- |
| BR-U01-060 | Untouched | Persistent labels, no validation noise, normal reading order. |
| BR-U01-061 | Routed/reference loading | LinerCore content-shaped `Skeleton`; affected region busy; completion is polite and does not steal focus. |
| BR-U01-062 | Validation blocked | Preserve all values, focus `#booking-errors`, link errors to controls. |
| BR-U01-063 | Save pending | Disable duplicate submit, set busy semantics, announce saving in dedicated polite status. |
| BR-U01-064 | Client/BFF outcome unknown | Preserve form and UUID, focus `#save-status`, offer only explicit Refresh status; the timeout itself writes no Booking journal state. |
| BR-U01-065 | Explicit non-acceptance | Preserve form and UUID; offer same-identity Retry once only when server declares eligibility. |
| BR-U01-066 | Saved/replay succeeded | Navigate to `/booking/{bookingId}?tab=overview`, announce once and focus record heading. |
| BR-U01-067 | Denied/protected absence | Focus safe page status and expose no protected facts. |
| BR-U01-068 | All states | Preserve permitted form, route and list context; never put `aria-live` on the whole form. |
| BR-U01-069 | Dirty Cancel | Open the shared discard Dialog; Keep editing/Escape restores focus to Cancel, while confirmed discard returns to validated `returnTo` or `/booking`. |
| BR-U01-070 | One-time success notice | Use a non-sensitive same-tab flash keyed by booking/result identity, consume/delete it before announcement, and suppress it on refresh, direct reopen and bfcache restore. |

All controls remain keyboard operable, use visible focus, text plus non-color status, reduced-motion behavior, and the shared light/dark token system. Required evidence widths are 375, 390, 768, 1024 and 1440 px plus 200% zoom.

## Business Invariants

1. Exactly one booking exists for one successful operation identity and payload.
2. A successful U01 booking has stable ID, booking reference, revision `1`, state `DRAFT`, quantity `3` in PB-01 evidence, and null `equipmentId`.
3. Requested departure remains operator-owned and selected schedule facts remain provider-derived.
4. No missing schedule, equipment or identity fact is fabricated.
5. Refreshing operation status is non-mutating.
6. New current U01 writes are typed and additive; legacy evolution is not performed early.
7. No protected provider work or record detail occurs after an authorization denial.
8. The UI uses one canonical Booking composition and no Booking-local design-system primitive or theme.

## Stable Result Vocabulary

U01 must preserve at least `ACCESS_DENIED`, `IDEMPOTENCY_CONFLICT`, `COMMAND_IN_PROGRESS`, `OUTCOME_UNKNOWN`, `REFERENCE_UNAVAILABLE`, `VOYAGE_ROUTE_MISMATCH`, `VOYAGE_SCHEDULE_INCOMPLETE`, and safe field validation codes. Transport timeout is not automatically equivalent to provider or transaction non-acceptance.

Operation states are `IN_PROGRESS`, `SUCCEEDED`, `REJECTED`, `OUTCOME_UNKNOWN`, `NOT_ACCEPTED`, and `EXPIRED`. Recovery values are limited to `REFRESH_STATUS`, `RETRY_ONCE`, `CORRECT_INPUT`, `INSPECT`, `RETURN_TO_LIST`, or a safe terminal state. The service, not the browser, decides retry eligibility.

## Deferred Rules and Forbidden Shortcuts

- Do not implement both create endpoints independently.
- Do not remove the legacy create endpoint in U01.
- Do not store new W3-04 request facts only in an attributes map.
- Do not execute pre-W3 backfill or correction in U01.
- Do not require all schedule facts merely to save a draft.
- Do not implement the entire U03 schedule matrix early.
- Do not auto-poll indefinitely, blind-resubmit, or mint a new identity after uncertainty.
- Do not stay on a read-only create form after success or navigate to the plural legacy route.
- Do not edit `packages/ui`, create a local primitive/theme, or introduce a second Booking page.

## Upstream Traceability

- `unit-of-work.md`: U01 ownership, boundaries and live Definition of Done.
- `unit-of-work-story-map.md`: US-01 primary outcome and cross-cutting security/evidence contributions.
- `requirements.md`: FR-005, FR-008 through FR-010, FR-024 through FR-030; AC-001; NFR-001 through NFR-010.
- `components.md`: request form, command/query services, voyage port, operation journal and current persistence.
- `component-methods.md`: canonical draft/status/detail/voyage endpoints and method contracts.
- `services.md`: service ownership, synchronous boundaries, recovery and privacy model.

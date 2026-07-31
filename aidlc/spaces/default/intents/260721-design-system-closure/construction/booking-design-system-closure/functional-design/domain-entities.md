# Domain Entities — booking-design-system-closure

## Modelling Boundary

The Unit in `unit-of-work.md` and story map in `unit-of-work-story-map.md` require a presentation closure, not a new Booking domain model. `requirements.md`, `components.md`, `component-methods.md`, and `services.md` establish that existing Booking/service entities remain authoritative. The entities below are transient UI/evidence models or references to existing service-owned data; none creates a table, event schema, or cross-service aggregate.

## Existing Service-Owned Entities

| Entity | Owner | Identity/lifecycle used by UI | Closure treatment |
|---|---|---|---|
| Booking | Booking service/database | Existing Booking ID and returned lifecycle status | Read/render unchanged; commands use existing endpoints |
| Validation snapshot/result | Booking/reference service contract | Existing validation outcome and field/domain details | Normalize only for accessible presentation |
| Pricing snapshot/result | Booking/pricing contract | Existing amount, currency, source agreement/rate evidence, availability | Render unchanged in operational hierarchy |
| Reference option | Reference Data service | Stable IDs plus readable labels | Existing lookup semantics retained |
| Authenticated subject/session | Identity/Keycloak/shell | Subject, roles, session status | Passed through existing seams; never persisted by UI |
| Correlation/idempotency metadata | BFF/service boundary | Existing request identity/protection | Propagated and retained in technical evidence only |

## Presentation Result

`BookingPresentationResult<T>` is a discriminated, transient route view model:

| Variant | Data | Allowed commands |
|---|---|---|
| `loading` | Stable layout descriptor | None |
| `empty` | Message/context, primary create action | Create |
| `populated` | Typed list/detail payload and query context | Derived from existing route/status behavior |
| `denied` | Safe explanation and navigation target | Safe navigation only |
| `error` | Normalized safe failure, retryability, correlation-safe reference | Retry when explicitly recoverable |
| `degraded` | Usable payload plus unavailable capability/message | Unaffected commands plus bounded retry |

The view model contains no independent lifecycle status. A populated/degraded payload embeds the last returned Booking representation. The adapter maps existing `ShellBookingLoad` success/failure shapes to this vocabulary exactly once; no `ready` alias exists.

## Route Query and Navigation State

`BookingListQuery` contains only existing supported search/filter/pagination fields. Its invariants are:

- URL serialization is stable and safe for refresh/back navigation.
- Unknown query keys are ignored rather than forwarded as presentation control.
- No query key selects a synthetic UI state, theme override, auth bypass, or service result.
- Standalone redirects preserve only this allow-listed context.

`CanonicalBookingLocation` is one of list, create, or detail with a valid encoded Booking ID. It cannot resolve to a standalone module port. A `BookingRedirectDecision` contains a destination built from a trusted canonical shell origin and permanent status 308, or returns no decision for `/api/**`/non-presentation input. List keys are exactly `page`, `pageSize`, `sort`, `direction`, `status`, and `q`; detail preserves only `created=1`; create preserves none. Invalid identity falls back to list.

## Form and Action State

`BookingFormState` is route-local and transient:

| Attribute group | Meaning | Persistence |
|---|---|---|
| values | Existing Booking create-field vocabulary | Memory for current route/component lifecycle |
| touched/dirty | Operator interaction and navigation protection | Memory only |
| clientErrors | Immediate presence/shape findings | Recomputed |
| serviceErrors | Existing normalized validation details | Replaced by latest service response |
| submittedSnapshot | Values associated with current command | Until command resolves/retries |
| booking | Last returned Booking representation | Until navigation/refresh |

`BookingActionState` is a discriminated union:

| Variant | Retained state | Focus/announcement | Retry |
|---|---|---|---|
| `idle` | Last returned Booking/form | No forced movement | Permitted command only |
| `pending(command)` | Submitted snapshot and last returned Booking | Command status; polite busy announcement | No duplicate/conflicting command |
| `success(command, booking)` | Returned Booking and valid form data | Success status; detail heading after navigation | Next permitted command |
| `validationBlocked(command, failure)` | All valid values and field/domain details | Error summary, then linked fields | Only after correction |
| `recoverableError(command, failure)` | Submitted snapshot and last returned Booking | Command error/status region | Explicit same-command retry |
| `denied(failure)` | Safe already-rendered context only | Denied heading/safe action | None |
| `degraded(capability, failure, booking?)` | Last Booking and unaffected capabilities | Named degraded status | Only affected capability when safe |
| `fatalError(failure)` | Durable failure evidence only | Route error boundary | Safe navigation, no command retry |

It permits exactly one pending command and never changes the Booking representation without a successful service response.

## Accessibility State

`BookingFeedback` contains:

- severity/tone from the shared semantic vocabulary;
- concise heading and actionable message;
- field associations or summary target;
- live-region mode chosen to avoid duplicate announcements;
- retry/safe-navigation action when permitted;
- optional correlation-safe support reference.

It excludes raw stack traces, tokens, cookies, PII, raw Kafka payloads, schemas, or internal URLs. Focus target is a transient interaction instruction, not stored domain data.

## Evidence Entities

| Entity | Required attributes | Relationship |
|---|---|---|
| Evidence run | commit, timestamp, wrapper command, Compose project, base route, direct exit results | Parent of all captures |
| UI case | requirement/story IDs, route, state-generation method, viewport, theme, assertions | Belongs to evidence run |
| Capture | screenshot/trace/result path and status | Belongs to UI case |
| Gate result | command, start/end, exit code, output path | Belongs to evidence run |
| Closure decision | all-gates-green boolean, unresolved failures, backlog action | Derived only from complete run |

An evidence run must name `linercore-wave-a`. A guard result observes the manager demo without making it part of the acceptance lifecycle. A closure decision cannot be green if any expected UI case, gate result, final guard, or audit is missing.

## Relationships and Lifecycle

- Shell session owns authentication context; Booking presentation consumes it.
- Booking route owns transient query/form/action/feedback state.
- Booking service owns Booking, validation, pricing, confirmation, persistence, and event truth.
- Shared UI owns generic visual/interaction primitives but no Booking entity.
- Acceptance harness owns evidence models and never flows them into production code.

These relationships preserve one-directional dependencies: shared UI ← shell Booking composition → shell adapter → Booking BFF → services, with evidence driving the public route from outside.

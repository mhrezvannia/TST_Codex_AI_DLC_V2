# Business Logic Model - U04 Container Journeys and Booking Relationship Uplift

## Source Alignment

This design implements U04 from `unit-of-work.md`, its US-011, US-012, US-013, and US-014 assignments in `unit-of-work-story-map.md`, and `requirements.md`. It refines the approved boundaries in `components.md`, the public seams in `component-methods.md`, and the deployment and ownership model in `services.md`. Binding UI authority is the approved W4 requirements and security/accessibility contract, LinerCore MASTER and executable `@erp/ui`, the `container-movement.md` page contract, then advisory UI/UX Pro Max output. U04 adds one new frontend deployable and no backend service, database, Kafka topic, AWS resource, shell, theme, or shared-component fork.

The answered `functional-design-questions.md` selects the new `apps/container-movement` deployable with a matching base path and no invented legacy redirect (Q1), a bounded-`limit` recent list with a server-derived actor (Q2), a provider-owned `timelineV1` (Q3), an opt-in v2 media contract carrying a bound HMAC subject assertion (Q4), a server-issued capture-attempt token (Q5), one exhaustive result union over four separate event truths (Q6), exact-ID Booking/Journey navigation with signed bounded origin tokens (Q7), the bounded active-location port with region-scoped degradation (Q8), one `PlatformShell` over shared primitives (Q9), and the full live evidence bar in which the poison/replay exit is a hard completion condition (Q10).

## Brownfield Baseline and Named Blockers

Source evidence establishes the starting position:

- there is no prior Container Movement frontend, so U04 is the first canonical UI entrypoint and creates no compatibility redirect;
- the existing default CMM JSON response and the actor-shaped internal v1 contract remain compatible for internal callers but are not public browser seams;
- the canonical Booking composition is `apps/shell/app/booking/[bookingId]/page.tsx` with its shell Booking client, not `apps/booking`;
- Booking and CMM publishers use owned outbox records with `PENDING`, retryable-delay, and permanent-failure dispositions; CMM consumes `booking.confirmed` idempotently with revision guards; Booking consumes `containermovement.status` with durable receipts, duplicate suppression, and stale-projection rules;
- both Kafka listeners use stable consumer groups and concurrency three, with **no** configured error handler, bounded retry policy, dead-letter topic, poison ledger, or replay contract;
- Identity has not registered `container-movement:read` or `container-movement:capture`.

Three named blockers therefore govern this unit and are never substituted locally: the W2-02 shared shell release, exact Identity capability registration with executable policy tests, and the listener poison/bounded-retry/DLQ/replay ownership evidence. Each has an owner and a verification seam.

## Canonical Deployable and Route Workflow

`apps/container-movement` is created with `basePath=/container-movement`, rendering the shared W2-02 `PlatformShell` at its root layout from first implementation. Nginx mounts `/container-movement*` preserving the full URI, so Next assets resolve under `/container-movement/_next/*` and direct navigation or refresh is an ordinary full-document request to the owning app. The host-wide session cookie uses `Path=/`. The public edge applies the same eleven-header clear list and five trusted replacements as every other location; internal BFF-to-service calls bypass that policy and set their own trust headers.

Canonical routes are `/container-movement` (recent list) and `/container-movement/journeys/[journeyId]` (stable detail). The module root returns 200. A base-path-aware internal `/api/health` exists for container health checks and authorizes no domain read. No CMM legacy redirect is created in any form, because no prior frontend existed; any legacy-looking CMM path returns 404.

## Recent Journey List Workflow

1. Resolve `/container-movement` with the authenticated session.
2. Reauthorize `container-movement:read` for this request. `denied` and Identity outage terminate before any CMM or Reference call, with no data flash.
3. Parse the query strictly. The only accepted control is a bounded `limit` in {25, 50, 100}, defaulting to 25, plus bounded `focus` for return context. Any other key — including an actor identifier, search term, filter, sort, cursor, or page — is a duplicate/unknown key and returns `invalid-query` / HTTP 400 before provider access.
4. Derive the authenticated actor server-side. The browser never supplies or influences whose Journeys are returned.
5. Request the provider recent list at the validated limit and render its fixed recent order as authoritative.
6. Render columns container, Booking, status, freshness, and the latest accepted event **only if** the provider's public ordering for that field is confirmed; absent that confirmation the column is omitted rather than derived.
7. Report `returned` from the provider. No total is fabricated, and no pagination affordance implies one.
8. Resolve location labels through `CmmReferenceLocationsPort` with `usage: "label"`, falling back to safe raw authorized IDs with `Label unavailable`.
9. Map `ok`, `invalid-query`, `not-found`, `denied`, authorized `stale`, and `unavailable` exhaustively into the applicable list states of FR-010.

True empty renders `No recent Journeys returned` with no create call to action, because U04 has no Journey-creation control. Filtered empty does not apply: no admitted filter can produce it, so the state is not offered.

## Journey Detail and Timeline Workflow

Detail resolves by stable `journeyId`. The CMM BFF requests `application/vnd.linercore.container-journey-v2+json` on the existing GET endpoints, carrying a verified subject assertion. The response's `timelineV1` is computed inside the owning CMM service from its current expected and history state; it is not persisted as a second authority and is never recomputed downstream.

The provider merge rules are deterministic and belong to the service alone:

1. Canonical stage order is GTOT, LOAD, DISC, GTIN. `GTOT` and `ACT_GTOT` map to GTOT; `ACT_LOAD`, `ACT_DISC`, and `ACT_GTIN` map to LOAD, DISC, and GTIN.
2. LOAD and DISC expected locations come from current expected movements. GTOT inherits LOAD's expected location and GTIN inherits DISC's. A missing expected location stays absent and is never guessed.
3. Every accepted history record is retained. Current canonical events occupy their canonical stage in accepted-history order. A planned item is emitted only when its canonical stage has no accepted record.
4. Repeated legacy records are not deduplicated; they remain separate `LEGACY_ACCEPTED` entries. Unsupported legacy event types become `OTHER`, are labelled from a producer allow-list, follow the four canonical stages in original history order, and never advance next-move truth.
5. Recorded items carry actual location, occurrence, event ID, and correlation. Planned items carry expected location and sequence only.
6. `receivedAt` and `source` remain absent because current Journey state does not own those facts. The UI must not render an absent fact as a value or as a labelled unavailable value.

The BFF and browser never merge, deduplicate, calculate a next move, infer lateness, match expected against actual, or invent lifecycle. Summary renders exact Journey, container, and Booking identity, revision, provider status, freshness, dependency, capture availability, and only supplied timestamps.

## Trusted Identity and V2 Contract Workflow

W4 adds opt-in media types on the same endpoints: `application/vnd.linercore.container-journey-v2+json` for reads and `application/vnd.linercore.container-movement-command-v2+json` for capture. The existing default JSON is unchanged and the actor-shaped v1 contract remains an internal compatibility surface that Nginx never exposes.

The CMM BFF follows the existing Charge assertion pattern rather than forwarding browser authority. It issues a short-lived HMAC assertion binding issuer, key ID, authenticated subject, HTTP method, normalized provider path, correlation ID, issued and expiry time, and a nonce. The v2 controller verifies it with a dedicated key, ignores or rejects any actor query or body field, and maps the verified subject into the existing application ports. The v2 command body contains only `eventCode`, `locationId`, and `occurredAt` — no actor, idempotency, correlation, container, or lifecycle field.

## Active Location Resolution Workflow

`services.md` names a CMM-to-Reference "active location options" seam, but — unlike the Charge port, which received a full public interface at Application Design Gate Revision 1 — no capability name, route, request shape, cardinality, or failure mapping was ever declared for it. U04 cannot be implemented on an unspecified seam, so this design specifies it exactly, mirroring the approved `ChargeReferenceOptionsPort` shape. It is an **additive public contract requiring producer and consumer sign-off**, recorded as such rather than assumed; until its contract tests pass, the capture location gate stays closed and capture is unavailable with its own precise reason.

```typescript
interface CmmLocationOptionQuery {
  usage: "capture" | "label";
  q?: string;
}
interface CmmLocationOptionVm { id: StableId; code?: string; label: string }
interface CmmLocationOptionsVm { options: readonly CmmLocationOptionVm[]; returned: number }

interface CmmReferenceLocationsPort {
  listActiveLocations(
    context: AuthenticatedRequestContext,
    query: CmmLocationOptionQuery
  ): Promise<ReadResult<CmmLocationOptionsVm>>;
}
```

The browser calls `GET /container-movement/api/location-options` with exactly one `usage` and optionally one `q`; duplicate or unknown keys return `invalid-query` / HTTP 400 with no provider call. The trimmed `q` is at most 128 characters. The CMM BFF first requires `container-movement:read` for the current request, then calls the existing Reference read `GET /reference-sets/LOCATION/records?includeInactive=false&page=0&size=50` using the existing fixed Reference service credential and a trusted correlation header. The result is at most 50 ACTIVE `{id, code?, label}` options.

Four outcomes stay distinct and are never collapsed: `invalid-query`, `denied` (CMM read capability refused), `unavailable` (Reference outage or malformed payload), and a successful empty list (no ACTIVE match). `usage: "label"` serves read surfaces and degrades to safe raw authorized IDs with `Label unavailable`. `usage: "capture"` serves the canonical capture selector; when it cannot return verified options, the capture location gate closes and capture is disabled with its own reason, distinct from the provider's `captureDisabledReason`. There is no Reference app import, shared SQL, cache authority, broad client merge, or mutation on this port.

## Movement Capture Workflow

1. Reauthorize `container-movement:read` and then `container-movement:capture` for this request. Capture renders only when the capture capability is allowed **and** the provider reports `captureEnabled=true`; otherwise the provider's `captureDisabledReason` is shown verbatim.
2. Independently, if `CmmReferenceLocationsPort` with `usage: "capture"` cannot verify canonical locations, capture is disabled with its own precise reason. The two disable reasons are reported distinctly and never merged into one generic disabled state.
3. After read and action ALLOW, the BFF issues a signed short-lived `captureAttemptToken` binding subject, journey ID, provider `updatedAt`, action, and a server-generated random idempotency key.
4. The browser echoes only the opaque token plus `eventCode` in {GTOT, LOAD, DISC, GTIN}, `locationId`, and `occurredAt`. Container identity is read-only.
5. On submit, block duplicate activation and set pending. Only the initiating command is disabled.
6. The BFF verifies the token's signature, expiry, subject, journey, and action; forwards its embedded key as `Idempotency-Key`; derives correlation from request context; and issues the bound subject assertion.
7. Map exactly one terminal disposition. A definitive validation or conflict outcome issues a replacement token. An unknown outcome retains the original token and requires an authoritative re-read before any retry.
8. Confirmed success requires an authoritative Journey re-read. No status, timeline entry, or next-move expectation advances anywhere in the client before that re-read.

## Capture Outcome Decision Model

U04 defines one exhaustive CMM-local result and transport union. Upstream `MutationResult<T>` cannot represent known acceptance without an authoritative `T`, and U04 additionally requires `duplicate` and `out-of-sequence` as distinct branches rather than one collapsed conflict.

| Disposition | Meaning | UI / recovery | Retry rule |
| --- | --- | --- | --- |
| `accepted-confirmed` | Provider accepted and the authoritative Journey re-read returned `ok` | 200; Journey detail value, event ID, correlation, reference | Not applicable |
| `accepted-unconfirmed` | Acceptance is known but the confirmation read is denied, unavailable, or not yet visible | 202; journeyId, reference, recovery `REFETCH`; never carries submitted input as truth | Reauthorize and re-read only |
| `validation` | Command rejected with field or general issues | 422; retain values, linked error summary, replacement attempt token | User correction; new authorization on submit |
| `duplicate` | The provider recognised the idempotency key as already applied | 409; show the already-recorded movement from authoritative truth; no second record implied | None; re-read is sufficient |
| `out-of-sequence` | The provider rejected the movement against its expected sequence | 409; provider code, current lifecycle, required next move, reference | User correction only |
| `denied` | Capture authorization refused for this request | 403; retain values, remove the command, concise reason | No automatic retry |
| `not-found` | Journey identity no longer resolves | 404; safe recovery target, reference | Re-read or navigate |
| `unavailable-known-no-mutation` | Evidence proves Identity or the CMM provider did not accept the command | 503 before dispatch, 502 for known provider rejection or protocol failure; reference, retry `RESUBMIT` | User-triggered retry with reauthorization |
| `unavailable-unknown-outcome` | Timeout or disconnect after dispatch | 503/504; journeyId, retained attempt token, reference, recovery `REFETCH` | Mandatory authoritative re-read before any retry |
| `unexpected` | BFF invariant failure, or malformed / unmapped provider response | 500 with boundary `BFF`; 502 with boundary `PROVIDER_PROTOCOL`; safe reference | No blind replay |

Every CMM API route and reducer switches exhaustively over this union. Form context, entered values, and focus are retained on every non-confirmed branch. Only safe reference evidence is primary; raw transport and payload evidence stays in a collapsed, access-appropriate disclosure.

## Four Separate Event Truths

Journey persistence, CMM outbox publication, broker delivery, and Booking projection application are four separately observable facts. The UI renders each only from its own evidence and never infers a later truth from an earlier one:

| Truth | Evidence owner | Rendering rule |
| --- | --- | --- |
| Journey persisted | CMM aggregate, via authoritative re-read | The only truth an accepted capture establishes |
| Published to outbox | CMM outbox record disposition | Shown only from an approved public contract; absent one, not shown at all |
| Delivered by broker | Kafka delivery | Never claimed by the UI |
| Applied to Booking projection | Booking projection evidence | Shown only from Booking's own authorized read |

A successful write is never labelled Published or Applied without matching evidence, and no aggregate or roll-up status is derived across the four — any roll-up would re-introduce exactly the inference this model forbids. History is append-only; no correction, publication status, or Booking-application status appears absent an approved public contract.

Because W4 adds no topic, the missing listener poison/bounded-retry/DLQ/replay controls remain a BLOCKED platform and service-owner dependency rather than an existing pass. The current blast radius is explicit: one poison record can repeatedly block its partition, while other partitions, owning-service persisted truth, synchronous module reads, and direct Booking-to-Journey lookup remain available. CMM-to-Booking lag affects Booking's projected movement evidence only, never CMM Journey truth.

## Booking and Journey Relationship Workflow

Both implementable directions use exact provider identifiers and independent target authorization.

**Journey to Booking.** Detail renders a native link to `/booking/[bookingId]` built from the Journey's verified stable `bookingId`. The target authorizes independently, so a denied Booking still renders the shared denied state. An absent `bookingId` is a provider contract failure surfaced as such — never a search prompt, and never derived from container identity or a projection label.

**Booking to Journey.** The adapter lives beside `apps/shell/app/booking/[bookingId]/page.tsx` and its shell Booking client. It authorizes, then calls CMM v2 by exact `bookingId`. Four outcomes stay distinct: `present` renders `/container-movement/journeys/[journeyId]` from the returned provider ID; `not-created` renders `Journey not created`; `denied` renders no Journey data; `unavailable` renders a scoped Retry that preserves the Booking page. No Journey ID is ever inferred from projected statuses, and canonical Booking ownership does not move to `apps/booking`.

**Bounded origin.** Cross-module links carry no arbitrary `returnTo`. The source BFF issues a signed, URL-safe origin token capped at 512 characters and ten minutes, bound to the session subject, the exact source kind and record ID, its canonical href, and the expected target module. Journey-to-Booking uses `{kind:"journey-detail", journeyId, href:"/container-movement/journeys/<id>"}`; Booking-to-Journey uses `{kind:"booking-detail", bookingId, href:"/booking/<id>"}`. The target BFF verifies the token before rendering a Back link; a missing, invalid, or expired token falls back to the target canonical root. Returning from CMM restores the invoking Booking relationship link when the context is valid.

Agreement-to-Booking and Booking-to-Agreement remain BLOCKED per the `requirements.md` Cross-Link Direction Matrix and are not implemented here.

## Degradation, Denial, and Partial-Failure Workflow

Authorization is always evaluated fresh for the current request. `denied` and Identity outage both stop before any CMM or Reference call; Identity outage maps to retryable `unavailable` / HTTP 503 with zero provider calls.

Last-known business truth renders only when the owning provider returns it with source and time under current authorization, and every freshness-dependent action is disabled with a precise reason while it is shown. Browser memory, fixtures, local storage, and cached authorization are never fallback truth.

Partial failure is scoped to the owning region. The timeline, the Booking-relationship region, and location labels each resolve independently, so one region's failure renders its own state with an exactly owned Retry while verified Journey truth and context remain intact. Summary and timeline arrive together in the one v2 detail read and therefore share that read's result; the Booking relationship and location labels are separate calls and fail separately. A dependency failure never blanks the record and never fabricates completeness.

## Data Transformations

- Route parser: raw path and query to a validated `journeyId` and a bounded `limit`; unknown keys, including any actor field, fail closed before provider access.
- Assertion issuer: authenticated context plus target method and normalized path to a short-lived bound HMAC subject assertion.
- Attempt-token issuer: authorized context plus journey, provider `updatedAt`, and action to a signed token carrying a server-generated idempotency key.
- Journey adapter: `JourneyProviderV2` including provider-computed `timelineV1` to labelled recent-row and detail view models, with no local merge or ordering.
- Location adapter: bounded active Reference locations to typed options, with raw authorized ID fallback and capture disablement when validation is unavailable.
- Relationship adapter: exact `bookingId` lookup result to the four distinct relationship outcomes.
- Origin-token codec: canonical source record and target module to a signed bounded token, and back, with canonical-root fallback.
- Outcome reducer: policy, transport, provider, and re-read results to exactly one terminal disposition.

## Scenario and Requirement Coverage

| Scenario | Story / requirements | Required proof |
| --- | --- | --- |
| Canonical CMM entry and route safety | US-011; FR-001, FR-002, FR-018, FR-022 | New deployable, base path, direct refresh and assets, health, 200 root, no invented redirect |
| Recent list without simulated controls | US-011; FR-009, FR-010 | Bounded limit only, server-derived actor, fixed order, `returned` copy, unknown-key 400 |
| Journey detail and provider timeline | US-012; FR-007, FR-011 | All-history retention, repeated legacy evidence, missing expected evidence, absent `receivedAt`/`source`, no local merge |
| Exact Booking navigation both ways | US-012, US-014; FR-014, FR-015, FR-016 | Present, not-created, denied, degraded outcomes; signed bounded origin both directions; invalid-origin fallback |
| Capture without optimistic advancement | US-013; FR-008, FR-012, FR-013 | Capability plus `captureEnabled`, attempt token, duplicate-submit block, authoritative re-read |
| Capture outcome matrix | US-013; FR-011, FR-013; NFR-005 | Accepted, duplicate, validation, out-of-sequence, denied, unknown, unexpected all distinct with retained context |
| Four event truths separated | US-013; FR-008; NFR-010, NFR-011 | Persisted, published, delivered, applied never conflated; no derived roll-up status |
| Trusted boundary and spoof rejection | US-011-US-014; FR-020; NFR-004 | Assertion verification, actor field rejection, no provider call on DENY, no direct service exposure |
| Degradation and recovery | US-012, US-013; FR-019, FR-021 | Region-scoped failure, stale source and time, raw-ID label fallback, disabled unsafe capture |
| Unit quality contribution | NFR-001, NFR-002, NFR-003, NFR-004, NFR-005, NFR-009, NFR-010, NFR-011, NFR-012 | Five widths, two themes, keyboard/screen-reader/reduced-motion/zoom, warmed 10-user route/BFF sample, live Compose |
| Intent-exit quality verdict | NFR-006, NFR-007, NFR-008 | Changed-frontend coverage, combined blocking gates, bounded W4 security aggregation |

## Completion Boundary

U04 closes only on the integrated stack, where an authorized Container Operations user opens the new canonical root and a stable Journey detail in the one shared shell, sees provider-ordered timeline and history and an exact Booking link, then submits accepted, duplicate, validation, out-of-sequence, conflict, unknown-outcome, publication-pending, and Booking-applied fixtures without any optimistic advancement. The Booking page must resolve present, not-created, denied, and degraded Journey outcomes, and both directions must validate bounded origin context. Direct refresh, assets, and health; capability denial; assertion and header spoof rejection; target-scoped outage; active-location degradation; idempotent retry; event-truth separation; and the absence of a CMM legacy redirect must all be observed. The complete journey must pass keyboard, screen-reader, reduced-motion, and zoom checks at 375, 390, 768, 1024, and 1440 CSS pixels in both themes without page-level overflow, with a documented warmed ten-user route and BFF sample recording the NFR-001 method and both p95 thresholds.

**U04 and the intent remain not done while the listener poison, bounded-retry, DLQ, and replay exit lacks executable owner evidence or an approved bounded replacement.** Truthful `BLOCKED` labelling is honest reporting, not completion. Static scans, mockups, screenshots, container startup, or unit tests alone are never live acceptance.

## Review Resolution - Iteration 1

**The unspecified CMM active-location port is now fully specified.** The finding is accepted as accurate: `services.md` named a CMM-to-Reference active-location seam, but Application Design never declared its capability, route, request/response shape, cardinality, or failure mapping — the same defect `components.md`'s own Iteration-2 review caught and closed for the analogous Charge port, never applied to CMM. Three artifacts depended on that unspecified seam.

A new `## Active Location Resolution Workflow` section declares `CmmReferenceLocationsPort` in full, mirroring the approved `ChargeReferenceOptionsPort`: exact query and result types, the browser endpoint `GET /container-movement/api/location-options` taking one `usage` and an optional 128-character `q`, the current-request `container-movement:read` requirement, the bounded provider call to active Reference `LOCATION` records at page 0 / size 50 with the existing service credential and trusted correlation, the 50-item cap, and four distinct failure outcomes. The `usage` discriminator ties the port to the two consumers that need it — `label` for read-surface degradation to raw authorized IDs, `capture` for the canonical selector whose unavailability closes the second capture gate.

It is recorded explicitly as an **additive public contract requiring producer and consumer sign-off**, BLOCKED with owner and evidence path until its executable contract tests pass, with the capture location gate closed rather than defaulting open in the meantime. Updated: `business-logic-model.md` (new workflow section), `business-rules.md` (BR4-070 rewritten, BR4-076 and BR4-077 added), `domain-entities.md` (typed query and result models replacing the vague `LocationOptionsVm`, plus a new Contract Fidelity Check entry naming this as a design-supplied specification of an upstream gap), and `frontend-components.md` (detail region table and shared-primitive matrix now name the port and its real blocker).

## Review - Iteration 1

**Verdict: NOT-READY**

### Validation evidence

- Read the Stage 3.1 definition (`.codex/aidlc-common/stages/construction/functional-design.md`), the answered `functional-design-questions.md` (all ten guided "A" answers), and all four produced artifacts in full as one contract.
- Cross-checked against upstream authority: `unit-of-work.md` (U04 boundary, non-responsibilities, and the hard poison/bounded-retry/DLQ/replay Definition-of-Done condition), `unit-of-work-story-map.md` (US-011/012/013/014 allocation and the requirement-to-unit ledger), `requirements.md` (FR-001..FR-022, NFR-001..NFR-012, the Provider Capability and Action Matrix's Container Movement rows, the Legacy Route Retirement Matrix, and the Cross-Link Direction Matrix), and the Application Design `components.md`/`component-methods.md`/`services.md` (Container Movement V2 Provider Contract, Container Movement BFF and Capture Attempt, Booking Journey Relationship, Safe Return Contract) including their own recorded Iteration-2 review history.
- Ran the two applicable deterministic sensors against all four artifacts via `bun .codex/tools/aidlc-sensor.ts fire <id> --stage functional-design --output-path <file>`: `required-sections` and `upstream-coverage` both returned `SENSOR_PASSED` for `business-logic-model.md`, `business-rules.md`, `domain-entities.md`, and `frontend-components.md` (fire ids `9de89d7a`/`fb4b471f`, `23183573`/`55626814`, `d4f48747`/`a1fe5643`, `be4a108f`/`b0047659`, confirmed in the audit log at `aidlc/spaces/default/intents/260803-module-list-uplift/audit/git-ae-srv-rdt1-5bc6e1ea2b05.md`). `linter`/`type-check` are not applicable: none of the four artifacts contain fenced ` ```ts```/```js```/```tsx``` ` blocks (only two ` ```text``` ` component-tree blocks in `frontend-components.md`), so neither sensor's glob matches.
- Spot-checked load-bearing factual claims against the live repository, all confirmed accurate: `apps/container-movement` genuinely does not exist yet (empty glob); no prior CMM frontend exists anywhere in `apps/*` (the only related hit, `apps/booking/app/bookings/[bookingId]/JourneyStatusPanel.tsx`, is Booking's own movement-projection display polling `/api/bookings/{id}`, not a CMM entrypoint, and is consistent with — not contradicted by — the FD's Four-Truths model); the existing `ContainerMovementApiController.java` genuinely has only the actor-shaped v1 contract (`actor` query param defaulting to `local-user`, no media negotiation, no `timelineV1`, no assertion verification) that the FD says W4 leaves untouched and non-public; the Charge subject-assertion pattern the FD says it mirrors genuinely exists as described in `apps/charge-agreements/lib/bff/subject-assertion.ts` (HMAC-SHA256 over `iss/kid/sub/mth/pth/cid/iat/exp/nonce`, 30s expiry); both `ContainerMovementMessagingConfiguration.java` and `BookingMessagingConfiguration.java` genuinely configure only `setConcurrency(3)` with no common error handler, no `DeadLetterPublishingRecoverer`, and no retry template, confirming the FD's "no configured error handler, bounded retry policy, dead-letter topic, poison ledger, or replay contract" claim and its treatment as U04's hard not-done exit condition rather than a softened one; and `ContainerMovementApplicationService.java` genuinely implements the claimed revision-guard/duplicate/stale idempotency handling (`CMM_BOOKING_CONFIRMED_DUPLICATE`, `CMM_BOOKING_CONFIRMED_STALE`, `reconcileBookingRevision`).
- Confirmed the FD correctly avoids U03's region-independence defect: `getJourney` returns one `ReadResult<JourneyDetailVm>` where `JourneyDetailVm.provider: JourneyProviderV2` already includes `timelineV1` (both declared together in `component-methods.md`), and every artifact states Summary and the timeline "share that read's result" rather than claiming independent per-region failure for that pair.
- Confirmed the `CmmMutationResult` refinement (splitting `conflict` into `duplicate`/`out-of-sequence`, adding `accepted-unconfirmed`/`not-found`/`unexpected`) genuinely follows an already-approved precedent: the peer U03 `domain-entities.md` defines an equivalent local `ChargeMutationResult` "following the precedent already approved for U02," so this is a consistent, repeated, authorized pattern rather than a fresh invention.
- Confirmed the Cross-Link Direction Matrix in `requirements.md` marks Journey<->Booking "Required and implementable" and Agreement<->Booking `BLOCKED`, exactly as the FD renders them, and confirmed `domain-entities.md`'s claim that `BookingJourneyRelationshipValue.href`'s canonical-form constraint "clos[es] the unconstrained-string gap noted in the Application Design review" is accurate: `components.md`'s own recorded Iteration-2 review found exactly that gap and recorded its fix in Review Resolution - Gate Revision 1.

### Blocking findings

1. **The "bounded active-location Reference service port" that `BR4-070`, `BR4-043`, `LocationOptionsVm`, and the "Location adapter" all depend on is never actually specified anywhere upstream, and this is the identical class of defect the Application Design's own review already caught and fixed for the analogous Charge port — but never fixed for CMM.** `component-methods.md` and `components.md` fully specify Charge's equivalent seam: `ChargeReferenceOptionsPort` (`component-methods.md` lines 190-212) declares an exact query type (`domain`, `kind`, optional bounded `q`), an exact provider call (`GET /reference-sets/{mappedSet}/records?includeInactive=false&page=0&size=50`), an exact capability gate (`charge-agreements:read`/`charge-rates:read`), and an exact response bound (<=50 typed options) — and `components.md`'s "Public Contract Closure" section explicitly lists this as resolved ("Charge-to-Reference active option lookup has a typed query/result/port and exact browser/provider endpoint, auth, correlation, cardinality, and failure mapping"). No equivalent exists for CMM: grep of `component-methods.md`, `components.md`, and `services.md` for `active-location`/`ActiveLocation`/`LocationOption`/`location port` turns up nothing but one narrative Component Catalog row ("Reference option port | Reference Data | Bounded authorized active location/reference options") and one narrative services-table cell ("CMM BFF | Reference service | service REST | active location options | read may show raw ID; capture disabled if validation unavailable") — neither names a capability, a REST route, a request/response schema, or whether it reuses the same generic `GET /reference-sets/{set}/records` contract Charge uses. `requirements.md`'s Provider Capability and Action Matrix row for "Container Movement / journey detail" is silent on it too. This is exactly the defect `components.md`'s own Review - Iteration 2 recorded and fixed for Charge ("The cataloged Charge-to-Reference port has no public interface... declares no option query/result/port method and no exact endpoint/media/auth/correlation/cardinality/failure mapping") — the identical gap simply was never raised or closed for CMM's analogous port, and now this U04 FD builds directly on top of it. `business-rules.md` BR4-070 ("Location options resolve only through the bounded active-location Reference service port with exact authorization and trusted correlation; no Reference app import, shared SQL, or cache authority exists") and BR4-043 (the second independent capture-disable gate keyed to this same port) state it as settled fact; `domain-entities.md` declares `LocationOptionsVm` as "a BFF read result from the Reference port"; `business-logic-model.md`'s Data Transformations section names a "Location adapter" translating this port's output. Yet `domain-entities.md`'s own "Contract Fidelity Check" — the section responsible for reconciling every declared or refined seam, and which correctly reconciles `ContainerMovementBff`, `JourneyProviderV2`, `SafeReturnPolicy`, `BookingJourneyRelationshipValue.href`, `CmmMutationResult`, and `CaptureDisabledReason` — never once mentions the active-location port, leaving this heavily-relied-upon contract completely unreconciled. `frontend-components.md`'s Shared Primitive Matrix marks only "location port evidence" (live proof) as BLOCKED for the capture form row, treating the specification itself as already settled when it is not. A developer cannot build `LocationOptionsVm`, the "Location adapter," BR4-070, BR4-043, or the second independent capture-disable gate without inventing the capability name, the REST route, and the request/response schema themselves. Resolve by either (a) adding a fully specified port interface to `component-methods.md`, parallel to `ChargeReferenceOptionsPort`, naming its exact query shape, provider call (state explicitly whether it reuses the existing generic Reference records endpoint), capability gate, and response bound, carried through the approved Application Design change-control path, then reconciling it in the Contract Fidelity Check; or (b) naming it explicitly as a named blocker with owner and evidence path (as Identity capability registration and the listener poison/replay exit already are), and removing the already-settled-sounding language from BR4-070, BR4-043, `LocationOptionsVm`, and the Location adapter until that contract exists.

## Review - Iteration 2

**Verdict: READY**

### Validation evidence

- Re-read all four U04 artifacts in full, starting from the new "## Review Resolution - Iteration 1" section, to verify the Iteration-1 finding against the rewritten text rather than the coordinator's summary of it.
- Re-ran all four sensors against all four (now-changed) artifacts via `bun .codex/tools/aidlc-sensor.ts fire <id> --stage functional-design --output-path <file>`: `required-sections` and `upstream-coverage` both returned `SENSOR_PASSED` for all four files again (confirmed in the audit log at `aidlc/spaces/default/intents/260803-module-list-uplift/audit/git-ae-srv-rdt1-5bc6e1ea2b05.md`, e.g. fire id `81165b60`/`83a1ee88` for `frontend-components.md`). `linter`/`type-check` remain genuinely not applicable — both sensors filter by output-file extension (`**/*.{ts,js}` / `**/*.{ts,tsx}`), and re-firing them against the four `.md` output paths returned an explicit "does not match sensor filter" result each time; this holds regardless of the new fenced ` ```typescript``` ` block business-logic-model.md now carries, because the glob matches the artifact's own file extension, not embedded fence languages.
- Verified the declared `CmmReferenceLocationsPort` contract is genuinely implementable against the live Reference service, field by field: `ReferenceSet.LOCATION` (`services/reference-data-service/domain-core/.../model/ReferenceSet.java`) is a real enum value (`path="location"`), and `ReferenceSetConverter` resolves the `{set}` path variable via `ReferenceSet.fromExternalValue`, which matches case-insensitively by either enum name or path — so both `LOCATION` and `location` genuinely resolve on `GET /reference-sets/{set}/records`. `ReferenceDataController.list` genuinely accepts `includeInactive` (default `false`), `page` (default `0`), and `size` (default `25`, and the design's explicit `size=50` is within the accepted range) exactly as the new workflow section describes. `ReferenceDataApplicationService.list` genuinely filters to `ReferenceStatus.ACTIVE`-only records when `includeInactive=false`. `ReferenceRecord` genuinely carries `id`, `code`, `displayName`, and `status`, matching the declared `CmmLocationOptionVm { id, code?, label }` shape one-for-one (`displayName` -> `label`). The call shape is byte-for-byte the same pattern Charge's already-approved `ChargeReferenceOptionsPort` uses against the same controller, so this is not a new backend capability, only a new BFF-owned consumer of an existing, already-exercised provider contract.
- Confirmed the four artifacts are consistent and that no artifact reintroduces the retracted vague `LocationOptionsVm` type: a full-text sweep of all four files for `LocationOptionsVm` finds it only inside this reviewer's own historical Iteration-1 finding text (expected to remain, as the historical record) — every live model/type reference now reads `CmmLocationOptionQuery`/`CmmLocationOptionsVm`/`CmmReferenceLocationsPort`. `domain-entities.md`'s Contract Fidelity Check gained the required reconciling entry, `business-rules.md` BR4-070/BR4-076/BR4-077 carry the exact contract and its BLOCKED/sign-off disposition, and `frontend-components.md`'s detail-region table and Shared Primitive Matrix now name the port and its real blocker (Identity capability registration and producer/consumer sign-off, not merely "live evidence" of an already-settled spec). One purely cosmetic residue: `business-logic-model.md` (workflow step 8, capture step 2), `business-rules.md` BR4-043, and `domain-entities.md`'s "Read Result and Region Model" table still use the generic descriptive phrase "bounded active-location Reference port" rather than the newly introduced type name in a couple of places — this is stylistic, not a contradiction or a reintroduction of the old unspecified claim, since BR4-070 supplies the authoritative full contract those mentions ultimately point to.
- Confirmed the disposition — an additive public contract needing producer/consumer sign-off, BLOCKED with owner and evidence path, capture location gate closed by default rather than open — is the right one and not a softening: it mirrors this same design's existing, accepted treatment of `container-movement:read`/`container-movement:capture` (proposed capabilities pending Identity registration) rather than either silently assuming approval or blocking the FD stage itself from proceeding. Because the call reuses an already-live, already-exercised Reference provider endpoint (the same one Charge's approved port already calls) rather than requiring new backend work, sign-off is a contract-test and cross-team-review gate, not a backend build risk — consistent with how this same document already gates other pending-but-specified seams.
- Re-confirmed nothing else regressed: the Brownfield Baseline, Capture Outcome Decision Model, Four Separate Event Truths, Booking/Journey relationship workflow, Completion Boundary, and the hard poison/bounded-retry/DLQ/replay not-done condition are byte-identical to the version verified in Iteration 1, and the FR/NFR/story coverage tables in all four files remain unchanged and still match `unit-of-work-story-map.md`'s ledger.
- Noted per the coordinator's message: `reviewer_max_iterations: 2` for this stage, so this is the final independent verdict for this Bolt; no further automated review iteration is expected.

### Final finding

No blocking finding remains. The Iteration-1 gap — an unspecified CMM-to-Reference active-location port that three artifacts depended on as if it already existed — is resolved with a fully specified, independently verified-implementable `CmmReferenceLocationsPort`, correctly gated as an additive contract pending producer/consumer sign-off rather than assumed or silently built around. The residual generic phrasing noted above (a few places still say "bounded active-location Reference port" instead of naming `CmmReferenceLocationsPort`) is cosmetic and does not leave any developer decision unresolved, since BR4-070 and the new workflow section supply the binding, unambiguous contract those mentions resolve to.

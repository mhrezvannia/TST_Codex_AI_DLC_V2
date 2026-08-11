# Business Rules - U04 Container Journeys and Booking Relationship Uplift

## Source Alignment

These rules implement U04 in `unit-of-work.md` and its US-011 through US-014 allocation in `unit-of-work-story-map.md` against `requirements.md`, while refining `components.md`, `component-methods.md`, and `services.md`. Higher UI authority remains the approved W4 security and accessibility contract, LinerCore MASTER and `@erp/ui`, and the `container-movement.md` page contract. Every rule below is an invariant a contract, component, or live test can falsify.

## Authorization and Trust Rules

| Rule | Invariant |
| --- | --- |
| BR4-001 | Every read, capture, retry, and post-command re-read evaluates the current authenticated request through Identity. |
| BR4-002 | `container-movement:read` and `container-movement:capture` are distinct capabilities; no coarse or `local-user` substitute is permitted, and every route fails closed until Identity registers them with executable policy tests. |
| BR4-003 | DENY and Identity outage terminate before any CMM or Reference provider access; Identity outage maps to retryable `unavailable` / HTTP 503 with zero provider calls and no data flash. |
| BR4-004 | The authenticated actor is derived server-side. A browser-supplied actor query key, body field, or header is ignored or rejected, never used to scope a read. |
| BR4-005 | The CMM BFF issues a short-lived HMAC subject assertion binding issuer, key ID, subject, HTTP method, normalized provider path, correlation ID, issued and expiry time, and a nonce; the v2 controller verifies it with a dedicated key before mapping the subject into existing ports. |
| BR4-006 | The browser session, cookies, and headers are never forwarded to the CMM service as authority. |
| BR4-007 | The internal CMM service is never exposed directly by Nginx; the actor-shaped v1 contract stays an internal compatibility surface and is not callable from a W4 browser route. |
| BR4-008 | Browser-supplied idempotency key, correlation authority, service credential, container identity, classifier, publication status, and lifecycle are ignored or rejected. |

## Route, Deployable, and Read Rules

| Rule | Invariant |
| --- | --- |
| BR4-010 | `apps/container-movement` uses `basePath=/container-movement`; Nginx preserves the full URI and assets resolve under `/container-movement/_next/*`. |
| BR4-011 | Canonical routes are `/container-movement` and `/container-movement/journeys/[journeyId]`; the module root returns 200 and direct navigation or refresh returns a complete document with the shared shell. |
| BR4-012 | W4 creates no Container Movement compatibility redirect of any kind; any legacy-looking CMM path returns 404. |
| BR4-013 | The base-path-aware internal `/api/health` exists for container health checks and authorizes no domain read. |
| BR4-014 | The recent list accepts only a bounded `limit` in {25, 50, 100} defaulting to 25, plus bounded `focus`; search, filter, selectable sort, cursor, page, total, actor, and bulk action are absent at every layer. |
| BR4-015 | Duplicate, unknown, malformed, or overlong query keys return `invalid-query` / HTTP 400 before provider access. |
| BR4-016 | Provider recent order is authoritative and is never re-sorted, merged, or filtered downstream. |
| BR4-017 | Result copy uses the provider's `returned` count; no total is fabricated and no pagination affordance implies one. |
| BR4-018 | The latest-accepted-event column renders only if the provider's public ordering for that field is confirmed; otherwise the column is omitted rather than derived. |
| BR4-019 | True empty renders `No recent Journeys returned` with no create call to action; filtered empty is not offered because no admitted filter can produce it. |
| BR4-020 | A trustworthy stale value requires current authorization plus provider-owned source and time; freshness-dependent actions are disabled with a precise reason. |

## Timeline Ownership Rules

| Rule | Invariant |
| --- | --- |
| BR4-030 | `timelineV1` is computed inside the owning CMM service from current expected and history state; it is not persisted as a second authority. |
| BR4-031 | The BFF and browser never merge, deduplicate, calculate a next move, infer lateness, match expected against actual, or invent lifecycle. |
| BR4-032 | Canonical stage order is GTOT, LOAD, DISC, GTIN; `GTOT` and `ACT_GTOT` map to GTOT, and `ACT_LOAD`, `ACT_DISC`, `ACT_GTIN` map to LOAD, DISC, GTIN. |
| BR4-033 | LOAD and DISC expected locations come from current expected movements; GTOT inherits LOAD's and GTIN inherits DISC's; a missing expected location stays absent and is never guessed. |
| BR4-034 | Every accepted history record is retained; a planned item is emitted only when its canonical stage has no accepted record. |
| BR4-035 | Repeated legacy records remain separate `LEGACY_ACCEPTED` entries and are never silently deduplicated. |
| BR4-036 | Unsupported legacy event types become `OTHER`, are labelled from a producer allow-list, follow the four canonical stages in original history order, and never advance next-move truth. |
| BR4-037 | `receivedAt` and `source` remain absent because current Journey state does not own them; the UI renders neither a value nor a labelled unavailable value for them. |
| BR4-038 | History is append-only; no correction, publication status, or Booking-application status is shown without an approved public contract. |

## Capture and Idempotency Rules

| Rule | Invariant |
| --- | --- |
| BR4-040 | Capture is the only U04 mutation. Journey creation, correction, cancellation, and bulk actions do not exist in any state. |
| BR4-041 | Supported event codes are exactly GTOT, LOAD, DISC, and GTIN; any other code is absent from the UI and rejected at the BFF. |
| BR4-042 | Capture renders only when the capture capability is allowed for the current request **and** the provider reports `captureEnabled=true`; otherwise the provider's `captureDisabledReason` is shown. |
| BR4-043 | When `CmmReferenceLocationsPort` with `usage: "capture"` cannot verify canonical locations, capture is disabled with its own precise reason; that reason and `captureDisabledReason` are reported distinctly and never merged into one generic disabled state. |
| BR4-044 | The BFF issues a signed short-lived `captureAttemptToken` binding subject, journey ID, provider `updatedAt`, action, and a server-generated random idempotency key; the browser may only echo the opaque token. |
| BR4-045 | The BFF verifies token signature, expiry, subject, journey, and action before forwarding its embedded key as `Idempotency-Key` and deriving correlation from request context. |
| BR4-046 | The v2 command body carries only `eventCode`, `locationId`, and `occurredAt`; container identity is read-only and no actor, idempotency, correlation, or lifecycle field is accepted. |
| BR4-047 | Only the initiating command is disabled while pending, and duplicate activation produces no second provider request. |
| BR4-048 | A definitive validation or conflict outcome issues a replacement attempt token; an unknown outcome retains the original token and requires an authoritative re-read before any retry. |
| BR4-049 | No journey status, timeline entry, or next-move expectation advances anywhere in the client before provider acceptance and authoritative re-read. |

## Result and Event-Truth Rules

| Rule | Invariant |
| --- | --- |
| BR4-050 | Capture reduction is exhaustive across `accepted-confirmed`, `accepted-unconfirmed`, `validation`, `duplicate`, `out-of-sequence`, `denied`, `not-found`, `unavailable-known-no-mutation`, `unavailable-unknown-outcome`, and `unexpected`. |
| BR4-051 | `duplicate` and `out-of-sequence` remain distinct dispositions and are never collapsed into one generic rejection. |
| BR4-052 | Every non-confirmed branch retains entered values, form context, and logical focus. |
| BR4-053 | Journey persistence, CMM outbox publication, broker delivery, and Booking projection application are four separately observable truths; the UI never infers a later truth from an earlier one. |
| BR4-054 | A successful write is never labelled Published or Applied without matching evidence, and no aggregate or roll-up status is derived across the four truths. |
| BR4-055 | Publication and Booking-application status render only from an approved public contract; absent one, they are not shown at all. |
| BR4-056 | Only safe reference evidence is primary; raw transport, payload, and event evidence stays collapsed and access-appropriate. |
| BR4-057 | Retry is user-triggered and scoped to the failed read, region, or command; no uncertain command is replayed automatically. |
| BR4-058 | The missing listener poison-message handler, bounded retry policy, dead-letter topic, and replay contract remain a BLOCKED platform and service-owner dependency with owner and evidence path; W4 adds no Kafka topic and claims no control it has not evidenced. |

## Relationship and Origin Rules

| Rule | Invariant |
| --- | --- |
| BR4-060 | Journey-to-Booking links to exact `/booking/[bookingId]` from the Journey's verified stable `bookingId`; the target authorizes independently. |
| BR4-061 | An absent `bookingId` is surfaced as a provider contract failure, never a search prompt, and is never derived from container identity or a projection label. |
| BR4-062 | Booking-to-Journey is owned by the adapter beside `apps/shell/app/booking/[bookingId]/page.tsx` and its shell Booking client; canonical Booking ownership does not move to `apps/booking`. |
| BR4-063 | The relationship lookup uses exact `bookingId` against authorized CMM v2; `present`, `not-created`, `denied`, and `unavailable` remain four distinct outcomes. |
| BR4-064 | No Journey ID is inferred from projected statuses, container identity, or labels in any direction. |
| BR4-065 | Cross-module links carry no arbitrary `returnTo`. The source BFF issues a signed URL-safe origin token capped at 512 characters and ten minutes, bound to session subject, exact source kind and record ID, canonical href, and expected target module. |
| BR4-066 | The target BFF verifies the origin token before rendering a Back link; a missing, invalid, or expired token falls back to the target canonical root. |
| BR4-067 | Agreement-to-Booking and Booking-to-Agreement remain BLOCKED and are not implemented by U04. |

## Location and Degradation Rules

| Rule | Invariant |
| --- | --- |
| BR4-070 | Location options resolve only through `CmmReferenceLocationsPort`: exact `GET /container-movement/api/location-options` with one `usage` and optional bounded `q` (<=128 chars); duplicate or unknown keys return `invalid-query` / HTTP 400 before any provider call; the BFF requires current-request `container-movement:read`, then calls active Reference `GET /reference-sets/LOCATION/records?includeInactive=false&page=0&size=50` with the existing service credential and trusted correlation, returning at most 50 typed options. No Reference app import, shared SQL, cache authority, broad merge, or mutation exists. |
| BR4-076 | `invalid-query`, `denied`, `unavailable`, and successful-empty remain four distinct port outcomes and are never collapsed into one message. |
| BR4-077 | `CmmReferenceLocationsPort` is an additive public contract requiring producer and consumer sign-off; until its executable contract tests pass it is BLOCKED with owner and evidence path, and the capture location gate stays closed rather than defaulting open. |
| BR4-071 | Read surfaces may show safe raw authorized IDs with `Label unavailable`; arbitrary user labels are never accepted as canonical IDs. |
| BR4-072 | The timeline, the Booking-relationship region, and location labels resolve independently and fail independently, each with an exactly owned Retry. |
| BR4-073 | Summary and timeline arrive together in the one v2 detail read and share that read's result; U04 claims no independent timeline failure state and adds no separate timeline endpoint. |
| BR4-074 | A dependency failure never blanks the record and never fabricates completeness; an unavailable region names what is unavailable and who owns it. |
| BR4-075 | Browser memory, fixtures, local storage, and cached authorization are never fallback truth. |

## UI Ownership and Presentation Rules

| Rule | Invariant |
| --- | --- |
| BR4-080 | The CMM root layout renders exactly one W2-02-owned `PlatformShell` from first implementation; route, loading, denied, error, and form states render no second or fallback shell. |
| BR4-081 | Shared tokens and primitives come from `@erp/ui`; CMM owns only module navigation, recent/detail/capture composition, the capture form, and domain vocabulary. |
| BR4-082 | A missing general shared-primitive behaviour is a W2-02 dependency and BLOCKED evidence; no local shell, theme, typography system, Drawer framework, or shared-component fork is created. |
| BR4-083 | All colors, spacing, typography, borders, focus, elevation, and motion use shared `--erp-*` tokens; icons are supplementary and never replace text. |
| BR4-084 | No marketing composition, replacement palette or fonts, charts or KPI walls, animated badges, spinner-only loading, generic bulk actions, raw JSON editor, or inline style system appears. |
| BR4-085 | Loading uses shape-stable Skeletons that show no false data; a routine load does not steal focus. |
| BR4-086 | Actor subject, capability, idempotency key, correlation ID, source, classifier, publication, correction, and Journey creation are never browser-owned fields. |

## Accessibility and Responsive Rules

- BR4-090: One `h1`, ordered headings, shell skip and main landmarks, native links and buttons, and persistent form and control labels are mandatory.
- BR4-091: Error summaries link to their fields, controls carry descriptions, async outcomes are announced, focus is visibly shared, and keyboard order is logical.
- BR4-092: Reduced motion is honoured; pending and result announcements are bounded and non-repetitive; status never relies on a Toast alone.
- BR4-093: 375 and 390 use semantic mobile records and a one-column capture form; 768 uses labelled keyboard-reachable inner overflow; 1024 and 1440 use dense list, detail, and timeline composition.
- BR4-094: Light and dark themes, 200% and 400% zoom, long container and Journey identifiers, and the absence of page-level horizontal overflow require observed evidence.

## Persistence and Boundary Rules

U04 adds no backend service, database, Kafka topic, shared cache, BFF persistence, browser-storage authority, or AWS resource. The CMM service owns Journey identity, status, expected movements, accepted history, idempotency receipts, `timelineV1`, and its outbox. Booking owns its own truth and its movement projection. Reference owns canonical active locations. Identity owns policy decisions. W2-02 owns shell, session presentation, and shared UI. The CMM BFF owns request parsing, assertion issuance, attempt-token issuance and verification, view models, and outcome mapping. The shell Booking adapter owns only the authorized lookup and its four outcomes. The browser owns transient interaction state only.

## Rule Verification

Contract tests cover current-request policy, the provider-call prohibition on DENY and Identity outage, actor-field rejection, assertion issuance and verification including spoof rejection, the bounded `limit` allow-list and unknown-key rejection, media-type negotiation and additive v1 compatibility, attempt-token issuance/verification/replacement/retention, `Idempotency-Key` forwarding, every result-to-HTTP mapping, the authoritative post-acceptance re-read, exact `bookingId` lookup across all four outcomes, and origin-token issuance, verification, expiry, and fallback in both directions. Provider tests assert stable timeline ordering, all-history retention, missing expected evidence, repeated legacy evidence, and default-JSON compatibility; BFF and browser tests assert no local merge, deduplication, next-move calculation, or lifecycle inference.

Component and route tests cover every state, duplicate submission, URL persistence, safe return, dirty navigation, and focus. Integrated Playwright and Compose evidence covers the full journey at 375, 390, 768, 1024, and 1440 CSS pixels in both themes, plus keyboard, screen-reader, reduced-motion, and zoom behaviour, the warmed ten-user route and BFF sample, direct refresh and assets and health, the absence of a CMM legacy redirect, manager-demo guards, and both audits.

This supplies U04 evidence for US-011, US-012, US-013, and US-014; FR-001, FR-002, FR-007 through FR-016, and FR-018 through FR-022; and NFR-001 through NFR-005 and NFR-009 through NFR-012. NFR-006, NFR-007, and NFR-008 receive the combined intent-exit verdict. Unsupported and blocked controls must be absent rather than simulated, and the poison/replay exit keeps U04 and the intent not done until it is closed.

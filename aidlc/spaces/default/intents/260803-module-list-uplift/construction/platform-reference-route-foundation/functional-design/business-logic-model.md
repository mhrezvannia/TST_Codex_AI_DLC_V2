# Business Logic Model - U01 Platform/Reference Route Foundation

## Source Alignment

This design implements U01 from `unit-of-work.md`, its US-001/US-002 and thin US-003/US-004 assignments in `unit-of-work-story-map.md`, and `requirements.md`. It realizes the approved boundaries in `components.md`, exact contracts in `component-methods.md`, and deployment/integration ownership in `services.md`. It introduces no mutation depth from U02, persistence, local shell, or unsupported provider capability.

## Canonical Read Pipeline

1. Nginx preserves the `/reference-data` URI, host-wide cookie, scheme and assets, clears the exact eleven inbound trust headers, and supplies the five trusted replacements.
2. The Reference root layout resolves the authenticated host session and consumes the published W2-02 `PlatformShell`/route registry.
3. The route derives `AuthenticatedRequestContext`; Identity evaluates `reference-data:read` for the current request.
4. DENY or Identity unavailability ends the flow before any Reference provider call. DENY maps to read `denied`; Identity outage maps to retryable read `unavailable`, HTTP 503, with a safe message/reference and zero provider calls.
5. The route parser rejects duplicate, unknown, malformed, overlong, traversal, encoded-separator, or out-of-prefix input before provider access.
6. The feature-local BFF calls `listSets`, `listRecords`, or `getRecord` and translates only provider-owned facts into the approved view models.
7. The page exhaustively maps `ReadResult<T>` to a route state and renders inside the shared shell.
8. Direct refresh follows the same pipeline; no prior browser state is required.

## Route Workflows

### Set list `/reference-data`

The set list has no query controls. `ok` with items renders stable `setCode`, label and description; `ok` with no items is true empty. A set link targets `/reference-data/[setCode]` using the provider identifier.

### Record list `/reference-data/[setCode]`

Accepted browser query state is `includeInactive`, one-based `page`, enumerated `size` 25/50/100, and optional `focus`. Defaults are page 1 and size 25. `page=0`, non-positive/non-integer pages and non-enum sizes are invalid-query; the BFF alone converts browser page N to provider page N-1. Search and selectable sort do not exist. Provider order is preserved. Return context stores the normalized browser convention only.

### Record detail `/reference-data/[setCode]/[recordId]`

The stable identifiers call `getRecord`. The U01 detail renders identity, status/version, readable Summary and the available provider history/attributes needed for the thin proof. Back uses validated list context; invalid or absent context falls back to `/reference-data/[setCode]`. Focus restoration targets only an allow-listed row identifier that exists after list render.

## Result Decision Model

| Result | Page outcome | Provider data | Recovery |
| --- | --- | --- | --- |
| `ok` populated | Render provider truth | Visible | Normal navigation |
| `ok` empty | True empty; filtered empty only when `includeInactive` creates a real distinction | None | Change supported filter or return |
| `invalid-query` | HTTP 400 supported-controls state | None; provider not called | Canonical supported URL |
| `not-found` | Route-owned not-found | None | Canonical set/list link |
| `denied` | Shared denied state | Never flashed | Permission-owner guidance only |
| `stale` | Authorized last-known value with source/time | Visible and labelled stale | Retry; no freshness-dependent action |
| `unavailable` | Identity or provider unavailable; HTTP 503 for Identity outage | None unless provider result explicitly carries stale truth | Safe message/reference, alert/main focus, retry when classified safe; Identity branch makes zero provider calls |

## Safe Return Algorithm

Decode at most 2,048 characters; require a relative path under the invoking Reference list prefix; reject scheme/host/protocol-relative/backslash/control/traversal/encoded-separator forms; parse query once; reject duplicate or unknown keys; normalize supported values; validate optional focus; otherwise return the canonical list fallback. The browser never supplies an arbitrary redirect destination.

Normalized safe-return URLs use browser-one-based page numbers and sizes 25/50/100 only. `page=0` and non-enum sizes invalidate the whole return context and select the canonical fallback rather than being silently reinterpreted.

## State and Focus Flow

URL state is durable. Server render owns session, policy, validation, provider call and result discrimination. Focused client behavior changes only supported filters/page through navigation, invokes Retry, opens tabs/disclosure, and restores focus after the returned list is present. Recoverable errors retain safe URL context; no local storage or global client store carries authority.

## Scenario Sequences

- Permitted: shell -> set list -> record list -> detail -> Back -> invoking row focus.
- Direct: fresh browser -> stable detail URL -> same record and shell.
- Denied: direct link -> policy DENY -> shared state, zero provider calls/data flash.
- Invalid: duplicate/unknown query -> typed 400, zero provider calls.
- Unsafe return: detail -> rejected context -> canonical list fallback.
- Dependency failure: owning app remains scoped; other shell modules remain usable; Retry preserves safe context.

## B01 Completion Boundary

The workflow is complete only when observed on `linercore-wave-a` with real session/Identity/Reference persistence, direct assets/refresh, exact header policy, five widths/two themes, keyboard/screen-reader/reduced-motion behavior, documented warmed performance samples, manager guards and both audits. Missing shared or provider dependencies keep B01 blocked.

## Review - Iteration 1

**Verdict: NOT-READY**

The U01/U02 boundary is otherwise disciplined: the design is read-only, adds no persistence or unsupported provider capability, keeps Reference composition feature-local, assigns shell/primitives to W2-02, and specifies the required responsive and accessibility evidence. Three implementation blockers remain:

1. **The browser pagination contract is contradictory.** `business-logic-model.md`, `business-rules.md`, and the recorded Q3 answer make URL `page` zero-based and permit any `size` in `1..100`. The declared Application Design contract says browser `PageNumber` is one-based and `PageSize` is `25 | 50 | 100`, with conversion to provider-zero-based inside the BFF. This also makes normalized safe-return URLs ambiguous. Choose the public browser convention from the approved contract, define defaults and rejection/canonicalization for `page=0` and non-enum sizes, and use it consistently in parsing, links, safe return, focus restoration, and tests.

2. **Identity outage has no explicit terminal `ReadResult` mapping.** The canonical pipeline says Identity unavailability stops before Reference access, but only DENY receives a named page behavior; the decision table describes `unavailable` as a provider error. Bind Identity `unavailable` to read `unavailable` (not `denied`), including HTTP status, retryability, safe message/reference, announcement/focus behavior, and the invariant of zero provider calls. Then the end-to-end mapping is genuinely exhaustive for every pre-provider and provider branch.

3. **The shell placement contract can produce duplicate shell trees.** The answered Q5 says each Reference route renders `PlatformShell`, while `frontend-components.md` places one `PlatformShell` in `ReferenceRootLayout`. State normatively that the domain root layout renders exactly one W2-02-owned shell instance and route pages render only `RouteStateBoundary` plus Reference composition. Keep missing shell/registry/primitives as blocking W2-02 dependencies and prohibit route-level or local fallback shells.

## Review Resolution - Iteration 1

1. Browser pagination is now one-based with default page 1 and sizes 25/50/100; only the BFF converts to provider-zero-based. Invalid page/size values are rejected consistently in routes, safe returns, links and tests.
2. Identity outage maps explicitly to retryable `ReadResult.unavailable`/HTTP 503 with safe message/reference, announcement/focus and zero provider calls.
3. `ReferenceRootLayout` renders exactly one W2-02-owned `PlatformShell`; route pages render only the state boundary and Reference composition. Route-level or fallback shells are prohibited.

## Review - Iteration 2

**Verdict: NOT-READY**

The pagination correction is now consistent: browser pages are one-based with default 1, sizes are limited to 25/50/100 with default 25, safe-return URLs retain that convention, invalid values are rejected, and only the BFF converts to provider page N-1. The component design also establishes exactly one W2-02-owned `PlatformShell` in `ReferenceRootLayout` and prohibits route, error-state, and fallback shells.

One blocker remains. `domain-entities.md` still defines the request transition as an unconditional sequence from policy decision to validation and provider read. That contradicts the corrected Identity-outage behavior elsewhere, which must terminate as retryable `ReadResult.unavailable`/HTTP 503 with zero provider calls. Change the state model to branch after the policy decision: DENY -> `denied`; Identity outage -> retryable `unavailable`/503 with safe reference, error announcement/main-summary focus and Retry; ALLOW -> validation and provider read. Add the zero-provider-call assertion for the outage branch to its verification mapping. Until the boundary model expresses this branch, an implementer can still follow the documented state machine and call Reference during Identity failure.

## Review Resolution - Iteration 2

`domain-entities.md` now models the policy decision as three explicit branches: ALLOW continues, DENY terminates as `denied`, and Identity outage terminates as retryable `unavailable`/HTTP 503 with a safe reference, error announcement/main-summary focus, Retry, and zero provider calls. Its verification mapping now requires the zero-provider-call assertion. The configured two-review maximum is exhausted; no third READY review is claimed.

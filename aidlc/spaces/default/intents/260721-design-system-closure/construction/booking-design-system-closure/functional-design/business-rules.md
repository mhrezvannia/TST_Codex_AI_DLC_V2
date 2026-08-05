# Business Rules — booking-design-system-closure

## Rule Basis

These rules make the closure behavior in `unit-of-work.md` and `unit-of-work-story-map.md` executable without expanding domain scope. They trace to `requirements.md`, preserve the ownership in `components.md`, use the interfaces in `component-methods.md`, and do not alter the services or contracts documented in `services.md`.

## Canonical Ownership Rules

| ID | Rule | Enforcement |
|---|---|---|
| BR-001 | The shared edge `apps/shell` routes are the only canonical Booking presentation. | Route tests and live landmark/navigation inspection |
| BR-002 | Standalone `apps/booking` presentation routes redirect to their canonical shell equivalents; BFF/API routes remain operational and do not redirect. | Redirect and BFF contract tests |
| BR-003 | Booking content must not instantiate a shell, navigation, identity, typography, palette, or theme provider. | Source inventory and live DOM/computed-style inspection |
| BR-004 | `packages/ui` is the sole owner of generic tokens/primitives; Booking-specific fields, status transitions, and compositions remain in the shell Booking route. | Import-boundary tests and review |
| BR-005 | No app imports another app's implementation. Shell-to-BFF communication remains HTTP through existing route adapters. | Workspace/import checks |

## Presentation and Accessibility Rules

| ID | Rule | Enforcement |
|---|---|---|
| BR-006 | Applicable controls, displays, feedback, overlays, and loading surfaces render `@erp/ui`; correct native semantics require a named rationale and focused test. | Consumption inventory and component tests |
| BR-007 | Every async route/section resolves to an explicit loading, empty, populated, denied, error/retry, or degraded state; `ready` aliases, blank output, and raw stack text are forbidden. | State tests and Playwright |
| BR-008 | Status is expressed by text/semantics in addition to color, and status changes use appropriate live regions without duplicate announcements. | Accessibility assertions/manual check |
| BR-009 | Keyboard order follows visual order, focus remains visible, submission errors receive useful focus, and safe dialogs trap/restore focus. | Keyboard-only Playwright |
| BR-010 | Valid operator input survives validation and recoverable service failures. A refresh or redirect may clear uncommitted data only through existing explicit navigation/dirty-state behavior. | Form recovery tests |
| BR-011 | At 375, 768, 1024, and 1440 pixels, primary commands remain reachable and page-level overflow/overlap/clipping is zero; table overflow is contained. | Viewport matrix |
| BR-012 | Both shared themes use executable `--erp-*` tokens; hardcoded app colors, local `CSSProperties` systems, remote fonts, and dark-default/module themes are forbidden. | Positive lint plus negative probes |
| BR-013 | Motion honors reduced-motion settings; hover changes do not scale or move layout. | CSS/component inspection and browser assertion |

## Lifecycle and Validation Rules

| ID | Rule | Enforcement |
|---|---|---|
| BR-014 | The service-returned Booking representation and status are authoritative; the UI must not manufacture lifecycle success. | Action tests and network/DOM correlation |
| BR-015 | At most one create/validate/price/confirm command is in flight for a Booking UI instance; conflicting commands are disabled while pending. | Component and browser tests |
| BR-016 | Existing subject, cookie, correlation, idempotency, request-size, timeout, and safe-error behavior must survive every presentation change. | BFF contract/regression tests |
| BR-017 | Client validation covers only immediate input shape/presence; domain validation remains in existing services and its returned details are rendered without changing their meaning. | Form and API compatibility tests |
| BR-018 | Retry is offered only for a recoverable outcome. Authentication/authorization denial and known non-retryable validation failures are not blindly retried. | State mapping tests |
| BR-019 | Confirm is considered successful only when the returned representation establishes confirmation; timeout/unknown outcome remains explicitly unresolved and relies on existing idempotency protection. | Confirm recovery tests |
| BR-020 | Async downstream movement status does not block truthful Booking confirmation; missing secondary evidence is shown as degraded, not as a failed confirmation. | Detail-state test |
| BR-020A | Lifecycle action outcomes use explicit pending, success, validation-blocked, recoverable-error, denied, degraded, and fatal-error branches with the retention, focus, announcement, and retry behavior defined in the functional model. | Typed state and interaction tests |
| BR-020B | Presentation redirects accept a full request plus trusted canonical shell origin, exclude `/api/**`, use status 308, and apply the exact route/query allow-list from the functional model. | Redirect security/compatibility tests |

## Testing and Closure Rules

| ID | Rule | Enforcement |
|---|---|---|
| BR-021 | Difficult UI states are arranged only by Playwright interception or controlled isolated service conditions on the running canonical route; production debug flags and detached pages are forbidden. | Source scan and evidence manifest |
| BR-022 | Semantic roles, names, labels, and visible text are the primary test contract. Stable `data-state` or `data-testid` hooks are added only where semantic selection cannot express the state. | Test review |
| BR-023 | Anti-drift negative probes must be non-writing or guarantee restoration, must fail with the expected rule, and must leave the worktree unchanged. | Before/after status plus captured exit |
| BR-024 | Live stack operations use only `scripts/wave-a-compose.mjs` and Compose project `linercore-wave-a`; `linercore-shared-platform` is never targeted. | Command log/project assertion |
| BR-025 | `npm run demo:guard` must pass before and after acceptance. Either failure keeps W2-02 pending. | Retained guard results |
| BR-026 | W2-02 closes only when all FR/NFR/story evidence, relevant static/build gates, Playwright matrix, final guard, `aidlc-audit`, and `erp-fidelity-audit` are green with direct exit results. | Evidence manifest and audits |
| BR-027 | A failure is retained, corrected only within scope, and followed by rerun of affected proof, final guard, and both audits. Partial success is not PASS. | Run history |
| BR-028 | Historical W1 live proof remains BLOCKED/waived and is never reclassified by this run. | Backlog/evidence wording check |

## Conflict and Precedence Rules

When rules conflict, apply the active intent and LinerCore master before ui-ux-pro-max suggestions or older local presentation patterns. Therefore marketing/gateway composition, hero/CTA content, alternate blue/amber tokens, Fira remote fonts, and spinners are rejected; data density, filtering, visible focus, responsive behavior, reduced motion, and accessible state design are retained.

No rule here authorizes backend domain, database, API/event contract, cloud, production, or other-module changes. A newly discovered need outside this boundary is recorded for explicit scope review rather than implemented silently.

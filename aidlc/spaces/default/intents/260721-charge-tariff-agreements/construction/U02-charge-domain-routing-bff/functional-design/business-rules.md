# Business Rules — U02 Charge Domain Routing and BFF

## Rule Catalog

| ID | Rule | Enforcement | Failure |
|---|---|---|---|
| BFF-001 | The public Charge root is `/charge-agreements/`; exact root without slash redirects 308. | Nginx exact location | Proxy test failure |
| BFF-002 | The nginx Charge proxy preserves the complete base-path URI. | `proxy_pass` without URI suffix | Deep-link/asset test failure |
| BFF-003 | Existing `/`, `/auth`, `/reference-data`, `/booking`, and `/bookings` routing must not change. | Config diff and regression matrix | Blocking preservation failure |
| BFF-004 | Manager port 8088 is never an U02 target; isolated Wave A uses 18088. | Wrapper/env/command assertions | Blocking guard failure |
| BFF-005 | Health is public, minimal, base-path aware, and contains no dependency/session/commercial data. | Exact health handler/schema test | Quality-gate failure |
| BFF-006 | A browser page needs a valid signed session or redirects through existing Auth with a safe Charge return URL. | Server page guard | Safe Auth redirect |
| BFF-007 | BFF calls without a valid session return 401 JSON and never redirect. | `proxyCharge` context creation | 401 `CHARGE_AUTH_REQUIRED` |
| BFF-008 | Every protected route requires its exact resource/action capability at BFF and service. | Route policy plus service authorization | 403 `CHARGE_ACCESS_DENIED` |
| BFF-009 | Browser actor, role, permission, capability, correlation authority, and service credentials are never trusted. | Exact request schemas/header reconstruction | 400/403, no forward |
| BFF-010 | Manual-case read requires `charge-manual-cases:read`; generic Charge read discloses nothing. | Manual policy before loader | 403 with correlation only |
| BFF-011 | A route handler selects a compile-time backend policy; the browser cannot choose host or arbitrary path. | No generic open-proxy API | 404/400 |
| BFF-012 | Mutations are same-origin JSON and at most 32 KiB. | Origin/content/body guard | 403/415/413 |
| BFF-013 | Safe correlation is propagated or a UUID is minted, and the same selected value is echoed. | Request context | Safe envelope/header |
| BFF-014 | A client request token is UUID-only; derived idempotency keys contain no plaintext subject. | Replay-key value object | 400 `CLIENT_REQUEST_ID_INVALID` |
| BFF-015 | BFF replay forwarding is not claimed as service replay unless that endpoint persists/recognizes the key. | Route policy/test documentation | Quality-gate failure for false claim |
| BFF-016 | Backend errors remain non-2xx, bounded, JSON-normalized, and non-secret. | Response normalizer | Safe replacement error |
| BFF-017 | U02 creates no commercial cache/store and introduces no RTK or shared component. | Architecture/lint review | Scope failure |
| BFF-018 | Route states use shared tokens/primitives but no shared shell, navigation, typography, palette, or `packages/ui` change. | File ownership/design review | Scope failure |
| BFF-019 | Error/denied content is announced, focusable, keyboard recoverable, responsive, and not color-only. | Component/Playwright checks | Accessibility failure |
| BFF-020 | DS-02/DS-03 and the original W1 waiver remain explicit dependencies/history, never inferred PASS. | Evidence review | Audit failure |

## Access Decision Tables

### Page and BFF authentication

| Request | Session | Capability | Result |
|---|---|---|---|
| HTML page | absent/invalid/expired | n/a | Redirect `/auth/sign-in?returnUrl=<safe Charge path>` |
| BFF route | absent/invalid/expired | n/a | 401 normalized JSON |
| HTML/BFF | valid | missing exact action | 403 denied; no protected domain payload |
| HTML/BFF | valid | exact action | Continue; service must authorize again |
| health | any | n/a | 200 minimal public response |

### Capability policy

| Persona/grant | Rate read | Rate mutate | Agreement read | Agreement mutate | Manual evidence |
|---|---:|---:|---:|---:|---:|
| `PRICING` with exact permissions | Yes | Yes | Yes | Yes | Yes only with explicit manual read |
| `FINANCE_READ` mapped reader | Yes | No | Yes when U03 grant exists | No | No |
| Authenticated unrelated role | No | No | No | No | No |
| Missing/spoofed session | No | No | No | No | No |

Role labels never drive the BFF decision directly; signed permission strings are parsed to exact capabilities. The table states intended grants, while the policy evaluates resource/action.

### Manual-case disclosure

| Condition | HTTP | May disclose case existence/count/reason/Booking/correlation? |
|---|---:|---:|
| No session | 401 | No |
| Session lacks `charge-manual-cases:read` | 403 | No |
| Capability present, unknown case | 404 | No protected record; generic not-found only |
| Capability present, known case | 200 | Yes, U04 evidence fields only |

## Request Validation Rules

- Correlation matches `^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$`; invalid/blank is replaced, not reflected.
- `returnUrl` is passed through `safeReturnUrl`, capped at 2048, rejects controls/backslashes/network-path references, and must equal/start with `/charge-agreements`; fallback is `/charge-agreements/`.
- Path IDs are decoded once, 1-64 printable safe identifier characters, re-encoded for backend path construction, and never concatenated as a URL host/scheme.
- Query keys are allowlisted per domain loader. Unknown keys or duplicate scalar keys return 400; page/size/date/enum rules remain domain-owned.
- Mutation `Origin` must equal forwarded protocol+host. Missing Origin on a browser mutation is denied; server-side loaders use a separate non-browser code path.
- Mutation content type starts `application/json`; content length and actual encoded body are each bounded at 32 KiB.
- That content-type rule governs browser-to-BFF input. Backend media is fixed per `ChargeRoutePolicy`: JSON by default, exact `application/vnd.linercore.charge-agreement-v2+json` for every U03 Agreement read/mutation policy. Browser headers cannot override it.
- Authority-related unknown body keys fail instead of being silently forwarded. Compatibility DTOs replace `actorSubjectId` after parsing; they do not spread untrusted input.
- Client request token is a canonical UUID. The derived SHA-256 replay key is stable only for the exact subject/route/target/expected-version/token tuple.

## Error and Timeout Rules

| Class | Status | Normalized behavior |
|---|---:|---|
| Invalid query/body/token | 400 | Safe code plus field paths; no backend call |
| Missing session | 401 | `CHARGE_AUTH_REQUIRED` |
| Origin/capability denied | 403 | `ORIGIN_DENIED` or `CHARGE_ACCESS_DENIED`; no protected metadata |
| Authorized missing record | 404 | Preserve safe typed code |
| Stale/authority conflict | 409 | Preserve safe typed code; UI refreshes/reconciles |
| Body/media limits | 413/415 | Explicit safe correction |
| Business validation | 422 | Preserve normalized field/global details |
| Throttled | 429 | Preserve bounded retry seconds when valid |
| BFF/provider failure | 500/503 | No fallback success; safe retry/reset state |

Backend deadline is 2500 ms at U02's browser-to-Charge hop. It is not the Booking-to-Charge pricing policy defined for U05. U02 performs no automatic mutation retry; the deliberate client request token makes an operator retry stable where the downstream endpoint supports replay.

## Routing and Runtime Rules

- `basePath` is exactly `/charge-agreements`; no trailing slash in the config value.
- Nginx exact root uses 308; the prefix location uses `^~` and path-preserving `proxy_pass http://apps-charge-agreements:3000`.
- Forwarded Host/Proto and request correlation match existing proxy conventions. No user-supplied `X-LinerCore-*` service/actor/token header is forwarded.
- Charge healthcheck calls container port 3000 at the full base-path URL and uses the existing interval/timeout/retry/start-period conventions.
- Wave A runtime remains `node scripts/wave-a-compose.mjs ...`, project `linercore-wave-a`, nginx host port 18088 from the checked-in env.
- `npm run demo:guard` and material Docker/live proof remain U06 gates; unavailable execution is reported as unobserved, not passed.

## UI Business Rules

- Loading geometry matches the domain page's title/filter/content regions and does not use endless animation or text-shaped random bars.
- Error has one clear heading, concise safe explanation, Retry via `reset()`, and safe return action; focus moves to the alert once.
- Not-found distinguishes absent authorized content from access denial and offers only base-path-safe navigation.
- Denied never names protected records. It may name the broad Charge resource/action and a safe request-access route when the existing Auth contract permits.
- All actions keep visible focus, meet the shared target size, work at 320 px+, and use existing light/dark semantic tokens.
- `prefers-reduced-motion` removes nonessential transition; no layout depends on motion.
- U02 does not add hero content, illustrations, decorative gradients, marketing copy, a dark default, new color/font tokens, or navigation.

## Scenario Invariants

1. A spoofed actor/capability never changes the signed subject or route decision.
2. A denied manual request reveals no difference between unknown and existing protected records.
3. A backend 4xx/5xx never becomes 200 fallback data.
4. A deep-link reload and its Next asset/BFF requests remain under the base path.
5. Existing proxy routes return the same upstream target/path after the Charge locations are added.
6. The BFF holds no commercial state and cannot become a second source of truth.
7. Route-state UI changes remain confined to `apps/charge-agreements` and the Charge page override.
8. No U02 artifact or test upgrades DS-02/DS-03, Docker evidence, audits, or the W1 waiver to PASS.

## Upstream Coverage

These rules consume `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. They make the selected edge/BFF/accessibility/preservation behavior executable without changing any domain authority or shared UI owner.

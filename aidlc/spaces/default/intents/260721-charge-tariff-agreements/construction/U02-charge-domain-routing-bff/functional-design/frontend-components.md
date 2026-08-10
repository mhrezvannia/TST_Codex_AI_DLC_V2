# Frontend Components — U02 Charge Domain Routing and BFF

## UI Boundary and Routes

U02 owns only Charge-local route infrastructure beneath Next `basePath=/charge-agreements`: authentication guard helpers, BFF request helpers, and the standard loading/error/not-found/denied compositions used by domain pages. U01 owns Rate pages, U03 owns Agreement pages, and U04 owns manual evidence pages. U02 does not edit `packages/ui`, shared shell/navigation/ribbon, typography, palette, global design tokens, or Booking UI.

Physical App Router paths are written without the base path and are exposed with it by Next:

| App file/pattern | Public behavior |
|---|---|
| `app/loading.tsx` plus domain segment loading files | `/charge-agreements/...` pending state |
| `app/error.tsx` plus domain segment error files | recoverable render/data failure |
| `app/not-found.tsx` | authorized unknown Charge route/record fallback |
| `components/ChargeAccessDenied.tsx` | authenticated capability denial within current route |
| `app/api/health/route.ts` | `/charge-agreements/api/health`, public minimal JSON |
| domain `app/api/.../route.ts` | exact authenticated BFF policies supplied by U01/U03/U04 |

`proxy.ts` is not an authorization source. Server pages and route handlers call the same Charge-local session/policy helpers so health/assets are not accidentally gated and protected data is never prefetched before authorization.

## Component Hierarchy

```text
Charge App Router (existing RootLayout/shared primitives)
├── ChargeRouteGuard (server helper)
│   ├── missing session -> Auth sign-in redirect
│   ├── denied -> ChargeAccessDenied
│   └── allowed -> domain page (U01/U03/U04)
├── ChargeRouteLoading
│   └── domain-provided stable skeleton slots
├── ChargeRouteError (minimal client boundary)
│   ├── alert heading + safe reference
│   ├── Retry/reset
│   └── safe return action
├── ChargeNotFound
│   ├── not-found heading/copy
│   └── Charge/list return action
└── ChargeAccessDenied
    ├── generic denied heading/copy
    ├── safe broad resource/action context
    └── optional existing Auth request-access link
```

The four compositions use existing `@erp/ui` Button, Alert, Skeleton, Card/Panel, Stack/Grid, Status, and text primitives where exported. If an exact primitive is absent, U02 composes semantic HTML with existing tokens inside the Charge app; it does not add a shared export.

## Page Contracts

### Loading page

`loading.tsx` renders immediately with the same page max-width and title/action/content geometry as the target domain route. Domain segments provide deterministic slot counts (for example list title + filter bar + table rows, or detail title + summary/history panels); U02 supplies the pattern, not domain data.

- Skeletons are `aria-hidden`; one visually available `role=status` message says “Loading Charge data”.
- Geometry is stable across pending/resolved state to limit layout shift.
- No fake labels, rate/agreement values, progress percentage, or hardcoded commercial content appears.
- Pulse/transition is nonessential and disabled under `prefers-reduced-motion`; the page remains understandable when animation is absent.
- A pending mutation uses domain-local button text such as `Saving...`, not the route loading page.

### Error page

`error.tsx` is a client boundary only because Next supplies `error` and `reset`. It does not serialize the error object or render `error.message` directly. A server-safe correlation/request reference may be supplied through a normalized error channel; otherwise copy says the reference is unavailable.

- On first render, focus moves to the alert container (`tabIndex=-1`, `role=alert`) without repeated focus stealing.
- Heading: “Charge data could not be loaded”; copy distinguishes safe retryable/unavailable from generic failure without internal detail.
- Primary action invokes `reset()` once and shows `Retrying...` while pending. Secondary action returns to a validated Charge path.
- Browser URL/query remains unchanged on Retry, preserving filters/version selection.
- Recovery actions keep visible focus and 44 px target; live status announces retry result.

### Not-found page

The not-found page is an operational dead end, not a marketing 404. It renders only after route-level authorization for protected record paths, so it does not become an existence oracle.

- Heading: “Charge record not found”; copy says it may have moved or the link may be outdated.
- It does not echo backend stack, query payload, customer, money, or a hidden record identity. The already-visible route ID need not be repeated.
- Primary return is the relevant Rate/Agreement/manual list only when the caller is authorized for that list; otherwise return to `/charge-agreements/`.
- Back navigation may be offered only as secondary convenience and cannot replace the deterministic safe link.
- Initial focus follows normal document order at the `h1`; no forced alert announcement is used for a normal 404 page.

### Access-denied page

`ChargeAccessDenied` receives only a server-created `AccessDeniedViewModel`: broad resource label, action label, generic reason, correlation ID, request-access permission, and safe return path. It never receives the attempted domain payload or protected record summary.

- `h1` is “Access denied”; a focused `role=alert` summary announces the denial once.
- Copy names the required broad permission without listing the user's roles/permissions or suggesting the record exists.
- Manual evidence denial contains no count, case ID, reason, Booking reference, timestamp, or domain correlation. Only the BFF denial correlation may be shown.
- If shared Auth allows request access, link to `/auth/request-access` with only safe resource/action/correlation inputs; otherwise show the safe Charge return action.
- No mutation controls or disabled glimpses of protected content render behind/below the panel.

## BFF and Page Integration

### Server page guard

Domain server pages call `requireChargePageAccess(currentPath, capability)`. Missing sessions redirect to `/auth/sign-in?returnUrl=...`; denial returns a typed view model; success returns signed subject/correlation context. Data loaders run only after success. Client components receive permitted actions and safe display identity, never cookie/session permission arrays.

### Route handlers

Domain route handlers call `proxyCharge(request, policy, typedInput)`. The helper:

1. selects safe correlation and signed session;
2. constructs capabilities from signed permissions and evaluates the policy;
3. validates same-origin/JSON/body/client token for mutations or allowlisted query for reads;
4. removes browser actor/service headers/fields and reconstructs signed actor compatibility;
5. calls the fixed service path under a deadline;
6. returns safe normalized JSON plus `X-Correlation-Id`.

Reference selector handlers use a separate fixed Reference Data policy and return `{ value, label, status? }` only. U02 does not let browser option loading replace U01/U03 service validation.

### URL state

Domain pages remain the source of query semantics. U02 supplies helpers that preserve only allowlisted search parameters and a base-path-constrained return URL. Browser back/forward, deep-link copy, reload, form cancel, error Retry, and not-found return do not route through localStorage or RTK.

## State and Disclosure Matrix

| State | Loading | Error | Not found | Denied |
|---|---|---|---|---|
| Visual structure | stable domain geometry | compact alert panel | compact operational panel | compact security panel |
| Announcement | polite status | assertive once, retry polite | normal heading | assertive once |
| Focus | remains predictable | alert then Retry reachable | normal heading order | alert then safe action |
| Protected data | none | none | none beyond visible route | none |
| Primary action | none | Retry | safe list/Charge return | request access or safe return |
| URL context | current route | preserved on reset | safe base/list target | safe base/list target |
| Motion | optional reduced-safe skeleton | no decorative motion | none | none |

The same states work at 320/375/768/1024/1440 widths and light/dark themes through existing semantic tokens. At narrow width, actions wrap vertically, long safe correlations wrap with `overflow-wrap:anywhere`, and no horizontal page overflow is introduced.

## Accessibility and Interaction Contract

- One `h1` and landmark per route state; no heading-level jumps introduced by the local panel.
- Visible `:focus-visible` treatment is retained from shared controls; semantic links remain links and buttons remain buttons.
- Alerts/status messages are concise and do not continuously reannounce.
- Touch targets meet the shared 44 px minimum and action spacing avoids accidental activation.
- Text/status conveys meaning without color; safe correlation uses selectable text with an accessible label.
- Loading, Retry, denial, and redirect flows are keyboard-only operable. Error reset restores focus into updated content rather than to the document body.
- Reduced motion is respected. No spinner is the sole state indicator.
- Zoom/reflow to 200% and 320 CSS px preserve content and action reachability.

DS-01 can be closed only for a Charge-local dialog composition tested by the owning domain page. U02 route-state pages do not claim dialog evidence. DS-02 async combobox and DS-03 ribbon suppression remain W2-02 dependencies; source intent is not a PASS.

## Test and Evidence Hooks

- Stable `data-testid` values are limited to `charge-route-loading`, `charge-route-error`, `charge-route-retry`, `charge-route-not-found`, `charge-access-denied`, and safe-return actions.
- Component tests cover exact headings/actions, absence of raw errors/protected metadata, focus target, retry invocation, return URL validation, and reduced-motion class behavior.
- Route-handler tests cover session cookie decoding, exact capability, actor spoof stripping, origin/media/body/token guards, correlation echo, fixed path mapping, timeout, response size, normalized errors, JSON default backend media, and the non-browser-selectable U03 Agreement vendor-media override for reads/mutations.
- Nginx/config tests cover 308 root, deep links, assets, health/BFF preservation, and regressions for shell/Auth/Reference Data/Booking paths.
- Playwright evidence in U06 covers keyboard focus and four-width/two-theme states against real pages; U02 unit tests do not pre-claim live acceptance.

## Skill Influence and Rejected Suggestions

`ui-ux-pro-max` was invoked separately for loading, error, not-found, and denied pages plus the Next App Router stack. Adopted guidance includes route-native `loading.tsx`/`error.tsx`, stable Skeleton geometry, reduced motion, visible focus, announced errors, explicit recovery, deep-link URL state, and minimal client boundaries.

Rejected as conflicting with the LinerCore contract: hero/marketing 404 layouts, illustrations/images, sticky/new navigation, decorative or long animation, new palette/font, dark-by-default/OLED styling, raw spinners, direct Server Action replacement of the approved BFF, and any shared shell or `packages/ui` redesign. Charge-specific implementation notes, if added, go only to `design-system/linercore/pages/charge-and-agreements.md`.

## Upstream Coverage

This component design consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. It provides their route/loading/error/denied/focus/deep-link/authenticated BFF contract while keeping each domain page and every shared-system owner intact.

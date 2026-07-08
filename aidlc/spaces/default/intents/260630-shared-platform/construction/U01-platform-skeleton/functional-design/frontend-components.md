# Frontend Components - U01 Platform Skeleton

## Source Trace

This U01 frontend component design derives from `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, and `functional-design-questions.md`.

U01 defines frontend skeleton components and folders only. Full auth workflows and reference-data workflows are completed in U05 and U06.

## App Skeleton Layout

Both `apps/auth` and `apps/reference-data` use this structure:

```text
app/
  layout.tsx
  page.tsx
  api/
components/
providers/
services/
hooks/
lib/
schemas/
transformers/
constants/
proxy.ts
types.d.ts
```

## Shell Components

### AppRootLayout

Purpose: Provides route shell, metadata, global providers, and app-level accessibility structure.

Props/state:

| Item | Purpose |
|---|---|
| `children` | Route content. |
| `environmentLabel` | Local/dev/staging/prod display. |
| `providers` | Query/session/theme/config providers. |

Behavior:

- Renders one main content area.
- Provides skip-to-main target.
- Does not include domain-specific navigation yet.

### PlatformProviders

Purpose: Wraps app with TanStack Query, auth/session provider placeholder, and config provider.

Behavior:

- Does not fetch tokens in browser JavaScript.
- Reads only safe session summaries exposed by BFF routes.
- Leaves detailed auth behavior to U05.

### RouteProtectionProxy

Purpose: `proxy.ts` route protection placeholder.

Behavior:

- Checks approved session cookie presence/shape.
- Redirects unauthenticated access to auth entrypoint.
- Never exposes token values to browser JavaScript.

## BFF Route Placeholders

| Placeholder | Purpose | Completed by |
|---|---|---|
| `app/api/auth/*` | Sign-in/callback/sign-out/session routes. | U05 |
| `app/api/reference-data/*` | Reference API proxy/transform routes. | U06 |
| `app/api/contracts/*` | Contract catalog metadata routes. | U07 |
| `app/api/health` | App health/smoke route. | U10 |

## Shared Package Placeholders

| Package | Initial export intent |
|---|---|
| `@erp/ui` | Button, input, table, dialog, status badge, app shell placeholders. |
| `@erp/api-core` | Axios client factory and error envelope types. |
| `@erp/auth` | Session summary and BFF auth helper types. |
| `@erp/transformers` | API DTO to UI model transformer placeholder. |
| `@erp/shared-types` | Generic API response, API error, pagination, nullable types. |
| `@erp/config` | Environment config accessors. |
| `@erp/utils` | Approved shared utility placeholder. |

## Interaction States

U01 skeleton components define state slots but not full behavior:

| State | Skeleton behavior |
|---|---|
| Loading | Standard loading region placeholder. |
| Error | Standard error envelope display placeholder. |
| Empty | Placeholder available for later domain screens. |
| Access denied | Route shell can render denied route; detailed UX in U05/U06. |
| Healthy/unhealthy | Health route returns app status placeholder. |

## Validation Rules

- All placeholders must compile in TypeScript strict mode once implemented.
- Components must use approved `@erp/*` imports.
- No Redux Toolkit, SWR, CSS Modules, Styled Components, Emotion, jQuery, Moment.js, npm, or pnpm.
- No direct browser-to-backend service calls.

## Out of Scope

- Full sign-in UI behavior.
- Full reference-data workspace UI behavior.
- Contract catalog rendering.
- Mobile reference lookup details.
- Charge, Booking, or Container Movement frontend routes.

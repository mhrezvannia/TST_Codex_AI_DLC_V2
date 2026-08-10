# Component Inventory

## Frontend Applications

| Component | Responsibility | Key dependencies | Health for W2-02 |
|---|---|---|---|
| `apps/shell` | Canonical authenticated host, navigation, Booking mount and compatibility routes | `@erp/auth`, Booking proxy, nginx | At risk: shell shape is separate from `PlatformShell`, but runtime ownership is canonical |
| `apps/booking` | Booking list/create/detail UI and protected BFF | Booking service, shared types, declared `@erp/ui` | Degraded for closure: declares but does not render `@erp/ui`; local theme/chrome remains |
| `apps/auth` | Login and authentication presentation | identity/session seams, `@erp/ui` | Healthy contextual dependency |
| `apps/reference-data` | Reference-data operations | reference-data service, `@erp/ui` | Healthy contextual reference |
| `apps/charge-agreements` | Agreement lifecycle operations | charge-agreement service, `@erp/ui` | Healthy contextual reference |

Evidence is in each application's `package.json` and `app/` tree. nginx route ownership is defined in `infrastructure/nginx/default.conf`.

## Shared Frontend Packages

| Component | Responsibility | Evidence | Health for W2-02 |
|---|---|---|---|
| `@erp/ui` | Tokens, styles, primitives, state views, interactive widgets, shell pattern | `packages/ui/src/index.tsx`, `primitives.tsx`, `interactive.tsx`, `styles.ts` | Implemented; consumption/enforcement gap remains |
| `@erp/auth` | Shared identity/session client behavior | `packages/auth/` | Existing; Booking manifest mismatch to verify |
| `@erp/api-core` | Shared API mechanics | `packages/api-core/` | Contextual |
| `@erp/shared-types` | Cross-frontend TypeScript types | `packages/shared-types/` | Used by Booking |
| `@erp/config` | Shared configuration | `packages/config/` | Contextual |
| `@erp/transformers` | Shared data transformations | `packages/transformers/` | Contextual |
| `@erp/utils` | Common utilities | `packages/utils/` | Contextual |

`@erp/ui` exports `DesignSystemStyles`, `Stack`, `Inline`, `Button`, `Field`, `Input`, `Select`, `Card`, `Badge`, `StatusBadge`, `Table`, `EmptyState`, `Skeleton`, `StatusStrip`, `Tabs`, `Combobox`, `Dialog`, `Toasts`, `ThemeToggle`, `PlatformShell`, and `WorkflowCommandCenter`. The closure should reuse these exports rather than duplicating their semantics in `apps/booking/app/booking.css`.

## Backend Services

| Service | Responsibility | Primary evidence | Health for W2-02 |
|---|---|---|---|
| Identity | Authentication/authorization/roles | `services/identity-service/` | Preserve |
| Reference Data | Reference CRUD/history/lookup | `services/reference-data-service/` | Preserve |
| Charge Agreement | Agreement lifecycle and pricing | `services/charge-agreement-service/` | Preserve |
| Booking | Booking commands, lifecycle, snapshots, outbox | `services/booking-service/` | Preserve; live journey dependency |
| Container Movement | Journeys and movements from Booking events | `services/container-movement-service/` | Preserve; live downstream dependency |
| Platform Messaging | Kafka/schema/outbox integration support | `services/platform-messaging/` | Preserve |

The service-owned database and event boundaries are intentional. W2-02 is not authority to merge services, introduce direct database coupling, or change event delivery from asynchronous to synchronous HTTP.

## Runtime and Verification Components

- `infrastructure/nginx/default.conf` owns route ingress.
- `scripts/wave-a-compose.mjs` pins the isolated `linercore-wave-a` project and must be the Compose entry point.
- `scripts/demo-guard.mjs` observes and protects the manager demo at port 8088.
- `.github/workflows/quality-gates.yml` is the current CI quality workflow but does not yet make W2-02 package-consumption or Playwright evidence explicit.
- The repository has `@playwright/test` in root `package.json`, but no stable Playwright config/spec suite was found.
- `artifacts/w2-02-live/` is absent at the scanned commit and is the required durable closure destination.

The historical W1 merge gate remains `BLOCKED` with a separate waiver. These runtime components may generate new observed evidence, but must not mutate that historical classification.

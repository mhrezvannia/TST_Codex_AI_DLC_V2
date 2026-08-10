# Components — W2-02 Design-System Closure

## Design Basis

This component design reconciles `requirements.md`, `stories.md`, brownfield `architecture.md`, `component-inventory.md`, and `team-practices.md`. It preserves the existing nginx → authenticated shell → Booking BFF → Booking service topology. The closure changes presentation ownership and proofability; it does not create a service, database, event contract, cloud environment, or second frontend.

## C1 — Shared UI Foundation

- **Location/owner:** `packages/ui`; W2-02.
- **Purpose:** Single executable token and generic primitive boundary.
- **Owns:** `--erp-*` tokens, light/dark themes, focus/motion behavior, generic layout/input/display/feedback/overlay primitives, shared tests.
- **Public surface:** Existing package exports such as DesignSystemStyles, Stack, Inline, Button, Field, Input, Select, Combobox, Table, Badge/StatusBadge, Tabs, Dialog, Toasts, EmptyState, Skeleton, StatusStrip, ThemeToggle, and shell primitives.
- **Does not own:** Booking form schema, Booking lifecycle commands, route data, BFF behavior, shell route metadata, or acceptance orchestration.
- **Change rule:** Add or correct only a proven generic gap; never move Booking-specific compositions here.

## C2 — Existing Authenticated Shell Frame

- **Location/owner:** `apps/shell/app/ShellFrame.tsx` and existing shell styles/routes; preserve W2-01 behavior.
- **Purpose:** Sole canonical banner, navigation, breadcrumbs, theme, identity/sign-out, workflow context, and main landmark.
- **Public interface:** Route compositions supply active path, breadcrumbs, session, explicit workflow context, and children.
- **Boundary:** Shell may consume `@erp/ui` but must not import another application. Booking route content must not recreate shell chrome.
- **Closure change:** Reconcile existing shell styling with shared tokens/primitives at the smallest compatible seam; no wholesale shell replacement.

## C3 — Canonical Booking Route Compositions

- **Location/owner:** `apps/shell/app/booking/**`; Booking domain presentation under the canonical shell.
- **Purpose:** Sole user-facing Booking list, create, detail, lifecycle, and explicit state compositions.
- **Owns:** Route-level data loading, domain copy, filters, form state, lifecycle/action composition, accessibility focus/announcement behavior, and semantic-native exception register.
- **Consumes:** C1 shared primitives/tokens, C2 shell, C4 shell Booking client/API adapters, existing shared types.
- **Public interface:** Next.js App Router pages/loading/error boundaries and focused client components; canonical routes `/booking`, `/booking/new`, and `/booking/[bookingId]` plus existing compatibility route policy.
- **Does not own:** Authentication implementation, service authorization, business rules, storage, or message publication.
- **Closure change:** Migrate applicable visible presentation to C1; add Skeleton/empty/error/denied/degraded behavior; preserve existing business interaction.

## C4 — Shell Booking Client and Route Adapters

- **Location/owner:** `apps/shell/lib/booking-client.ts`, `apps/shell/app/api/booking/**`.
- **Purpose:** Same-origin canonical adapter from shell presentation to the protected Booking BFF.
- **Owns:** Forwarding query/path/body, cookie and correlation propagation, response normalization for shell route needs.
- **Public surface:** Existing `loadShellBookings`, `loadShellBooking`, and `forwardToBookingBff` functions plus route-handler GET/POST endpoints.
- **Boundary:** Never calls Booking persistence or bypasses C5; does not reinterpret domain rules.

## C5 — Booking BFF Adapter

- **Location/owner:** `apps/booking/app/api/**`, `apps/booking/lib/bookings.ts`, and associated mapping/auth helpers.
- **Purpose:** Protected frontend backend boundary to Booking service/reference/pricing dependencies.
- **Owns:** Subject/session derivation, correlation, idempotency, request validation/size, timeout/abort, service headers, and safe response/error mapping.
- **Public surface:** Existing same-origin API route handlers and `proxyBooking(request, path, method)`.
- **Presentation decision:** Retain BFF endpoints. Decommission or redirect standalone `apps/booking/app/bookings/**` presentation routes so they cannot remain a second canonical UI; no iframe or app-to-app import.
- **Does not own:** Canonical shell chrome, shared token system, service data, or new UI persistence.

## C6 — Existing Booking and Supporting Services

- **Location/owner:** `services/booking-service`, reference-data, charge-agreement/pricing, platform-messaging, and container-movement services.
- **Purpose:** Existing business validation, pricing, lifecycle, persistence, outbox/event publication, and downstream consumption.
- **Boundary:** Service-owned databases and existing API/event contracts remain unchanged. Confirmation events remain asynchronous.
- **Closure change:** None unless live evidence exposes a directly traced compatibility defect; any such change requires explicit scope validation.

## C7 — Presentation Anti-Drift Gate

- **Location/owner:** Root lint configuration and focused verification script/test.
- **Purpose:** Make the shared presentation boundary executable.
- **Owns:** Detection of hardcoded application color literals, application-local `CSSProperties` systems, undeclared workspace imports where applicable, and non-writing negative probes.
- **Inputs/outputs:** Scans applicable `apps/**` TS/TSX/CSS; returns non-zero with file/rule evidence; excludes C1’s owning token implementation and documented semantic-native elements.
- **Does not own:** Formatting policy, broad security scanning, or invented coverage thresholds.

## C8 — W2-02 Live Acceptance Harness

- **Location/owner:** Root Playwright/config/helpers and `artifacts/w2-02-live/`; quality/release reviewer.
- **Purpose:** Reproduce canonical live journey, difficult UI states, responsive/theme/accessibility matrix, and hard closure gates.
- **Owns:** Browser scenarios, deterministic controlled-state setup, evidence manifest, screenshots/traces/results, command capture, and requirement mapping.
- **Runtime boundary:** Operates only through `scripts/wave-a-compose.mjs` and `linercore-wave-a`; calls `npm run demo:guard` before and after; never targets `linercore-shared-platform`.
- **Does not own:** Production runtime code, cloud infrastructure, business data contracts, or manager-demo lifecycle.

## Component Ownership Summary

| Component | Existing/new | Primary owner | Allowed closure mutation |
|---|---|---|---|
| C1 UI foundation | Existing | W2-02 | Focused token/primitive/test corrections |
| C2 shell frame | Existing | W2-01 behavior, W2-02 seam | Minimal shared-style integration only |
| C3 canonical Booking UI | Existing/modified | W2-02 Booking migration | Main presentation migration and states |
| C4 shell adapters | Existing | Shell/Booking seam | Preserve; focused compatibility only |
| C5 Booking BFF | Existing | Booking | Preserve endpoints/protections; retire duplicate pages |
| C6 services | Existing | Domain intents | No planned change |
| C7 anti-drift gate | Existing/extended | W2-02 | Close CSS/style-system/package gaps |
| C8 acceptance harness | New focused proof | W2-02 quality | Root-only local acceptance/evidence |

## Review

**Verdict: READY**

### Findings

- All four recorded answers are unambiguous and consistently reflected across the five design artifacts.
- Component responsibilities and public seams are cohesive: the authenticated shell remains the sole canonical Booking presentation, while `apps/booking` retains the protected BFF boundary and no app-to-app imports are permitted.
- Dependency direction is acyclic and preserves the existing shell-to-BFF-to-service path, service-owned data, authentication/correlation/idempotency protections, and asynchronous event choreography.
- Generic tokens and primitives remain in `packages/ui`; Booking-specific composition remains in the canonical shell route.
- The root-only acceptance harness is isolated to `linercore-wave-a`, uses `scripts/wave-a-compose.mjs`, protects the manager demo before and after execution, retains failure evidence, and adds no AWS or production infrastructure.
- The ADRs document viable options, trade-offs, consequences, rejected alternatives, and reversibility. The blocking anti-drift/audit gates and baseline W0/W1/W2-01 behavior are preserved as closure truth.

### Mandatory Corrections

None.

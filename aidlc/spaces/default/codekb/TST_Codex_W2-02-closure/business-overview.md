# Business Overview

## Business Domain and Purpose

LinerCore is an internal liner-shipping carrier platform. The scanned repository implements authenticated operational workflows for identity, reference data, customer and charge agreements, Booking, and Container Movement Management. The W2-02 intent is a brownfield design-system closure: it preserves the existing runtime and business behavior while making the canonical Booking journey consume the shared UI foundation and producing observable acceptance evidence. The intent source is `docs/intents/W2-02-design-system-foundation.md`; program ordering and ownership are defined in `docs/intents/00-INTENT-BACKLOG.md` and `docs/aidlc-v2-slicing-playbook.md`.

The operational user enters through the authenticated shell, works a Booking from create through validate, price, and confirm, and then observes downstream container-movement status. The route and runtime seams are already present in `infrastructure/nginx/default.conf`, `apps/shell/app/booking/`, `apps/shell/lib/booking-client.ts`, `apps/booking/app/`, and `apps/booking/lib/bookings.ts`. W2-02 therefore does not create a second application, navigation system, theme, or backend workflow.

## Key Capabilities

- Authentication, authorization, role management, and session-derived identity are exposed by `apps/auth/`, `apps/shell/lib/shell-auth.ts`, and `services/identity-service/`.
- Reference-data maintenance and lookup live in `apps/reference-data/` and `services/reference-data-service/`; Booking reference options are adapted through `apps/booking/app/api/reference-options/route.ts`.
- Agreement lifecycle and pricing are implemented in `apps/charge-agreements/` and `services/charge-agreement-service/`, including `ChargeAgreementApiController.java` and `PricingApiController.java`.
- Booking list, create, detail, validate, price, and confirm are implemented by `apps/booking/app/bookings/`, `apps/booking/app/api/bookings/`, and `services/booking-service/container/src/main/java/com/linercore/platform/booking/container/api/BookingApiController.java`.
- Confirmed Booking events feed Container Movement Management through the shared messaging seam, with the receiving API and runtime under `services/container-movement-service/` and common broker support under `services/platform-messaging/`.
- Shared operational-console tokens, primitives, interactive components, state presentations, theme support, and shell patterns are exported from `packages/ui/src/index.tsx`, `packages/ui/src/primitives.tsx`, `packages/ui/src/interactive.tsx`, and `packages/ui/src/styles.ts`.

## W2-02 Closure Outcome

The smallest valid closure migrates the canonical Booking experience to `@erp/ui`, removes or formally reconciles the Booking-local style and navigation system, uses the existing `Skeleton` and explicit loading/empty/error/denied states, and strengthens enforcement against new local themes or style systems. It must then demonstrate keyboard behavior, light/dark themes, network states, and responsive widths through live Playwright evidence on the isolated Wave A stack.

Acceptance must use `scripts/wave-a-compose.mjs`, the `linercore-wave-a` Compose project, and `scripts/demo-guard.mjs` before and after. The protected manager demo is the separate `linercore-shared-platform` project at port 8088 and is never an acceptance target. Evidence belongs under `artifacts/w2-02-live/`, followed by green `aidlc-audit` and `erp-fidelity-audit` results and backlog closure.

## Historical Truth and Boundaries

The current branch is `intent/W2-02-design-system-closure` at `c2f13dd9c2ca2fe754a075f6688c74d7bdb90b0f`. That commit preserves ancestry from `c96b5b3`; neither baseline is to be reset or replaced. Prior merged W0-01, W0-02, W1-01, W2-01, and W2-02 work remains authoritative.

W1 live proof remains historically `BLOCKED` with a separate waiver. A later observed pass may be recorded as new evidence, but this closure must not relabel the waiver as a real pass. W2-02 owns `packages/ui`, shared tokens and primitives, the Booking reference migration, and the design-system master; broader module migration remains outside this vertical closure.

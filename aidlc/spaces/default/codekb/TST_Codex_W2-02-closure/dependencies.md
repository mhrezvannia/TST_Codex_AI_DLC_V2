# Dependencies

## Internal Dependency Topology

The canonical frontend chain is `nginx -> apps/shell -> apps/booking BFF -> booking-service`. The shell-side adapter is `apps/shell/lib/booking-client.ts`; the Booking-side outbound adapter is `apps/booking/lib/bookings.ts`. Booking UI uses `@erp/shared-types` and declares `@erp/ui` in `apps/booking/package.json`, but current rendered pages do not import the UI package. Booking code also imports `@erp/auth` without a matching manifest declaration, creating a package-boundary hygiene risk.

`packages/ui` depends only on React as a peer according to `packages/ui/package.json`. That low dependency surface is appropriate for a shared presentation package. Its consumers should depend on exported primitives and tokens rather than copying local brand values or component implementations.

## Service Dependencies

Booking synchronously validates against Reference Data and Charge Agreement/pricing capabilities, then publishes lifecycle events asynchronously through shared messaging. Evidence spans `services/booking-service/`, `services/reference-data-service/`, `services/charge-agreement-service/`, and `services/platform-messaging/`. Container Movement Management consumes confirmed Booking events under `services/container-movement-service/`.

The allowed dependency direction keeps each service's domain core independent of Spring, persistence, messaging, and frontend code. Cross-service data access occurs through APIs/events, never database joins. W2-02 must not add service dependencies merely to support presentation migration.

## External Runtime Dependencies

- Keycloak supports authenticated subject and authorization flows used by the shell and identity service.
- PostgreSQL provides service-owned persistence in local Compose.
- Kafka and Schema Registry support event publication and consumption.
- nginx owns public routing and canonical shell entry.
- Docker Compose supplies the local integration topology.
- Playwright drives browser acceptance; Vitest and Testing Library cover component behavior.

Configuration is found in Compose/environment files, `infrastructure/nginx/default.conf`, root `package.json`, and `services/pom.xml`.

## Closure-Critical Dependency Risks

The main W2-02 dependency defect is declarative rather than architectural: `apps/booking` names `@erp/ui` but bypasses it at render time, so the shared design-system relationship is not executable. The local `apps/booking/app/booking.css` then acts as an undeclared theme dependency. Existing ESLint coverage does not inspect CSS or prohibit a full local `CSSProperties` system, and `.github/workflows/quality-gates.yml` does not enforce package consumption or live Playwright evidence.

Closure should turn these implicit dependencies into testable boundaries: import and render shared primitives/tokens, declare every package used, add a negative enforcement probe, and run real browser evidence. The `linercore-wave-a` acceptance stack is an isolated dependency; `linercore-shared-platform` and port 8088 are protected and must remain untouched.

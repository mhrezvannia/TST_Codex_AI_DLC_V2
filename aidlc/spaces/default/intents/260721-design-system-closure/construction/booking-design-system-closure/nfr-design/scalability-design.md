# Scalability Design — booking-design-system-closure

## Design Inputs

This design realizes `scalability-requirements.md` while respecting `performance-requirements.md`, `security-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. It defines bounded presentation/evidence growth only.

## Pagination and DOM Bound

The shell list route owns URL query normalization and forwards one existing service page request with size 25. The list view renders only the returned page:

- one header row plus at most 25 data rows;
- canonical detail links rather than inline expansion of every record;
- no client-side all-record cache;
- no infinite scroll or background page prefetch;
- one intentional Table scroller on narrow screens.

The acceptance harness records response item count and rendered row count. More than 25 data rows or page-level horizontal overflow fails the boundary.

## State and Theme Scaling

Loading, empty, populated, denied, error, degraded, validationBlocked, pending, success, and fatal variants share one route/component tree. Light/dark variants resolve through the same `--erp-*` tokens. Viewports reuse one responsive composition.

This prevents combinatorial duplication: state × theme × viewport is an evidence matrix, not separate implementations, shells, themes, or routes.

## Dependency Direction

- `packages/ui` may grow only through domain-neutral primitives/tokens with focused tests.
- shell Booking composition consumes `@erp/ui` and same-origin adapters.
- the Booking BFF consumes no UI code.
- services retain their databases/event boundaries.
- test/evidence helpers depend on public routes and cannot be imported by production packages.

These one-way boundaries avoid circular ownership and permit later module reuse without making W2-02 a global module migration.

## Acceptance Data Isolation

Each Playwright case declares its setup method and owns or identifies its data. The real happy path uses live service data; rare state cases use request interception or controlled isolated service conditions against the same running route. Cases do not depend on execution order or mutate the manager-demo project.

Evidence paths include a run identity and case identity so reruns retain original failures rather than overwrite them. The manifest references artifacts instead of embedding large payloads.

## Runtime Scaling Non-Design

Existing Next.js/Java containers, nginx, PostgreSQL, Keycloak, Kafka, Schema Registry, and service scaling stay unchanged. There is no new load balancer, replica, shard, cache, queue, autoscaling rule, CDN, AWS service, or cost model.

If a future observed list size, RPS, data growth, or resource saturation exceeds current behavior, it becomes a separately measured vertical intent. This design records no implied production headroom.

## Degradation Containment

At capacity/dependency pressure, security and integrity controls never shed. The UI retains the shell and last reliable content, disables only affected commands, names degradation, and permits bounded safe retry. It does not retry automatically, fan out calls, or load additional pages to simulate availability.


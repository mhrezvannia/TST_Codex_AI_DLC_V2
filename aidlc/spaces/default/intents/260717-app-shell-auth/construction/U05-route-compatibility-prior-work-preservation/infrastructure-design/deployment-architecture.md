# Deployment Architecture - U05 Route Compatibility and Preservation

## Source Context

This deployment architecture consumes U05 `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md`, application `services.md`, and U05 `business-logic-model.md`. It maps legacy `/bookings*` compatibility to local Compose/Nginx plus shell-owned Next.js redirects.

## Compute Model

| Component | Deployment design | U05 role |
| --- | --- | --- |
| Nginx | Existing browser edge. | Forward `/bookings*` and canonical `/booking*` to `apps-shell`; no backend prefetch. |
| `apps-shell` | Shell host from U01. | Own fixed compatibility redirect routes and canonical protected routes. |
| `apps-booking` | Existing Booking BFF/UI source. | Data loading only after canonical shell route. |
| booking-service | Existing Spring service. | Preserve W1 behavior; no route-compatibility role. |
| Preservation evidence tooling | Evidence/build-time only. | Diff/path review and targeted verification, not runtime service. |

## Network Topology

```text
Browser -> Nginx -> apps-shell compatibility route -> 308 /booking*
Browser -> Nginx -> apps-shell canonical route -> apps-booking/BFF -> booking-service
```

Text fallback: Legacy routes enter Nginx and are forwarded to shell. Shell redirects to canonical `/booking*` before any Booking data load. Canonical routes then use the normal protected shell/Booking path.

## Route Plan

| Legacy route | Nginx target | Shell behavior |
| --- | --- | --- |
| `/bookings`, `/bookings/` | `apps-shell:3000` | 308 to `/booking`, preserving only `page`, `pageSize`, `sort`, `direction`, `status`, `q`. |
| `/bookings/new`, `/bookings/new/` | `apps-shell:3000` | 308 to `/booking/new`, dropping all query parameters. |
| `/bookings/[id]`, `/bookings/[id]/` | `apps-shell:3000` | Decode id once, reject invalid ids with shell 404, otherwise 308 to `/booking/[encoded-id]`, dropping all query parameters. |

Route precedence is explicit: `/bookings/new` is matched before dynamic id. Malformed ids, empty ids, extra segments, path traversal, encoded slash, or invalid percent encoding return shell 404 before redirect or backend access.

## Environment Definitions

No new environment service is required. Nginx config needs `/bookings*` forwarding to shell. `apps-shell` owns redirect logic and evidence-friendly correlation. Existing Booking and auth service configuration is reused.

## Preservation Boundary

U05 deployment architecture does not add AWS, CDN, cache, queue, route database, W4-01 migration surface, runtime preservation service, or design-system foundation. W0-01, W0-02, W1-01, and W2-02 remain protected; W1 waiver remains BLOCKED at `compose-start`.


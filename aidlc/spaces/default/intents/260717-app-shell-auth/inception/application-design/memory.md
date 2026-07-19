# Application Design Diary

## Observations

- `requirements.md`, `stories.md`, `architecture.md`, `component-inventory.md`, and `team-practices.md` all constrain W2-01 to a single authenticated shell plus Booking mount.
- Fresh codebase-memory MCP confirms `apps/auth/lib/auth-server.safeSessionSummary` can expose session summaries, `apps/booking/lib/bookings.serviceHeaders` currently hardcodes `x-linercore-actor-id` to `local-user`, and `BookingApiController.actor` falls back to `local-user` when blank.
- MCP trace shows `serviceHeaders` is a high-risk fan-in seam called by `proxyBooking`, `loadJson`, and Booking route handlers for list/detail/create/action paths.
- Platform support perspective: W2-01 acceptance is local/on-prem Compose with Nginx and Keycloak; no AWS infrastructure is in scope.
- Architecture review iteration 1 returned NOT-READY. The design now fixes `apps/shell` as the concrete host, canonicalizes `/`, `/booking`, `/booking/new`, and `/booking/[id]`, maps `/bookings*` compatibility redirects, specifies identity-service Booking authorization request mapping and seed/catalog changes, and defines backend blank-actor enforcement in code terms.

## Interpretations

## Deviations

## Tradeoffs

## Open questions

- Final route namespace remains an application-design decision in this stage; choose a root shell path with `/booking` unless existing Nginx/app routing requires `/app/booking`.

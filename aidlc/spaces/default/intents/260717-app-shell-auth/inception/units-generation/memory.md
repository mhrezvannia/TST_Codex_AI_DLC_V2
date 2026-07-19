# Units Generation Diary

## Observations

- `components.md` fixes the concrete shell host as `apps/shell`, canonical shell routes as `/`, `/booking`, `/booking/new`, and `/booking/[id]`, with `/bookings*` compatibility redirects.
- `component-methods.md` names the high-risk method seams: `requireShellSession`, `serviceHeaders`, `requireBookingActor`, identity-service authorization mapping, `BookingApiController.actor`, and `BookingLocalIdentityFilter`.
- `services.md` keeps W2-01 on local Compose/Nginx/Keycloak and excludes AWS/cloud expansion.
- `component-dependency.md` provides topology and risk hotspots, including the `serviceHeaders` fan-in and identity catalog gap.
- `decisions.md`, `requirements.md`, and `stories.md` require prior-work preservation and explicit W1 waiver handling.
- Architecture review iteration 1 returned NOT-READY because the first unit set was layer/workstream-oriented and lacked per-unit observed live-stack DoD. Units were resliced into vertical observed increments and `unit-of-work.md` was rewritten to the binding template headings.
- Architecture review iteration 2 returned NOT-READY only for missing NFR-07 coverage on U03's access-denied UI. U03 and the story map were patched to carry the same prohibited-library constraints as the other frontend units.

## Interpretations

## Deviations

## Tradeoffs

## Open questions

- Delivery Planning must choose the economic Bolt sequence. This stage only records unit topology and valid dependency relationships.

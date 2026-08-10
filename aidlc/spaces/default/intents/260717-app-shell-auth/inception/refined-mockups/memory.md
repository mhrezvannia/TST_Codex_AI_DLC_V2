# Refined Mockups Diary

## Observations

- `wireframes.md` and `user-flow.md` already define the six W2-01 screens: protected entry, shell landing, mounted Booking list, Booking detail/action, access denied, and signed out.
- `stories.md` narrows the UX work to US-01 through US-04 and keeps non-mounted modules as placeholders or external links.
- `requirements.md` requires one authenticated shell, session-derived Booking actor propagation, deterministic allow/deny users, sign-out, live evidence, and explicit W1 waiver preservation.
- `team-practices.md` requires the first Construction slice to prove protected shell entry and one Booking call that cannot fall back to `local-user`.
- Product-lead fallback review iteration 1 returned NOT-READY because W0-01/W0-02 preservation was implicit. The refined packet now explicitly preserves W0-01 platform/eventing and W0-02 reference-data seed/completeness surfaces.

## Interpretations

## Deviations

## Tradeoffs

## Open questions

- Delivery planning still needs to choose whether the shell route path is `/` plus `/booking`, or a namespace such as `/app` plus `/app/booking`.

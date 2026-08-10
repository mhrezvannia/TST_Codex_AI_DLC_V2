# Code Generation Memory - U02 Reference Validation

## Interpretations

- 2026-07-16T13:45:00Z - Treated U02 validation snapshots as snapshot-codec state, not a new database migration; the design asked for compatibility with U01 Booking snapshots, and the existing JSON snapshot column can carry the typed validation result without schema expansion.
- 2026-07-16T13:45:00Z - Treated strict local identity as service-to-service only; direct localhost API calls must include the BFF service identity or receive 401, while the UI/BFF path supplies those headers.

## Deviations

- 2026-07-16T13:45:00Z - Reference app Docker image rebuild was not completed; Docker-internal Yarn package fetches timed out, while host typecheck/build passed and the live backend proof used the rebuilt Booking service image.
- 2026-07-16T13:45:00Z - In-app browser proof was replaced with HTTP/SSR and automated app tests because the browser connector is unavailable in this environment.

## Tradeoffs

- 2026-07-16T13:45:00Z - The Reference Data adapter uses three bounded task groups instead of one task per reference field; this keeps latency inside the U02 target while preventing executor saturation under concurrent validation.
- 2026-07-16T13:45:00Z - The seed-loader and Reference app helpers attach local Reference Data service tokens only to `/reference-sets` calls; this avoids leaking Reference Data local credentials to Identity calls through shared fetch helpers.

## Open questions

- 2026-07-16T13:45:00Z - Confirm whether Build/Test should add a Docker build cache or offline package mirror for Next app images so Docker app rebuilds do not depend on external registry availability.

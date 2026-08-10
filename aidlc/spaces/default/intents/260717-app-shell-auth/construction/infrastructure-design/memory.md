# Memory - Infrastructure Design

## Interpretations

- 2026-07-18T00:00:00Z - U01 Infrastructure Design maps the app shell to the existing local Docker Compose and Nginx topology; the AWS platform perspective is constrained to local/on-prem service topology because W2-01 has no cloud acceptance scope.
- 2026-07-18T00:00:00Z - U02 Infrastructure Design maps Booking create authorization to existing booking-service and identity-service Compose services; infrastructure work is configuration and deterministic seed/catalog provisioning, not a new authorization runtime.
- 2026-07-18T00:00:00Z - U03 Infrastructure Design reuses the U02 authorization topology to prove `local.reference.admin` denial; infrastructure success depends on preserving the deny fixture, not hiding routes or changing shell navigation.
- 2026-07-18T00:00:00Z - U04 Infrastructure Design keeps sign-out owned by existing `apps-auth` and treats BFF early return plus backend no-`local-user` observation as infrastructure evidence for stale-call containment.
- 2026-07-18T00:00:00Z - U05 Infrastructure Design resolves the older redirect/internal-resolution ambiguity in favor of shell-owned Next.js redirects, with Nginx forwarding `/bookings*` to shell unchanged.
- 2026-07-18T00:00:00Z - U06 Infrastructure Design treats final acceptance as finite local command/scenario capture into `artifacts/w2-01-live/app-shell-auth/`; evidence tooling observes runtime but does not become runtime infrastructure.

## Deviations

- 2026-07-18T00:00:00Z - No AWS service, CDN, cache, queue, managed observability service, or new auth runtime service is selected for U01; the required infrastructure change is a new `apps-shell` Compose service and Nginx shell route.
- 2026-07-18T00:00:00Z - No role-admin UI, authorization cache, queue, new database, or cloud service is selected for U02 because identity-service already owns permission decisions and booking-service owns idempotent persistence.
- 2026-07-18T00:00:00Z - No policy-admin UI, shell-only deny authority, or authorization polling service is selected for U03 because backend identity authorization must remain the proof authority.
- 2026-07-18T00:00:00Z - No parallel logout provider, Nginx cookie rewriting, shared session cache, or client global session library is selected for U04 because the existing auth route owns `lc_session` deletion.
- 2026-07-18T00:00:00Z - No route database, Nginx direct redirect table, runtime preservation service, or W4-01 migration infrastructure is selected for U05 because shell-owned fixed redirects and evidence-time diff review are sufficient.
- 2026-07-18T00:00:00Z - No evidence database, continuous worker, cloud acceptance environment, or managed observability service is selected for U06 because PASS/BLOCKED is derived from parseable local files and command outputs.

## Tradeoffs

- 2026-07-18T00:00:00Z - U01 prioritizes Nginx-entered live proof over direct app-port convenience; direct app ports remain diagnostic only because acceptance must observe the shell through the local edge.
- 2026-07-18T00:00:00Z - U02 prioritizes deterministic seed/catalog evidence over runtime policy management; this keeps the allow proof repeatable while preserving the later deny fixture.
- 2026-07-18T00:00:00Z - U03 prioritizes explicit backend-backed denial over route concealment; visible in-shell denial is required evidence, not a UX fallback.
- 2026-07-18T00:00:00Z - U04 prioritizes independent backend no-call evidence over browser-only logout appearance; signed-out UI is insufficient without cookie clear, reauth, and stale-call containment.
- 2026-07-18T00:00:00Z - U05 prioritizes explicit edge-case routing rules over preserving arbitrary legacy URLs; unknown query parameters are dropped and malformed ids return shell 404 before backend access.
- 2026-07-18T00:00:00Z - U06 prioritizes deterministic parse checks over narrative summaries; missing files, unparseable JSON/JSONL, secret leakage, or inconsistent command/scenario statuses block final PASS.

## Open questions

- 2026-07-18T00:00:00Z - Code generation should confirm the exact `apps-shell` package name in `package.json` and whether shell-to-Booking uses `apps-booking` BFF HTTP or shared server helpers.
- 2026-07-18T00:00:00Z - Code generation should confirm the exact booking-service identity authorization env variable names and timeout setting when implementing the adapter.
- 2026-07-18T00:00:00Z - Code generation should confirm the seed/catalog diff keeps `local.reference.admin` without Booking permissions after U02 adds `local.booking.user`.
- 2026-07-18T00:00:00Z - Code generation should confirm whether `/signed-out` is served by `apps-auth`, `apps-shell`, or both through Nginx while preserving the existing auth route ownership.
- 2026-07-18T00:00:00Z - Code generation should confirm Nginx route ordering so `/bookings*`, `/booking*`, `/auth/`, `/reference-data/`, and `/health` do not shadow each other.
- 2026-07-18T00:00:00Z - Code generation should confirm exact detector 6d, `erp-fidelity-audit`, and `aidlc-audit` commands and implement capture wrappers that write command outputs and manifest entries consistently.

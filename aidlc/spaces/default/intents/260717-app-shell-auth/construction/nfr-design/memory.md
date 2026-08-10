# Memory - NFR Design

## Interpretations

- 2026-07-18T00:00:00Z - U01 NFR Design translates local Construction thresholds into implementation patterns; it does not introduce public-cloud, AWS, or production SLO commitments because W2-01 acceptance is local Compose/Nginx.
- 2026-07-18T00:00:00Z - The AWS platform support perspective is constrained by approved W2-01 scope: platform design means Docker Compose/Nginx topology and future-compatible stateless boundaries, not AWS service selection.
- 2026-07-18T00:00:00Z - U02 NFR Design keeps Booking create synchronous and real-subject authorized; identity-service latency is bounded inside the local create budget and all non-allow outcomes fail closed before mutation.
- 2026-07-18T00:00:00Z - U03 NFR Design treats an authenticated authorization deny as a successful denied-state proof only when the shell renders explicit access denied evidence; empty-list, hidden-route, or 404 substitutes fail the unit.
- 2026-07-18T00:00:00Z - U04 NFR Design treats sign-out as auth-owned server behavior; shell initiates `POST /api/auth/sign-out` and acceptance depends on cookie deletion, protected-route reauth, and BFF stale-call containment evidence.
- 2026-07-18T00:00:00Z - U05 NFR Design treats `/bookings*` compatibility as fixed deterministic routing into canonical `/booking*` shell routes, with prior-work preservation proven by evidence-time diff review rather than runtime code.
- 2026-07-18T00:00:00Z - U06 NFR Design treats final acceptance as a parseable evidence contract; W2-01 PASS requires all scenarios and commands green, while any runtime, scenario, detector, or audit failure becomes a W2-01 BLOCKED record with a concrete blocker id.

## Deviations

- 2026-07-18T00:00:00Z - No caching, CDN, autoscaling, or circuit-breaker library is selected for U01 because the walking skeleton is a single read path with an existing 2500 ms BFF timeout and no new runtime services allowed.
- 2026-07-18T00:00:00Z - U01 architecture review iteration 1 returned NOT-READY because W0-01/W0-02/W1-01/W2-02 preservation boundaries were implicit. The NFR design was patched to name each prior-work boundary explicitly.
- 2026-07-18T00:00:00Z - No queue, authorization cache, background worker, or new runtime service is selected for U02 because the intent proves one local create/detail path and must preserve booking-service-owned persistence and idempotency.
- 2026-07-18T00:00:00Z - No policy-admin UI, authorization cache, or repeated deny polling is selected for U03 because this vertical unit proves a deterministic deny fixture, not a policy-management product.
- 2026-07-18T00:00:00Z - No parallel logout path, client session library, shared stale-call cache, or automatic reauth loop is selected for U04 because the existing auth route and request-scoped BFF guard already provide the required boundaries.
- 2026-07-18T00:00:00Z - No route database, backend prefetch, W4-01 migration surface, or runtime preservation checker is selected for U05 because compatibility must remain a cheap static alias and preservation is an auditable delivery artifact.
- 2026-07-18T00:00:00Z - U05 architecture review iteration 1 returned NOT-READY because routing mechanism, query allowlist, route edge cases, and per-route PASS evidence were ambiguous. The design was patched to select shell-owned Next.js redirects, name query rules, define precedence/malformed-input handling, and require per-route evidence.
- 2026-07-18T00:00:00Z - U05 architecture review iteration 2 returned NOT-READY because detail query handling, malformed-id outcome, and encoded value handling still allowed implementation choices. The design was patched to drop all detail query parameters, return shell 404 for malformed ids before redirect/backend access, and require decode-once/re-encode behavior for valid encoded values.
- 2026-07-18T00:00:00Z - No new evidence runtime service, managed observability platform, cloud acceptance path, or screenshot-only substitute is selected for U06 because final proof must be local, finite, command-backed, and reviewable.

## Tradeoffs

- 2026-07-18T00:00:00Z - U01 prioritizes fail-closed identity correctness over graceful content fallback; fake empty Booking data would hide the exact actor propagation risk this Bolt is meant to prove.
- 2026-07-18T00:00:00Z - U02 prioritizes create/detail consistency over partial success; a created Booking that cannot be loaded at `/booking/[id]` fails acceptance instead of being masked with submitted form state.
- 2026-07-18T00:00:00Z - U03 prioritizes explicit denied UX over concealing unauthorized access; a visible denied state is more honest and testable than hiding navigation or returning an empty success.
- 2026-07-18T00:00:00Z - U04 prioritizes server-recognized session termination over immediate client polish; client-visible signed-out UI is insufficient unless `lc_session` is cleared and protected routes re-check authentication.
- 2026-07-18T00:00:00Z - U05 prioritizes canonical-route ownership over legacy-route cleverness; old routes resolve first, then canonical routes own auth/session/actor and Booking data loading once.
- 2026-07-18T00:00:00Z - U06 prioritizes honest BLOCKED outcomes over partial PASS claims; missing runtime proof, detector hits, audit failures, or unparseable evidence are blockers instead of evidence gaps to summarize away.

## Open questions

- 2026-07-18T00:00:00Z - Code generation should confirm whether the shell adapter can reuse `safeSessionSummary` directly or needs a wrapper that disables implicit `local-user` for protected shell paths.
- 2026-07-18T00:00:00Z - Code generation should confirm the existing identity-service authorization timeout seam for booking-service create and record any W2-01-specific timeout constant it introduces.
- 2026-07-18T00:00:00Z - Code generation should confirm where the Booking BFF maps backend 403/deny into the shell denied state so it cannot be mistaken for an empty list.
- 2026-07-18T00:00:00Z - Code generation should confirm every in-scope Booking BFF fan-in (`proxyBooking`, `loadBookings`, `loadBooking`) resolves actor before `serviceHeaders` and records no-backend-fetch evidence for stale calls.
- 2026-07-18T00:00:00Z - Code generation should confirm whether `/bookings*` compatibility is best implemented in Nginx config or Next.js routing for the current repo, while preserving the same fixed route map and proof evidence.
- 2026-07-18T00:00:00Z - Code generation should confirm exact command strings for detector 6d, `erp-fidelity-audit`, and `aidlc-audit` so U06 command entries can capture reproducible commands and exit codes.

# Logical Components - U02 Charge Domain Routing and BFF

## Purpose and upstream inputs

This inventory bridges U02 into Infrastructure Design while preserving the
existing Wave A edge. It consumes `performance-requirements.md`,
`security-requirements.md`, `scalability-requirements.md`,
`reliability-requirements.md`, `tech-stack-decisions.md`, and
`business-logic-model.md`. Every component is inside an existing deployable or
an existing external dependency; none authorizes new production topology.

## Component inventory

| Component | Existing boundary | Responsibility/resource bound | Failure isolation |
| --- | --- | --- | --- |
| nginx Charge locations | existing nginx | exact 308 and path-preserving `/charge-agreements/` proxy | Charge config cannot alter existing root/Auth/Reference/Booking locations |
| Next base-path/runtime | `apps/charge-agreements` | emit base-path HTML/assets/handlers; server-only session boundary | no new app/shell/navigation/asset prefix |
| startup config guard | Charge Next process | validate secrets, fixed origins/public-origin allowlist, base path, bypass posture | process stays alive only for exact UP/DOWN health; invalid protected routes return configuration 503 without forwarding |
| session/request context | Charge Next server | `@erp/auth`, exact capabilities, safe return URL/correlation | no client cookie decode or browser authority |
| compile-time policy registry | Charge Next server | literal method/path/capability/media/body/timeout/replay policy | adding a route requires code and matrix test; no generic proxy |
| request validator | Charge Next server | same-origin, schema/query/ID/UUID, 32 KiB decoded limit | rejects before permit/backend call |
| protected-request admission | Charge Next server | 20 permits acquired before body read and held through delivery/cancel; 100 ms admission, 2500 ms backend, 5 s egress | bounds parsing and slow-client retention; overload typed 503 |
| internal subject assertion | Charge Next server | issue 30-second method/path/correlation-bound HMAC assertion from signed session using dedicated secret | no browser authority or token exchange; U03 verifies before authorization |
| bounded forwarder | Charge Next server | one native-fetch call, fixed origin/path/headers, no-store, abort | backend failure cannot become fallback success |
| response normalizer | Charge Next server | 512 KiB decoded limit+1; 16 MiB measured parsed-graph/24 MiB admission ceilings; safe envelope | malformed/oversized/provider secrets discarded; 20 admissions <=480 MiB +64 MiB runtime margin |
| Reference selector forwarder | Charge Next server | separate 10 permits/100 ms wait/2000 ms deadline; 128 KiB response, query 128, options 50, label 256 | selector load cannot starve domain forwarding or authorize a command |
| route-state compositions | Charge-owned app routes | loading/error/not-found/denied using existing primitives/tokens | no `packages/ui`, shared shell/nav/type/palette change |
| Charge domain services | existing external service boundary | authoritative Rate/Agreement/manual operations and authorization | BFF has no commercial authority/database |
| Auth/Identity/Reference Data | existing platform dependencies | session, service authorization, selector labels | fixed adapters/credentials; no browser-direct call |
| telemetry/evidence driver | existing telemetry plus test process | parent/child spans, resource/route/security evidence | redacted; no new observability platform/deployable |

## Interaction and ownership

Nginx preserves the complete base-path request to Next. A protected handler
selects a literal policy, creates signed-session context, checks the exact
capability, acquires admission before consuming/validating the body, forwards
one fixed backend request, consumes one bounded response stream, normalizes the
envelope, and releases admission only after delivery/cancellation/egress
timeout. The backend independently authorizes and owns state.

U02 owns nginx/base-path/BFF/session/correlation/error and Charge route-state
seams. U01/U03/U04 own domain behavior and service authorization. W2-02 owns
shared UI and shell surfaces. Manual-case disclosure is a separate explicit
policy. Booking never reads Charge storage, and the browser never calls domain
or platform services directly.

## Failure domains and shared resources

| Failure | Blast radius | Containment |
| --- | --- | --- |
| invalid Charge config | one Charge Next process | startup unready/minimal 503; nginx/other apps unchanged |
| session/capability failure | one protected request | no backend call or protected metadata |
| semaphore saturation | new protected forwards in that process | 100 ms bound then typed 503; in-flight work continues |
| slow/bad Charge response | one request plus one permit until abort | 2500 ms and 512 KiB limit; safe normalized error |
| Charge process restart | Charge web/BFF requests | stateless restart; health+protected read <=120 s locally |
| nginx Charge rule defect | Charge mount | exact/deep-link/asset and preservation matrix block release |

The 20-permit semaphore and bounded body areas are process-local and recreated
on restart. Signed session validation, policies, and replay-key derivation are
deterministic, so no affinity/shared BFF store is required.

## Infrastructure handoff and evidence ownership

Infrastructure Design configures the existing Next app/nginx/Compose service:
base path, healthcheck, fixed origins/secrets, process environment, and exact
Charge locations. It must not add a public backend port, service, network,
volume, cache, broker, gateway, database, cloud resource, or manager-8088
control. Isolated acceptance remains wrapper-only `linercore-wave-a` on 18088.

Unit/component tests own policy, session, bounded stream, normalization,
statelessness, and route-state behavior. U06 owns live nginx/Compose, manager
guards, Playwright, correlation, Booking-visible pricing, audits, and fidelity
evidence. The original W1 blocked/waived artifact remains unchanged and separate;
green W2-03 evidence never converts it to PASS.

## Verification allocation

The BFF overhead driver proves the exact route mixes and resource bounds.
Security matrices prove no open proxy, spoofed authority, or disclosure.
Two-process tests prove no affinity. Nginx probes prove path/preservation. Live
status remains unobserved until U06; source or health checks are not substitutes.

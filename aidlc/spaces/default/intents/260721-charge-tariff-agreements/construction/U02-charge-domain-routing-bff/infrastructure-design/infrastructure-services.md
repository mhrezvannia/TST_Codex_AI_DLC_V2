# Infrastructure Services - U02 Charge Domain Routing and BFF

## Service map

| Existing service | U02 use | Explicit exclusion |
| --- | --- | --- |
| nginx | exact redirect and path-preserving Charge proxy | no shared-shell rewrite, generic gateway, or manager control |
| Charge Next.js app | pages, route handlers, signed session, fixed policy registry, bounded forwarding | no commercial database or fallback authority |
| Auth package/app | signed `lc_session`, safe return URL | no browser cookie decode or new identity system |
| Charge service | authoritative Rate/Agreement/manual operations | no generic proxy path or browser-direct credential |
| Reference Data | bounded selector labels | no command authority or copied master data |
| Identity | backend independent authorization | BFF permission is not service authorization |
| observability stack | safe metrics/logs/traces | no new monitoring deployable |

U02 adds no PostgreSQL schema, cache, queue, search engine, topic, object store,
CDN, service registry, or durable BFF state.

## Nginx and Next configuration

Next sets exactly `basePath: "/charge-agreements"` and no asset prefix. nginx
adds only:

- exact `/charge-agreements` -> 308 slash redirect;
- `^~ /charge-agreements/` -> `apps-charge-agreements:3000` with no proxy URI
  suffix;
- host/protocol/correlation diagnostic headers that cannot expand public-origin
  authority.

The Charge app healthcheck targets
`http://127.0.0.1:3000/charge-agreements/api/health`. nginx retains its existing
dependency. Tests cover HTML, deep links/reloads, `/_next` assets under the base
path, BFF handlers, health, and all existing routes.

## BFF admission and bounded transport

One process-wide semaphore owns 20 protected-request permits. A request:

1. selects a compile-time route policy;
2. resolves signed session/capability;
3. acquires within 100 ms before body consumption;
4. validates at most 32 KiB actual decoded UTF-8;
5. performs exactly one fixed-origin native `fetch` within the remaining
   2500 ms deadline;
6. consumes at most 512 KiB into limit+1 storage, decodes UTF-8 fatally, parses
   and normalizes once;
7. holds the permit until delivery close/cancel/error or five-second egress
   timeout.

There is no `request.json()`, `response.json()`, unbounded `.text()`, clone,
redirect follow, automatic mutation retry, queue, cached commercial response,
or per-request client pool.

Reference selectors use a separate 10-permit semaphore, 100 ms wait, 2000 ms
deadline, 128 KiB response, query <=128 characters, <=50 options, and label
<=256 characters. Selector load cannot consume domain-forwarding permits.

## Session, assertion, and secret services

`@erp/auth` is the only session parser. Route policies bind literal method,
path builder, capability, access class, media, size, timeout, and replay
posture. Mutation Origin must equal the startup-normalized loopback public
origin. Browser actor/role/capability/service headers are replaced, not merged.

For U03 vendor-media policies, the BFF issues the exact versioned
`X-LinerCore-Subject-Assertion` envelope defined in
`deployment-architecture.md`: fixed-order UTF-8 byte-length fields, strict
base64url, key ID, HMAC-SHA-256, 30-second validity, five-second skew, and a
128-bit nonce. The secret is injected only into the BFF and Charge backend
verifier. A startup guard rejects missing, weak, or session-secret reuse.

U03 verifies exact bytes/context in constant time, then atomically claims the
nonce in a 4096-entry process-local map until `exp+5`. Duplicate fails 401;
capacity exhaustion fails 503. The single-process Wave A/restart residual is
documented and blocks extrapolation to production or multi-instance topology.
U03 independently authorizes; the assertion is not a token exchange or browser
credential. Shared cross-language golden vectors are blocking.

## Service discovery and configuration registry

Compose DNS supplies the only backend origins. The route registry contains no
runtime/browser URL. Configuration is a closed typed registry:

| Class | Required validation |
| --- | --- |
| base/public origin | exact `/charge-agreements`; one loopback HTTP origin for Wave A |
| Charge origin | fixed `http://charge-agreement-service:8084`; no path/query/fragment |
| Reference origin | fixed `http://reference-data-service:8083`; no path/query/fragment |
| session/assertion/reference secrets | present, nonblank, distinct where required, never exposed |
| resource bounds | exact approved values; invalid/overflow values fail configuration |
| bypass/debug flags | absent/false in Wave A |

Invalid configuration leaves only minimal health available and makes every
protected route return safe 503 without forwarding.

## Error and response services

The normalizer allows only the approved status set and closed safe error fields.
Oversize, invalid UTF-8, malformed JSON, unexpected content type, unsafe
provider content, abort, transport, and timeout map to exact safe 503 classes.
Provider bodies, stack/SQL/URL text, cookies, tokens, subjects, customer data,
amounts, and raw queries never cross the browser/log/evidence boundary.

Reads use `no-store`. Mutation idempotency keys are derived only for policies
whose downstream endpoint recognizes them; otherwise lost-response recovery is
an authoritative read plus optimistic/invariant reconciliation.

## Capacity and cost

The Wave A Charge-app override supplies 768 MiB container memory, 512 MiB old
space, and 8 MiB semi-space so diagnostics survive beyond the evidence gate.
Acceptance still enforces <=432 MiB heap-used, <=48 MiB Node `external`
(including `arrayBuffers`),
<=64 MiB remaining native, and <=544 MiB RSS at 20 admissions. No additional
service cost is introduced. A later scale-out design must preserve stateless
policies/secrets, per-process permits, no affinity, security, observability, and
consistent overload behavior and requires separate production evidence.

## Upstream traceability

This service design consumes `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`. It preserves
their fixed route registry, separate selector capacity, internal assertion,
safe normalization, no durable BFF state, and domain/service ownership.

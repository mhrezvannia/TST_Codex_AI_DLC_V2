# Security Design - U02 Charge Domain Routing and BFF

## Trust boundaries and upstream basis

This design realizes `security-requirements.md` under the performance,
capacity, and recovery constraints in `performance-requirements.md`,
`scalability-requirements.md`, and `reliability-requirements.md`. It follows
`tech-stack-decisions.md` and `business-logic-model.md` without creating a
second commercial or authorization authority.

The browser, nginx, Charge Next.js server/BFF, Charge domain service, Auth,
Identity, and Reference Data are distinct trust boundaries. The browser may
supply validated domain values and a deliberate request UUID only. It cannot
select host/path/media, actor, role, capability, service identity/token, or
correlation authority.

## Internal subject assertion

For U03 vendor-media policies, the BFF converts the validated `lc_session`
subject into a single-request assertion and never forwards the cookie or accepts
assertion fields from the browser. It canonicalizes issuer
`charge-agreements-bff`, actor subject, method, normalized fixed backend path,
correlation, issued-at, expiry at +30 seconds, and a random 128-bit nonce, then
HMAC-SHA-256 signs with dedicated `CHARGE_BFF_ASSERTION_SECRET`.

The secret is required in non-local readiness and shared only with U03 through
Compose configuration. There is no token exchange endpoint, OAuth minting flow,
browser token, or reuse of `AUTH_SESSION_SECRET`. U03 verifies signature, time,
issuer, method/path/correlation, and nonce before independent authorization.

## Session and capability enforcement

Server pages and route handlers reconstruct the signed `lc_session` only through
`@erp/auth`. Invalid HTML requests redirect through `safeReturnUrl` constrained
to `/charge-agreements` and 2048 characters. Invalid BFF requests return exact
401 JSON and make no backend call.

Each route selects one compile-time `ChargeRoutePolicy` with literal method,
path builder, exact resource/action capability, access class, body/media mode,
timeout, response limit, and replay posture. Capability denial is 403 before
record lookup/forwarding and discloses no protected metadata. Manual evidence
requires `charge-manual-cases:read`; generic Rate/Agreement read is insufficient.
The backend receives server-derived context and independently authorizes.

## Request and open-proxy defenses

Mutation handlers require `Origin` to equal one exact value in the startup-
validated `CHARGE_PUBLIC_ORIGINS` allowlist. Each configured value normalizes
to an HTTPS origin tuple, or explicit HTTP localhost/loopback for local
acceptance, and rejects credentials, path, query, or fragment. Handlers then
require JSON media, both
declared and actual decoded size <=32 KiB, exact Zod schema, canonical UUID
client request ID, and no unknown authority field. Identifiers are decoded once,
length/character validated, then encoded into a fixed path builder. Query keys
are allowlisted and duplicate scalars rejected.

Nginx forwarded host/protocol are diagnostic only and never origin authority;
an arbitrary client `Host` cannot expand the allowlist. Server-created headers
replace all browser `X-LinerCore-*`, actor, service,
token, capability, and correlation-authority input. Backend origins come only
from validated startup configuration. Default JSON and U03 vendor media are
policy constants. Redirect following is disabled for protected forwarding, so
no response can turn a fixed policy into an open proxy.

## Bounded response and safe errors

The response normalizer checks declared length, then counts decoded bytes in a
bounded limit+1 stream area. Above 512 KiB, invalid UTF-8, malformed 2xx/non-2xx
JSON, unexpected content type, or structurally unsafe content becomes exact 503
`CHARGE_REQUEST_FAILED`; provider content is discarded. Abort/transport/deadline
is exact 503 `CHARGE_SERVICE_UNAVAILABLE`.

Only allowlisted status/code/message/field-path values and bounded retry seconds
survive normalization. SQL, stack, URL, exception text, cookies, tokens,
subjects, customer/Booking data, commercial amounts, and raw bodies are never
returned or logged. A provider failure never becomes HTTP 200 skeleton data.

## Backpressure, secrets, and readiness

The 20-permit semaphore has a 100 ms wait inside the 2500 ms total deadline.
Exhaustion fails before forwarding. There is no automatic mutation retry or
commercial fallback. Read retry remains an explicit caller action.

Startup validation checks mandatory non-local session/service secrets, fixed
Charge/Reference origins, nonempty exact `CHARGE_PUBLIC_ORIGINS`, exact base
path, and forbidden bypass configuration. Invalid configuration keeps the
process alive only to report unready: protected pages/routes fail closed with
503 `CHARGE_CONFIGURATION_INVALID` and never forward.

Health always returns `Content-Type: application/json; charset=utf-8`. Healthy
is HTTP 200 with exactly `{"service":"apps-charge-agreements","status":"UP","timestamp":"<UTC ISO-8601>"}`.
Invalid configuration is HTTP 503 with exactly the same three fields and
`status:"DOWN"`; no fourth/detail field is permitted. Direct-container and
nginx paths expose identical content type, schema, fixed values, status mapping,
and ISO timestamp rule (the timestamp naturally differs per request). Healthy
probes are process-local and never call downstream services.

Reference selector calls use a separate 10-permit semaphore, 100 ms permit
wait, 2000 ms total deadline, 128 KiB decoded response limit, query <=128
characters, at most 50 returned options, and labels <=256 characters. They do
not consume the 20 Charge-forwarding permits or disclose command authority.

## Audit and verification

Correlation is accepted only in its safe 1-128 character grammar or replaced,
then echoed and propagated without granting authority. Logs permit timestamp,
app/route/operation/outcome/status class, correlation, elapsed time, byte counts,
and permit wait. Subjects, tokens, queries, bodies, business IDs/values, and
exception text are prohibited. Metrics use bounded route/operation/outcome
dimensions only.

Proof covers session/capability/spoofing, cross-origin/media/body/query/path,
open-proxy, slow/oversized/malformed streams, configuration/bypass, redaction,
and dependency/security scans. No changed-code Critical/High finding is silently
waived.

This artifact explicitly consumes `performance-requirements.md`,
`security-requirements.md`, `scalability-requirements.md`,
`reliability-requirements.md`, `tech-stack-decisions.md`, and
`business-logic-model.md`.

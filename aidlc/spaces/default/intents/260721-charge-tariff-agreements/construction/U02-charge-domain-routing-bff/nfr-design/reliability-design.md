# Reliability Design - U02 Charge Domain Routing and BFF

## Reliability boundary and upstream basis

The Charge BFF owns no commercial data and therefore has no data RPO. This
design realizes `reliability-requirements.md` using the controls in
`performance-requirements.md`, `security-requirements.md`, and
`scalability-requirements.md`, the brownfield `tech-stack-decisions.md`, and the
route/session model in `business-logic-model.md`.

Reliability means exact base-path routing, fail-closed access, bounded
forwarding, safe errors, stateless restart, and honest reconciliation. It does
not establish a production availability SLA or fallback authority.

## Route and configuration reliability

Next `basePath` is exactly `/charge-agreements`. Nginx exact root returns 308 to
the slash form; its `^~` prefix location uses `proxy_pass` without a URI suffix,
preserving HTML, deep-link, route-handler, and asset paths. Existing root/Auth/
Reference/Booking locations have a before/after regression matrix.

Startup validates signed-session and service secrets, fixed backend origins,
the exact public-origin allowlist, base path, and forbidden bypass mode. Invalid
mandatory configuration keeps the process alive solely to report unready;
protected pages/routes return 503 `CHARGE_CONFIGURATION_INVALID` without
forwarding.

Health content type is exactly `application/json; charset=utf-8`. HTTP 200 body
has only `service:"apps-charge-agreements"`, `status:"UP"`, and a UTC ISO-8601
`timestamp`; HTTP 503 has the identical three-field schema with `status:"DOWN"`.
Direct and nginx paths have identical schema/content-type/status semantics and
fixed values; timestamps vary only because each request is generated afresh.
Neither response reveals dependency, session, secret, commercial, or runtime-
internal detail, and no healthy probe calls a downstream.

## Forwarding failure behavior

The 20-permit admission semaphore is acquired before body consumption and held
through browser delivery/cancellation. The 100 ms admission, one backend call,
2500 ms backend, and five-second egress deadlines bound slow-client retention.
All paths release permits and abort streams on close/cancel/error. No automatic
mutation retry, cached response, queue, or 200
skeleton fallback exists.

| Failure | Reliable outcome and recovery |
| --- | --- |
| invalid session/capability | 401/403 before backend; establish session/grant |
| origin/media/body/query/path invalid | 403/415/413/400 before backend; correct then deliberate resubmit |
| permit/deadline/transport | safe 503 unavailable; explicit read retry or mutation reconciliation |
| malformed/oversized/unsafe backend | safe 503 request-failed; bounded abort and backend repair |
| allowed domain error | preserve status and normalized safe fields; domain-specific refresh/correction |
| stop before forwarding | no downstream effect; explicit retry |
| stop/lost response after mutation | do not infer failure or replay; read authority/receipt first |

## Idempotency and correlation

Reads use `no-store` and are deliberately repeatable. A mutation policy derives
an opaque SHA-256 key only from signed subject, literal route, stable target or
new marker, expected version or marker, and canonical deliberate UUID. The BFF
does not claim durable replay unless the downstream service persists and
recognizes that key. Otherwise optimistic version/state/uniqueness plus
authoritative read reconciliation are the safety controls.

One safe correlation ID joins browser response, BFF access decision, fixed
backend span/request/response, downstream authorization, and activity or
no-write evidence. A correlation mismatch invalidates performance/evidence; the
ID never authorizes or becomes a metric label.

## Restart and preservation proof

The isolated wrapper restarts the existing Charge app and waits no more than
120 seconds for minimal health plus one authenticated protected read. Route
policy, session result, base path, correlation, and request-key derivation are
identical across two processes. The bound is local acceptance, not an SLO.

U06 probes existing `/`, `/auth`, `/reference-data`, `/booking`, and `/bookings`
before/after and uses `npm run demo:guard` before/after. Only
`linercore-wave-a` at 18088 is controlled; manager 8088 is probe-only.

The original W1 blocked/waived artifact remains unchanged and explicitly
non-PASS. W2-03 route/live/audit evidence is retained separately and cannot
relabel historical W1 evidence. DS-02/DS-03 and live Docker status likewise
remain explicit until their owning proof exists.

## Observability and validation

Metrics/logs cover bounded route/operation/outcome/status, overhead,
permit wait/exhaustion, deadline, bytes, event-loop, sockets, and memory without
subjects, IDs, correlation labels, bodies, values, or secrets. Exact/prefix
nginx, assets, failure rows, two-process statelessness, restart, preservation,
and redaction tests are blocking. A green health response alone is never proof
that protected forwarding works.

This artifact consumes `performance-requirements.md`,
`security-requirements.md`, `scalability-requirements.md`,
`reliability-requirements.md`, `tech-stack-decisions.md`, and
`business-logic-model.md`.

# U02 Charge Domain Routing/BFF

U02 owns the Charge-local BFF policy and its `/charge-agreements` edge route. It does not own the
shared shell, `packages/ui`, Booking, or database migrations.

## Runtime configuration

The Charge app requires fixed `CHARGE_AGREEMENT_SERVICE_URL` and
`REFERENCE_DATA_SERVICE_URL` origins; `CHARGE_SERVICE_TOKEN`,
`REFERENCE_DATA_BFF_SERVICE_ID`, and `REFERENCE_DATA_BFF_TOKEN`; distinct
`AUTH_SESSION_SECRET` and `CHARGE_BFF_ASSERTION_SECRET`; a bounded
`CHARGE_BFF_ASSERTION_KID`; and an explicit `CHARGE_PUBLIC_ORIGINS` allowlist.
The fixed numeric settings are `CHARGE_BFF_PROTECTED_PERMITS=20`,
`CHARGE_BFF_REFERENCE_PERMITS=10`, `CHARGE_BFF_PERMIT_WAIT_MS=100`,
`CHARGE_BFF_DEADLINE_MS=2500`, `CHARGE_REFERENCE_DEADLINE_MS=2000`,
`CHARGE_BFF_EGRESS_DEADLINE_MS=5000`, `CHARGE_BFF_REQUEST_BODY_BYTES=32768`,
`CHARGE_BFF_RESPONSE_BYTES=524288`, and `CHARGE_REFERENCE_RESPONSE_BYTES=131072`.
The backend verifier receives the same assertion secret/KID plus
`CHARGE_BFF_ASSERTION_REPLAY_CAPACITY=4096`.

Local fallbacks are developer conveniences, not acceptance evidence. Non-local missing, malformed,
equal, wildcard, or bypass configuration fails readiness and protected forwarding closed.

The direct health path is
`http://apps-charge-agreements:3000/charge-agreements/api/health`; through nginx it is
`http://127.0.0.1:18088/charge-agreements/api/health`. Health reports only service, status, and
timestamp and never probes dependencies.

## Fixed policy and security behavior

Browser inputs cannot select a downstream host, path, method, media type, service identity,
capability, or actor. Agreement routes use the vendor media contract and a signed subject
assertion; existing Rate routes retain their isolated JSON/actor compatibility adapter. Manual-case
read is a separate capability and authorization occurs before lookup. Request and response streams,
queries, identifiers, media types, origins, deadlines, permits, and error fields are bounded.

The verifier replay cache is process-local. A restart forgets prior nonces, so this is explicitly a
local single-process limitation, not a production replay/SLO claim. Measured performance, Docker
acceptance, integrated shell DS-02/DS-03, and live Wave A behavior remain unobserved until their
dedicated evidence gates run.

## Rollback

Redeploy the prior Charge app, nginx, and Compose revision together. Restore the previous
`rate-proxy.ts` compatibility behavior and remove only U02 routes, configuration, and assertion
wiring. Retain all U01 code, data, and V1–V4 migrations. Do not run a down migration or destructive
database reset.

After rollback, probe existing Rate API/UI plus `/`, `/auth`, `/reference-data`, `/booking`, and
`/bookings`. If assertions were emitted, rotate or remove the dedicated U02 assertion secret from
issuer and verifier together; never roll one side independently.

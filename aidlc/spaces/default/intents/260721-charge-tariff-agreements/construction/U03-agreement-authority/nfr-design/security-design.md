# Security Design - U03 Agreement Authority

## Trust boundary and authorization

The browser trusts only the authenticated Charge BFF. The ingress proxy removes
all browser-supplied `Authorization`, `X-Actor-*`, `X-Subject-*`,
`X-Service-*`, role, capability, and forwarded-identity headers before the BFF.
The BFF derives the human subject from the signed same-origin `lc_session` and
fixes Agreement media to
`application/vnd.linercore.charge-agreement-v2+json`.

There is no OAuth exchange or independently issued JWT. U02 sends exactly one
`X-LinerCore-Subject-Assertion` header:
`v1.<kid>.<payload-base64url-no-pad>.<signature-base64url-no-pad>`.
Duplicate/folded/comma-joined headers fail. The payload is the exact fixed-order
UTF-8 byte-length record defined by U02 Infrastructure Design for issuer, key,
subject, method, normalized path, correlation, issued-at, expiry and nonce.
Wave A key ID is `w2-03-wave-a-v1`; expiry is issued-at +30 seconds; allowed
clock skew is five seconds. The signature is HMAC-SHA-256 over the compact
prefix using dedicated `CHARGE_BFF_ASSERTION_SECRET`.

U03 strictly decodes the same bytes, rejects unknown/missing/trailing fields,
validates issuer/key/method/path/correlation/time, and compares the signature in
constant time. It then atomically claims `<kid>:<nonce>` in a 4096-entry
process-local map until `exp+5`. Duplicate is 401 and capacity exhaustion is
safe 503. Restart clears the cache, so local single-instance replay remains
possible only inside the residual <=35-second window; no production or multi-
instance single-use claim is made. Expected row versions, authority locks and
constraints remain additional mutation fences.

TypeScript issuer and Java verifier consume the same checked-in
`contracts/security/charge-subject-assertion-v1.json` schema
`linercore.charge-subject-assertion-vectors/v1`, including 4096/4097/expiry
occupancy cases. Missing/malformed assertion, key or secret fails
readiness/authorization closed. The secret is provisioned directly to U02 and
U03 by Compose; no runtime token service or exchange endpoint exists.

The BFF never forwards browser-selected actor, role, capability, service
identity, assertion fields, or media policy. The Charge service independently
authorizes the validated subject against exact resource `charge-agreements`.

| Operation | Exact action | Disclosure/mutation guard |
| --- | --- | --- |
| search/detail/history | `read` | authorize before lookup or existence disclosure |
| create first Draft | `create` | deny before reference/rate validation or writes |
| replace Draft | `update` | exact aggregate/version and optimistic row version |
| approve Draft | `approve` | authority lock, post-lock revalidation, no implicit replacement |
| create successor | `create-successor` | Approved W2 source and stable-header lock |
| terminal transition | `suspend` or `expire` | exact Approved version and expected row version |

The default is deny. Missing/invalid browser session is BFF 401; trusted exact
DENY is 403; Identity transport, timeout, or malformed response is typed 503.
Legacy `actor` inputs remain parseable only in the legacy compatibility adapter
and never authorize or become provenance.

## Media and adapter isolation

The controller selects one adapter before parsing domain fields:

- default `application/json` uses the exact LEGACY grammar and LEGACY-only
  repositories;
- exact W2 vendor media uses the versioned administration grammar, may expose
  LEGACY only as explicitly read-only history, and restricts commands/candidates
  to `W2_VERSIONED`;
- unsupported response/request media returns 406/415 without trying the other
  adapter.

No 404, denial, validation error, or malformed body triggers adapter fallthrough.
Default-media tests prove W2 headers cannot leak through the compatibility
projection. Vendor-media tests prove LEGACY cannot become command or pricing
authority.

## Input, persistence, and concurrency controls

- Bind typed command DTOs with an allow-list of fields; reject unknown W2 query
  parameters, malformed enums/dates/IDs, size outside 1-100, and reasons outside
  1-512 trimmed characters.
- Parameterize every SQL statement. Stable IDs cross service boundaries; labels
  are presentation only and cannot authorize or select persistence rows.
- Validate the five active Reference Data identities by exact set and validate
  three distinct RateVersion IDs in one Charge-owned query. Provider errors are
  safely translated without cross-record detail.
- Enforce stable/version ownership, W2 authority model, Draft-only mutation,
  optimistic row version, one Draft, exact link categories, foreign keys, and
  immutable Approved commercial fields in both application logic and database
  constraints where representable.
- Serialize approval with the canonical length-prefixed authority key and
  PostgreSQL advisory transaction lock, then execute the inclusive-overlap query.
  The lock/query is authoritative; no claim is made that a generic constraint
  alone encodes the range rule.
- Commit commercial rows, append-only activity, and outbox enqueue in the same
  Charge transaction. Any failure rolls all of them back.

## Data protection and secrets

Agreement terms, links, match fields, history, actors, correlations, and outbox
metadata remain internal/confidential. Existing platform TLS and service-owned
PostgreSQL/backup encryption controls are reused; U03 neither weakens them nor
invents an unverified production encryption service.

Non-local startup/readiness requires configured service credentials, fixed
trusted origins/subjects, database/migration readiness, and disabled local
bypass. Local tokens are explicit, least-privilege, profile-scoped fixtures.
Secrets, cookies, bearer/session tokens, service credentials, raw payloads, SQL,
and stack traces never enter logs, traces, evidence bundles, or browser errors.

## Browser and response protections

- Mutating BFF routes keep the established same-origin session and CSRF posture;
  browsers never call Charge service endpoints directly.
- Render every returned label/reason as text through React; do not inject HTML.
- Use existing LinerCore response headers and cookie flags. Any missing shared
  header/cookie control is a named integration dependency, not a Charge-local
  shell or `packages/ui` rewrite.
- Normalize provider failures to safe typed envelopes retaining only correlation
  and non-sensitive codes. Authorization runs before missing-resource mapping.

## Audit, logging, and metrics

One committed command records subject/service identity, action, safe stable and
version IDs, lifecycle result, UTC time, correlation, activity, event identity,
and dedupe key. Denial or rollback records no commercial/activity/outbox row.

Allowed structured fields are operation/action, lifecycle, outcome/code,
correlation, safe stable/version IDs, event type, elapsed time, and relay result.
Customer/lane/location/equipment, linked Rate IDs, validity dates, money, reason
text, payloads, credentials, and SQL are redacted. Metric labels are limited to
operation/action, lifecycle, outcome/status class, media dialect, and event type.

## Executable security proof

The blocking matrix covers allowed/denied actions; missing/spoofed subjects;
non-local bypass/missing secret; authorize-before-lookup; legacy actor spoofing;
wrong aggregate/version/link; stale and concurrent mutations; media confusion;
redaction; request/page/reason bounds; outbox rollback; and old/new Avro
compatibility. Release retains the requirement of no attributable open
Critical/High vulnerability without an explicitly accepted exception.

## Upstream trace

This design consumes `performance-requirements.md`,
`security-requirements.md`, `scalability-requirements.md`,
`reliability-requirements.md`, `tech-stack-decisions.md`, and
`business-logic-model.md`. It maps their identity, media, commercial authority,
transaction, redaction, compatibility, and fail-closed requirements to concrete
boundaries without broadening repository-wide security tooling.

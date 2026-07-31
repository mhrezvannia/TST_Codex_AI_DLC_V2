# Security Requirements - U02 Charge Domain Routing and BFF

## Scope and data classification

The BFF handles signed-session identity, internal/confidential commercial
requests, actor/correlation metadata, and service credentials. It holds no
commercial authority and persists none of that data. Existing platform TLS,
secret, cookie, and encryption controls remain authoritative; U02 invents no
compliance certification, retention rule, or browser-visible service secret.

## Authentication and authorization

| ID | Requirement and exact outcome |
| --- | --- |
| SEC-U02-001 | Missing, invalid, or expired signed session: page uses sanitized Charge-only Auth return URL; BFF returns 401 `CHARGE_AUTH_REQUIRED`, with no backend call. |
| SEC-U02-002 | Valid session without the exact route resource/action: 403 `CHARGE_ACCESS_DENIED`, no protected metadata, options, count, or backend call. |
| SEC-U02-003 | BFF permission is defense in depth only. The fixed backend receives server-derived actor/service context and independently authorizes every protected operation. |
| SEC-U02-004 | Browser actor, roles, permissions, capabilities, service token, actor/service headers, and correlation authority are ignored or rejected; compatibility DTOs are reconstructed from allowlisted fields. |
| SEC-U02-005 | Missing required non-local session/service secret or an enabled bypass causes configuration/readiness failure; it never degrades to allow. Backend timeout/transport is 503 `CHARGE_SERVICE_UNAVAILABLE`; structurally unsafe provider content follows SEC-U02-006. Neither becomes 403 or fallback success. |
| SEC-U02-006 | Malformed JSON with a 2xx status, malformed JSON with a non-2xx status, HTML/other non-JSON content, and any response exceeding 512 KiB each produce exact 503 `CHARGE_REQUEST_FAILED`; the BFF discards provider content and returns only its normalized safe envelope and correlation. |

Manual-case reads require exact `charge-manual-cases:read`; generic Charge/Rate/
Agreement read cannot disclose case existence, count, reason, Booking reference,
or correlation. Authorized record existence is checked only after authorization.

## Request and forwarding controls

- Each handler selects a compile-time route policy with fixed method, backend
  origin/path builder, capability, media, timeout, response bound, and replay
  mode. No request parameter or header selects a host, scheme, arbitrary path,
  service credential, `Accept`, or backend `Content-Type`.
- Browser mutations require exact same-origin semantics, JSON, a body <=32 KiB,
  valid schema, and no unknown authority field. Identifiers are decoded once,
  validated, and re-encoded. Query keys are allowlisted and scalar duplicates
  rejected.
- Default backend media is JSON. Every U03 Agreement policy uses the exact
  vendor media; only explicit LEGACY compatibility policies use JSON.
- Response JSON is bounded to 512 KiB. Malformed 2xx/non-2xx JSON, HTML or other
  non-JSON, and oversized responses are exact 503 `CHARGE_REQUEST_FAILED`;
  transport/deadline failure is exact 503 `CHARGE_SERVICE_UNAVAILABLE`. SQL,
  stack, URL, cookie, token, raw body,
  customer, and commercial amount data are never reflected.
- Safe correlation is validated or replaced and echoed, but never authorizes.
  A UUID client-request token is length-prefixed with server-derived context
  before hashing. Persistent replay is claimed only for a service policy whose
  downstream endpoint recognizes a durable receipt.

## STRIDE proof matrix

| Threat | Executable proof |
| --- | --- |
| spoofing/elevation | missing/tampered cookie, spoofed actor/capability/service headers, denied action, and non-local bypass tests |
| tampering/open proxy | unknown fields, traversal/encoded ID, duplicate query, arbitrary URL/path/media, cross-origin and wrong-media tests |
| repudiation | one safe correlation joins BFF decision, backend request, response, and downstream activity where a mutation commits |
| disclosure | denied/nonexistent manual case indistinguishable in protected data; malformed backend/log/trace redaction scan |
| denial of service | 32 KiB/512 KiB, 2500 ms, query/page/URL limits, slow stream abort, bounded concurrency/resource proof |

## Logging and release gates

Structured logs are limited to timestamp, level, app/service, route ID,
operation, outcome, safe code, correlation ID, elapsed milliseconds, and byte
counts. Subject, cookie, token, service credential, raw URL query/body/response,
customer, Booking reference, Rate/Agreement values, amount, and exception text
are prohibited. Metrics use bounded route ID/operation/outcome/status-class
dimensions; correlation and business identifiers are never labels.

Release requires the complete allow/deny/spoof/failure matrix, no changed-code
Critical/High vulnerability without an explicit accepted exception, secret and
redaction scans, and proof that no browser-direct service call or open proxy was
introduced.

## Upstream coverage

This artifact consumes `business-logic-model.md`, `business-rules.md`,
`requirements.md`, and `technology-stack.md`, making their signed-session,
compile-time-policy, service-authorization, safe-error, and data-boundary rules
testable without creating a second authority.

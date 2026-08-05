# Security Requirements - U04 Pricing Provider and Manual Cases

## Scope and classification

Pricing request context, customer/party and route identifiers, selected source
versions, unit rates/amounts/totals, receipt bytes, request hashes, case evidence,
service/human identities, and correlations are internal/confidential commercial
data. Existing transport, database/backup encryption, secret, and least-privilege
controls remain authoritative. U04 adds no public provider, certification,
retention period, or cross-database access.

## Service and human authorization

| ID | Requirement |
| --- | --- |
| SEC-U04-001 | `POST /pricing-requests` requires trusted service identity and exact existing permission `charge-agreement:price` before candidate reads or receipt writes. Browser principals and the removed default `booking-service` actor never authorize. |
| SEC-U04-002 | Exact Identity DENY is 403 with no candidate/receipt/case disclosure. Identity transport/timeout/malformed response is typed 503. Missing required non-local credential or enabled bypass fails readiness/configuration. |
| SEC-U04-003 | Manual list/detail requires a valid human session plus exact `charge-manual-cases:read` at BFF and service. Authorization precedes count/search/lookup; denial reveals neither existence nor totals. |
| SEC-U04-004 | Agreement/Rate read permission does not imply manual-case read. Pricing service permission does not grant human manual evidence UI access. |

The service creates its own subject/correlation context from trusted headers and
configured identity. Browser actor, role, capability, service token, correlation
authority, or manual-case identifier is ignored/rejected as authority.

## Input, replay, and data-integrity controls

- Media is exactly `application/vnd.api.v1+json`; schema, identifiers, positive
  integer quantities, nonnegative amendment, equal dates, lengths, booleans, and
  unknown fields are validated before claim as defined.
- `Idempotency-Key` exactly equals `bookingRef:amendmentSeq`. SHA-256 covers the
  canonical ordered body only. A changed body conflicts; a terminal identical
  body replays stored bytes without reauthorization bypass, re-resolution, or
  new case.
- Candidate repositories are internal fixed ports. They accept typed exact
  fields; no caller URL/SQL/order/tie-break selector exists. Agreement ambiguity
  cannot fall through to tariff and incomplete tariff cannot calculate.
- `BigDecimal`, USD/PER_CONTAINER/scale checks, ordered three-line invariant,
  independently rounded amounts, and total equality prevent money tampering or
  floating-point drift.
- Claim owner token/fence, request hash, lease deadline, transaction predicates,
  unique receipt/case keys, and atomic fenced completion prevent duplicate or
  stale-owner terminal writes.

## STRIDE proof matrix

| Threat | Executable proof |
| --- | --- |
| spoofing/elevation | missing/spoofed service and human identities, exact denied actions, missing secret, non-local bypass |
| tampering | changed body/key/hash/date, stale fence, source/link mismatch, wrong currency/scale/category, response-total invariant |
| repudiation | one correlation joins request, authorization, selected source IDs, terminal receipt, optional case, response and Booking handoff |
| disclosure | auth-before-query, denied/missing case, safe errors, no partial money, log/metric/trace/evidence redaction |
| denial of service | body/field/page/dependency/lease/pool bounds, fixed candidate queries, bounded receipt/case reads, contention/resource gates |
| replay confusion | byte-stable 200/404/422 replay, derived media, different-hash conflict, live-owner retry guidance, malformed legacy receipt 503 |

## Manual evidence minimization and observability

Manual APIs expose only OPEN evidence fields explicitly permitted by the
functional contract. They return no rates, unit values, amounts, totals,
customer label, assignment, notes, resolution, approval, close control, or
mutation link. Incomplete canonical backfill evidence stays nullable with
`legacyEvidence=true`; opaque snapshots are never parsed to invent data.

Logs may include operation, outcome/reason, basis, correlation, pricing request
ID, safe source version IDs, replay/conflict/in-progress flag, and elapsed time.
They exclude customer/party/booking context, raw request/hash, case snapshot,
unit rate, amount, total, token, cookie, credential, SQL, and exception payload.
Metrics use bounded outcome, basis, reason, replay, and operation dimensions;
record IDs/correlation/money are prohibited labels.

## Release gates and upstream coverage

The full service/human authorization, spoof, secret, non-local, input, receipt,
fence, case-disclosure, and redaction matrices are blocking. Changed production
code/dependencies have no open attributable Critical/High vulnerability without
an explicit accepted exception. Provider/consumer fixtures prove additive v1
compatibility and numeric JSON types.

This artifact consumes `business-logic-model.md`, `business-rules.md`,
`requirements.md`, and `technology-stack.md`; it creates no manual workflow,
shared UI authority, or alternate pricing endpoint.


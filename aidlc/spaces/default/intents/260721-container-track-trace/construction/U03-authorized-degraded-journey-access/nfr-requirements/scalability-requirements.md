# Scalability Requirements - U03 Authorized Degraded Journey Access

## Source Alignment

This bounded contention model derives from U03 `business-logic-model.md`,
`business-rules.md`, `requirements.md`, and the existing
`technology-stack.md`; it adds no production capacity forecast.

## Mixed Authorization Isolation Proof

Run this exact 10-request concurrent, run-scoped matrix for one protected
journey; each row has a distinct correlation ID and fresh subject/session:

| # | Subject/route | Dependency/decision | Expected result | Lookup/audit/CMM effect |
|---|---|---|---|---|
| 1 | EQUIPMENT_CONTROL GET list | Identity ALLOW, Reference fresh | 200 ready/fresh | list lookup; no audit or CMM row |
| 2 | EQUIPMENT_CONTROL GET detail | Identity ALLOW, Reference fresh | 200 ready/fresh | detail lookup; no audit or CMM row |
| 3 | CUSTOMER_SERVICE GET booking lookup | read ALLOW, capture hint DENY, Reference fresh | 200 ready/fresh, capture disabled | booking lookup; no denial audit/CMM row |
| 4 | CUSTOMER_SERVICE GET detail | read DENY | 403 `CMM_AUTHORIZATION_DENIED` | no lookup; exactly one denial audit; no CMM business row |
| 5 | CUSTOMER_SERVICE GET list | read DENY | 403 `CMM_AUTHORIZATION_DENIED` | no lookup; exactly one denial audit; no CMM business row |
| 6 | EQUIPMENT_CONTROL GET list | Identity unavailable | 503 `IDENTITY_DEPENDENCY_UNAVAILABLE` | no lookup; log/metric only; no CMM row |
| 7 | EQUIPMENT_CONTROL POST capture | Identity unavailable | 503 `IDENTITY_DEPENDENCY_UNAVAILABLE` | no lookup/idempotency; log/metric only; no CMM row |
| 8 | EQUIPMENT_CONTROL GET detail | Reference unavailable after read ALLOW | 200 ready/last-known, capture disabled | detail lookup; no denial audit/CMM row |
| 9 | EQUIPMENT_CONTROL POST capture | Reference unavailable after capture ALLOW | 503 `REFERENCE_DATA_UNAVAILABLE` | no idempotency/attempt/domain/outbox/Booking row; log/metric only |
| 10 | CUSTOMER_SERVICE POST capture | fresh capture AuthorizationPort evaluation DENY | 403 `CMM_AUTHORIZATION_DENIED` | no protected repository/reference lookup or idempotency; exactly one denial audit; no CMM business row |

Assert exact HTTP codes, safe envelopes, protected-data presence/absence,
repository lookup ordering, and every row's audit/database delta above. No
request may use another request's authorization result.

## Non-Claims

This proves ordering and bounded contention only. It makes no claims about
provider RPS, horizontal scaling, annual growth, caching, or cost.

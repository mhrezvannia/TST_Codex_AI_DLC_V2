# NFR Requirements Questions - U03 Reference Domain API

## Source Trace

This question record derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

## Q1. Read performance target

Which target applies to U03 provider/admin reads?

A. Common internal list/detail reads target p95 <= 300 ms under expected MVP admin and consumer load, with final load profile validated later (recommended)
B. p95 <= 1000 ms
C. Leave read latency undefined
X. Other (please specify)

[Answer]: A. p95 <= 300 ms (Recommended)

## Q2. Search/filter safety

How should U03 prevent unbounded reads?

A. Require validated set names, filters, pagination, deterministic sorting, and active-only defaults unless inactive records are explicitly requested (recommended)
B. Allow unbounded exports from provider APIs
C. Let frontend apps handle all filtering
X. Other (please specify)

[Answer]: A. Bounded query model (Recommended)

## Q3. Sensitive reference data

How should Party/Customer and other sensitive records be handled?

A. Classify Confidential or Restricted where PII or commercial sensitivity exists; emit access/audit signals for sensitive reads and admin mutations (recommended)
B. Treat all reference data as public internal data
C. Defer classification until UI design
X. Other (please specify)

[Answer]: A. Classified and audited (Recommended)

## Q4. Consistency with events

What consistency obligation does U03 own?

A. Persist reference changes and produce exactly one domain change fact for U04 on successful mutations; failed validation/authorization/conflict must produce no fact (recommended)
B. Publish Kafka directly from U03
C. Ignore event consistency until U04
X. Other (please specify)

[Answer]: A. Transactional state plus domain fact handoff (Recommended)

## Q5. Reliability posture

How should U03 handle invalid or stale mutations?

A. Reject invalid relationships, duplicate active keys, stale versions, and unauthorized mutations without persistence or event facts (recommended)
B. Save partial data and clean up later
C. Permit overwrite with last-write-wins
X. Other (please specify)

[Answer]: A. Reject unsafe mutations (Recommended)

## Ambiguity Analysis

- `requirements.md` fixes p95 <= 300 ms for common reference reads and p95 <= 60 seconds for committed-change freshness after U04 publication.
- Exact final load profile and exact per-aggregate field list remain open, so U03 NFRs require bounded validation and measurement hooks rather than final volume assumptions.
- No follow-up questions are needed because the functional design already selected approved MVP aggregate shapes and configurable exact seed/field details.


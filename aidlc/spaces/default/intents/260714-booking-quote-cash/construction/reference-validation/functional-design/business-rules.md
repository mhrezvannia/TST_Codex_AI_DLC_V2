# Business Rules - U02 Reference Validation

## Eligibility Rules

| ID | Rule | Outcome when false |
|---|---|---|
| BR-U02-001 | Validation starts only from `DRAFT`, `VALIDATION_BLOCKED`, or idempotently from equivalent `VALIDATED`. | 409 invalid transition. |
| BR-U02-002 | Customer must resolve to one ACTIVE `party-customer` record. | Field outcome inactive/not-found/mismatch. |
| BR-U02-003 | Every `loadUnLocode` and `dischargeUnLocode` must resolve to ACTIVE `location` records. | Field outcome on exact routing path. |
| BR-U02-004 | Every `voyageId` must resolve to an ACTIVE VOYAGE record in `vessel-voyage`. | Field outcome on voyage path. |
| BR-U02-005 | Voyage canonical origin/destination reference IDs must equal the leg's selected load/discharge references. | `MISMATCH` on voyage and route paths. |
| BR-U02-006 | Every `equipmentTypeCode` must resolve to one ACTIVE `equipment-type` record. | Field outcome on exact equipment path. |
| BR-U02-007 | All required fields are evaluated; one failure does not hide later field failures. | Incomplete result is an adapter defect and cannot be applied. |
| BR-U02-008 | Only a complete all-valid result transitions to `VALIDATED`. | Remain/transition blocked. |

## State and Idempotency Rules

- Add `VALIDATION_BLOCKED` as an explicit retryable Booking status; it is not the generic `EXCEPTION` state.
- A blocked result replaces the prior validation snapshot instead of appending duplicate exception entries.
- Successful retry replaces blocked details and transitions to `VALIDATED` with one lifecycle fact.
- Provider unavailability never transitions to blocked/exception/validated and never erases the last completed validation snapshot.
- Validation result applies only to the exact booking revision and reference fingerprint captured before provider calls.
- Reapplying an equivalent completed result is a no-op for lifecycle/audit duplication.
- Any later change to customer, routing, voyage, or equipment invalidates the completed validation snapshot and requires revalidation; amendment behavior is implemented later but the invariant is defined now.

## Provider and Error Rules

- 404 means `NOT_FOUND`; 200 INACTIVE means `INACTIVE`; wrong set/type/code/version shape means `MISMATCH`.
- Timeout, DNS/connection failure, 429, and 5xx mean `REFERENCE_DATA_UNAVAILABLE`; they are not business validation outcomes.
- Adapter JSON parsing failure is provider-unavailable/contract failure, not a user field error.
- Correlation ID propagates to every provider request and safe error/audit result.
- No automatic retry is performed by the validation command. Explicit operator Retry starts a fresh aggregate evaluation.
- Booking must not cache or copy Reference Data as an authoritative table; provider response versions may be stored only as validation provenance.
- Non-local profile startup fails closed without configured service identity. Local identity is explicit and never sent from browser code.

## Field Result Rules

Each `ReferenceFieldResult` contains a stable UI path such as `customerId`, `routing[0].loadUnLocode`, `routing[0].dischargeUnLocode`, `routing[0].voyageId`, or `equipment[0].equipmentTypeCode`. Reason codes are stable machine values; safe user messages are mapped at API/UI boundaries. Raw upstream bodies, hostnames, stack traces, and customer attributes are forbidden.

Result ordering is deterministic: customer, each routing leg by sequence with load/discharge/voyage, then equipment by index. This supports stable tests, focus links, and evidence.

## UI Rules

- Create/reference comboboxes show code plus label from live ACTIVE options and have loading, no-match, empty-set, and unavailable states.
- A selected option is not proof of validity; server validation must run before Price is enabled.
- `VALIDATION_BLOCKED` shows a blocking summary with exact field links and correction path; Price and Confirm remain unavailable.
- Reference provider outage shows a retryable unavailable message and does not label fields invalid.
- Successful validation announces `Booking validated`, marks canonical references verified, and exposes Price as the single primary next action.
- Failed validation preserves entered/persisted values; correction returns to the relevant create/edit surface without fake replacements.

## Scope Rules

U02 does not calculate pricing, contact Charge, publish events, create CMM journeys, or render returned movement status. It may enable the next Price action only after persisted `VALIDATED` state.

## Source Coverage

Rules implement U02 from `unit-of-work.md`, US-W1-002 in `unit-of-work-story-map.md`, FR/NFR acceptance in `requirements.md`, Booking/Reference ownership in `components.md`, typed validation methods in `component-methods.md`, and synchronous fail-contained integration in `services.md`.

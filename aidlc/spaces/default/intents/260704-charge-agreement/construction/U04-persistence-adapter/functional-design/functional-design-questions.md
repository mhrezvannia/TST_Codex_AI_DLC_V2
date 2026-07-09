# Functional Design Questions - U04 Persistence Adapter

## Answers

| Question | Answer |
| --- | --- |
| What persistence model is needed? | Agreement header table plus charge-term and activity child tables. |
| What local fallback is acceptable? | In-memory adapter can support early tests, but Postgres schema is the target. |
| How is optimistic concurrency represented? | Aggregate version is persisted and checked by application service before save. |
| What query shape supports active lookup? | Candidate query by customer, date, status, lane/location, and commodity dimensions. |

## Source Alignment

Answered from `requirements.md`, `component-methods.md`, `services.md`, and `unit-of-work.md`.

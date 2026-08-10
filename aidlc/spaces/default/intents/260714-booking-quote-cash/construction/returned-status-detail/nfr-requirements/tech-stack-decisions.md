# Tech Stack Decisions - U05 Returned Status Detail

## Selections

| Concern | Selection | Rationale |
|---|---|---|
| Publication/consume | Existing Spring Kafka + shared publisher/registrar/relay | Canonical W0 transport and retry/DLT. |
| Wire contract | Avro GenericRecord + Confluent Schema Registry | Exact nested enums/location and compatibility. |
| Projection | Spring JDBC/PostgreSQL guarded upsert | Atomic lexicographic ordering under concurrency. |
| UI observation | Next.js BFF + React one-second bounded revalidation | Meets W1 without new push infrastructure. |
| Verification | JUnit serde/ordering/rollback + Vitest/Playwright | Wire, DB, UI, and latency evidence. |

## Constraints

No WebSocket/SSE broker, direct browser CMM call, aggregate attribute-map projection, shared database, process-local dedupe, or custom Kafka infrastructure is added. Versions follow `technology-stack.md`.

## Source Coverage

Decisions realize U05 `business-logic-model.md`, `business-rules.md`, and `requirements.md` by reusing `technology-stack.md`.

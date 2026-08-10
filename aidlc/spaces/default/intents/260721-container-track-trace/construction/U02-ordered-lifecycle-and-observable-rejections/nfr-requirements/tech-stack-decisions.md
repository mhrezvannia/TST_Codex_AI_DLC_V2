# Tech Stack Decisions - U02 Ordered Lifecycle and Observable Rejections

## Source Alignment

These decisions implement U02 `business-logic-model.md` and
`business-rules.md`, satisfy `requirements.md`, and preserve the executable
inventory in `technology-stack.md`. U01's stack decisions remain authoritative.

## Selected Extensions

| Concern | Decision | Rationale |
| --- | --- | --- |
| lifecycle/conflicts | Java 21 typed domain policy and immutable records | exact transitions/write sets without framework leakage |
| persistence/fencing | PostgreSQL 15 constraints, row locks/conditional updates, Spring transactions | atomic acceptance/rejection and stale-worker protection |
| retry timing | injected `Clock` plus configuration-owned backoff; acceptance override <= 5 s | deterministic tests without fixing production policy |
| transport/order | Kafka + Avro 1.11.4 + Confluent 7.7.1; positive `int` sequence/default 0 | compatible ordered Booking consumption |
| UI | Next declared `^15.1.3`/resolved `15.5.19`, React 18.3.1, TypeScript declared `^5.7.2`/resolved `5.9.3`, shared `@erp/ui` | lock-fidelity and existing owned pages |
| verification | JUnit/Maven, Vitest, Playwright 1.61.1, run-scoped acceptance scripts | transaction, contract, consumer, recovery, accessibility evidence |

No RTK or replacement global store is added. Retry/fence configuration belongs
to CMM adapters; domain transitions remain deterministic. Booking owns its
receipt/health persistence and detail projection; CMM owns no Booking table/UI.

## Measurement and Failure Injection

Use run-scoped IDs and the existing isolated acceptance controller for the four
20-sample rejection populations and deterministic 10-delivery consumer mix.
Acceptance-only adapter seams accept one explicit run-scoped event ID and fail
only its first publisher send or first Booking processing attempt, expose
armed/disarmed evidence, and auto-disarm; they never corrupt broker/database
state or exist as production behavior. The publisher writes injected-clock
`lastAttemptAt` and `nextAttemptAt`; the Booking fixture writes its owned
PROCESSING/RETRYABLE attempt, next-at, and health evidence. Non-acceptance
profiles retain external backoff configuration. Controller and browser
monotonic timings are never subtracted from container/service clocks.
Booking persistence extends its owned projection repository with
`appendDuplicateDeliveryEvidence(eventId, partition, offset, observedAt,
correlationId)` and uses conditional event/state/worker/token/version receipt
claims; an immutable original receipt is never rewritten merely to label a
redelivery DUPLICATE.

## Rejected Additions and Gates

No new load tool, state framework, broker, cache, database, public DCSA/EDI API,
fleet/depot/M&R module, shell primitive, or production observability platform is
introduced. Maven/contracts/frontend checks, isolated Compose/Playwright proof,
demo guards, `aidlc-audit`, and `erp-fidelity-audit` remain required. W2-02 sync
precedes final visual acceptance and W1 waiver/BLOCKED history is never relabelled.

# Feasibility Questions - W2-04 Container Journey and Track-Trace

These questions test the approved `intent-statement.md` against the findings in
`competitive-analysis.md`, `market-trends.md`, and `build-vs-buy.md`.

## Q1. Existing integration boundary

Which boundary should the feasibility assessment assume?

- A. Extend the adopted Kafka, outbox, service-owned database, reference-data, Booking projection, and shared-shell seams; no synchronous substitute (recommended)
- B. Replace the asynchronous seams with direct service-to-service HTTP
- C. Introduce a new integration platform before building the slice
- X. Other (please specify)
- `[Answer]:` A. Extend the adopted seams (Recommended)

## Q2. Runtime and platform target

What runtime is a release condition for this intent?

- A. The canonical isolated local Compose stack only; record public cloud as a later operation concern (recommended)
- B. Add a new AWS production topology to W2-04
- C. Accept unit-test execution without the live stack
- X. Other (please specify)
- `[Answer]:` A. Canonical isolated local Compose stack (Recommended)

## Q3. Data and compliance posture

What compliance boundary should be carried into this slice?

- A. Treat container, booking, location, actor, correlation, and audit data as internal operational data; preserve RBAC, least privilege, minimization, and auditable changes, with no unsupported PCI/HIPAA claim (recommended)
- B. Assume regulated payment and health data are in scope
- C. Remove actor and audit evidence to minimize storage
- X. Other (please specify)
- `[Answer]:` A. Internal operational controls (Recommended)

## Q4. Delivery constraints

Which organizational constraints are binding?

- A. Preserve prior intents, synchronize after W2-02, serialize `linercore-wave-a` acceptance, and protect port 8088 with demo guards (recommended)
- B. Run final visual acceptance before W2-02 merges
- C. Reuse the manager-demo Compose project for acceptance
- X. Other (please specify)
- `[Answer]:` A. Wave A synchronization and acceptance protocol (Recommended)

## Q5. Primary technical risk

Which uncertainty should drive the risk assessment?

- A. Atomic lifecycle, ordering/idempotency, valid publication, and deduplicated Booking projection across asynchronous delivery (recommended)
- B. Predictive ETA model accuracy
- C. Multi-leg terminal connectivity throughput
- X. Other (please specify)
- `[Answer]:` A. Asynchronous event integrity (Recommended)

## Q6. Team, budget, and schedule assumption

What resourcing assumption is responsible at Ideation?

- A. Use the repository's Java/Spring, Kafka/Avro, PostgreSQL, Next.js/TypeScript, and Playwright skills and assets; make no invented budget, staffing, or date promise, and do not waive the live/audit exit gates (recommended)
- B. Require a new vendor procurement before proceeding
- C. Commit to a fixed date and headcount without supplied evidence
- X. Other (please specify)
- `[Answer]:` A. Reuse repository skills and assets without unsupported promises (Recommended)

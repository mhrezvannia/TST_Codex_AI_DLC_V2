# Units Generation Questions - W2-04 Container Journey & Track-Trace

## Q1 - Unit Boundary Strategy

Should units follow thin feature increments through CMM, Kafka, Booking, and the owned UI, rather than service or layer boundaries?

- A. Feature increments (recommended) - preserves the vertical slicing playbook and real cross-module proof.
- B. Domain increments - groups by lifecycle phase but risks deferring UI or contracts.
- C. Service boundaries - separates CMM and Booking work but creates horizontal units.
- D. Deployment targets - groups by deployable but creates horizontal units.
- X. Other.
- `[Answer]:` A. Feature increments (recommended).

## Q2 - Unit Granularity

How many vertical units should cover the approved nine-story slice?

- A. Three cohesive units (recommended) - PB-01 walking skeleton, lifecycle completion, release hardening/evidence.
- B. Two coarse units - fewer gates but larger integration batches.
- C. Five fine units - smaller batches but repeated cross-service setup and evidence overhead.
- X. Other.
- `[Answer]:` A. Three cohesive units (recommended).

## Q3 - Dependency Topology

How should dependency relationships be expressed without choosing economic implementation order?

- A. Strict minimal DAG with explicit parallel opportunities (recommended) - record only hard prerequisites; defer sequencing to Delivery Planning.
- B. Conservative DAG - add soft dependencies to reduce concurrent work.
- X. Other.
- `[Answer]:` A. Strict minimal DAG with explicit parallel opportunities (recommended).

## Q4 - Integration Points and Contracts

Which seams must travel inside the units that exercise them?

- A. Real Kafka plus owned REST/read models (recommended) - `booking.confirmed`, `containermovement.status`, Schema Registry/Avro/AsyncAPI/Pact, CMM REST, Booking projection and detail UI.
- B. Kafka contracts only - defer UIs and read models.
- C. REST and UI only - defer broker proof.
- X. Other.
- `[Answer]:` A. Real Kafka plus owned REST/read models (recommended).

## Q5 - Deployment Model

How should the units deploy?

- A. Hybrid existing-service deployment (recommended) - changes remain embedded in independently deployed CMM, Booking, Identity catalog, contracts, and CMM web app; no new service.
- B. New standalone journey service - adds a deployment target and boundary.
- C. Monolithic combined deployment - couples existing bounded contexts.
- X. Other.
- `[Answer]:` A. Hybrid existing-service deployment (recommended).

## Proposed Decomposition Plan

Use three vertical feature units with minimal topology-only dependencies:

1. U01 PB-01 Journey-to-Booking Walking Skeleton: real `booking.confirmed` creates the one-leg journey/plan; authorized CMM reads and first GTOT capture publish sequence 1; Booking consumes and renders latest progress; one out-of-sequence attempt is visibly rejected.
2. U02 Ordered Lifecycle and Rejection Evidence: extend the same live path through LOAD, DISC, and GTIN with sequence 2-4, lifecycle transitions, explicit duplicate/out-of-sequence evidence, full CMM timeline and responsive capture states.
3. U03 Authorized Degraded Journey Access: after U01 has created a persisted journey, prove read-only/capture separation, denied direct capture, Identity fail-closed behavior, and Reference Data degraded read-with-capture-disabled behavior through the real CMM API/database/UI seams.

Hard topology: U02 and U03 each depend on U01 and are mutually independent. U02 owns broker/outbox/Booking restart and redelivery behavior; the global viewport/theme, Compose/demo-guard, and audit proof remains in the intent Exit Gate rather than becoming a horizontal unit. Deployment remains in the existing services/apps. Delivery Planning, not this stage, chooses the economic Bolt sequence.

## Plan Approval

- A. Approve Plan (recommended).
- B. Revise Plan.
- `[Answer]:` A. Approve Plan (recommended).

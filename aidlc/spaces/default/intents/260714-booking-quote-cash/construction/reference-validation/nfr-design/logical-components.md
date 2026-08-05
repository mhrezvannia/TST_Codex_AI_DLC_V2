# Logical Components - U02 Reference Validation

## Components and Failure Domains

| Component | Role | Failure isolation |
|---|---|---|
| Reference option BFF/combobox | Bounded search/cancel | UI only |
| Booking validation coordinator | Capture/evaluate/apply | No DB lock across HTTP |
| Managed validation executor/semaphore | 10 workers, queue 20, four/request, ten outbound | Reject/timeout before provider call; bounded shutdown |
| Local service-auth interceptor/filter | Identity/role | HTTP boundary |
| JDK HTTP transport/typed adapter | Bounded fan-out/mapping | Provider dependency |
| Transactional apply repository | Fingerprint/state/audit | Booking DB |
| Reference Data API/DB | Canonical authority | Separate service/database |
| Metrics/tests | latency/amplification/failure evidence | Advisory/gate |

## Source Coverage

Inventory bridges `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and U02 `business-logic-model.md`.

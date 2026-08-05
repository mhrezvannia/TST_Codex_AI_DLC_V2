# Infrastructure Services - U02 Reference Validation

## Runtime Services

| Service | U02 configuration | Boundary |
|---|---|---|
| Booking app/BFF | 250 ms option debounce, abort/no overlap, page 50 | Browser mediation only |
| Booking API | managed executor/semaphore and typed overload | Validation coordinator |
| Reference Data API | active set/code/status lookup and bounded pages | Canonical authority |
| PostgreSQL 15 | isolated Booking and Reference databases/roles | No cross-schema access |
| nginx/Compose DNS | existing ingress/internal discovery | Local network only |

The Booking `RestTemplate` uses `JdkClientHttpRequestFactory` backed by one Java 21 `HttpClient`; connection/request timeouts are explicit. No automatic HTTP retry, circuit breaker, response cache, Redis, or replicated reference table is added because validation must observe current active authority. UI option results are transient display data only.

## Data and Query Services

Reference queries use set/code/status and search indexes, deterministic paging, exact active-state filtering, and at least 100 acceptance records per set. Booking captures revision/fingerprint in a short transaction, performs all remote evaluation outside DB transactions, then applies one complete valid/blocked snapshot through a proxied transaction with compare-and-set/lock.

Executor rejection or semaphore acquisition timeout returns `REFERENCE_DATA_OVERLOADED`/503 before a provider call. Provider timeout/unavailable writes safe attempt audit only and leaves business state unchanged. Completed field failures are sorted by canonical path before response and persistence.

## Configuration Ownership

Environment owns `REFERENCE_DATA_SERVICE_URL`, target-specific token, executor/queue/semaphore sizes, HTTP timeouts, and body/cardinality limits. Production-like overrides cannot activate local identity. Tokens and URLs stay server-side and are redacted; correlation propagates through BFF, Booking, Reference, logs, and traces.

## Source Coverage

Services realize `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md` and `services.md`, and U02 `business-logic-model.md`.

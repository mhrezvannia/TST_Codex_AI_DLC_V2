# Performance Design - U02 Reference Validation

## HTTP and Fan-out

One Java 21 `HttpClient`/`JdkClientHttpRequestFactory` backs the Booking `RestTemplate`, with 500 ms connect and 1.5 s request timeout. A Booking-owned singleton `ThreadPoolExecutor` bean has core/max size 10, queue capacity 20, named non-daemon workers, and `AbortPolicy`. A shared fair semaphore of 10 permits uses `tryAcquire(25 ms)` before each provider call. Semaphore timeout or executor rejection maps to typed `REFERENCE_DATA_OVERLOADED`/HTTP 503 before a provider request begins.

The coordinator submits at most four tasks for one request at a time and never enqueues the full 45-lookup upper bound. The request deadline is 2 seconds. Not-started futures are cancelled immediately after terminal failure/deadline; an in-flight synchronous HTTP exchange is not assumed interrupt-cancellable and is instead bounded by the transport timeouts. Late completions are discarded unless their captured request generation and Booking fingerprint still match. Completed results are sorted by canonical field path.

Option search uses 250 ms debounce, abort, page 50. Validation has no authoritative cache. Timers record total/provider/set/outcome/pool wait, semaphore timeout, rejection, and discarded late completion; the 100-request concurrency-10 harness enforces p95 1.5 s/p99 2 s and resource thresholds.

## Source Coverage

Design realizes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and U02 `business-logic-model.md`.

# NFR Design Questions - U02 Charge Domain Routing and BFF

## Context

The approved U02 requirements already fix the base path, route-policy registry,
signed-session/capability boundary, 32 KiB request and 512 KiB response limits,
2.5-second backend deadline, safe errors, statelessness, no cache/RTK, and
isolated runtime. These questions select only the remaining concrete BFF
resource and health patterns.

## Questions

### Q1. What per-process forwarding concurrency bound should the Charge BFF use?

- A. Use one app-level semaphore of 20 in-flight backend requests per Next process, at most 100 ms permit wait inside the 2500 ms deadline, one backend call per route request, native connection reuse, and typed 503 on overload with no automatic mutation retry **(Recommended)**
- B. Allow unbounded forwarding and rely only on the Node HTTP client
- C. Use a queue of 100 requests with a five-second wait before forwarding
- X. Other (please specify)

[Answer]: A - Use one app-level semaphore of 20 in-flight backend requests per Next process, at most 100 ms permit wait inside the 2500 ms deadline, one backend call per route request, native connection reuse, and typed 503 on overload with no automatic mutation retry. **Mode:** guided

### Q2. How should request/response byte bounds be implemented?

- A. Pre-reject declared oversize, always count actual decoded UTF-8 bytes while streaming, abort at limit+1 before JSON normalization, accumulate once, and cap fixed parser/bookkeeping overhead at 64 KiB per request **(Recommended)**
- B. Trust `Content-Length` and call `response.json()` without streaming bounds
- C. Buffer the entire body first and validate its size after parsing
- X. Other (please specify)

[Answer]: A - Pre-reject declared oversize, always count actual decoded UTF-8 bytes while streaming, abort at limit+1 before JSON normalization, accumulate once, and cap fixed parser/bookkeeping overhead at 64 KiB per request. **Mode:** guided

### Q3. How should health and invalid configuration interact?

- A. Validate mandatory non-local secrets, fixed origins, base path, and bypass posture at startup; invalid configuration keeps the process unready and makes the existing minimal public health return 503 without dependency details, while healthy probes remain process-local and never call downstreams **(Recommended)**
- B. Return 200 health whenever the Node process is running, even with invalid required configuration
- C. Make every health probe call Charge, Identity, and Reference Data
- X. Other (please specify)

[Answer]: A - Validate mandatory non-local secrets, fixed origins, base path, and bypass posture at startup; invalid configuration keeps the process unready and makes the existing minimal public health return 503 without dependency details, while healthy probes remain process-local and never call downstreams. **Mode:** guided

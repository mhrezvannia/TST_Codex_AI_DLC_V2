# NFR Requirements Questions - U02 Charge Domain Routing and BFF

## Context

U02 already fixes route/base-path behavior, 32 KiB requests, 512 KiB responses,
2.5-second backend deadline, fail-closed session/capability policy, safe errors,
and isolated port/project behavior. Only incremental BFF/proxy latency remains
unquantified.

## Question

### Q1. What provisional local latency budget should the Charge BFF/proxy add?

- A. Under 10 concurrent clients and at least 100 post-warm-up requests per read/mutation forwarding family, require BFF/proxy-only overhead p95 <= 100 ms and p99 <= 200 ms; retain end-to-end domain targets separately **(Recommended)**
- B. Set no independent BFF/proxy overhead target; validate only each domain endpoint's end-to-end target
- C. Require BFF/proxy-only overhead p95 <= 50 ms and p99 <= 100 ms under the same load
- X. Other (please specify)

[Answer]: A. Under 10 concurrent clients and at least 100 post-warm-up requests per read/mutation forwarding family, require BFF/proxy-only overhead p95 <= 100 ms and p99 <= 200 ms; retain end-to-end domain targets separately (Recommended)

**Mode:** guided

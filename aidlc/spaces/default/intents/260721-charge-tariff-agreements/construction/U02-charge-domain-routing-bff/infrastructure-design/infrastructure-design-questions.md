# Infrastructure Design Questions - U02 Charge Domain Routing and BFF

## Question assessment

No new user question was required. The approved U02 inputs already fix the
deployment and operational choices: reuse the existing Charge Next.js app and
nginx, mount exactly `/charge-agreements`, use same-origin signed-session BFF
routes, keep all forwarding bounded and stateless, reuse existing observability,
run full-stack proof only through guarded `linercore-wave-a`, and introduce no
cache, database, broker, gateway, cloud resource, or production topology.

## Ambiguity analysis

The inputs are coherent. The 24 MiB per-admission ceiling and 20-permit maximum
require up to 544 MiB including runtime margin, which cannot fit the current
256 MiB Charge-app container limit. The design resolves this without touching
the manager baseline: the wrapper-owned Wave A override sizes only the isolated
Charge app to 768 MiB with 512 MiB old space and an 8 MiB semi-space. The
independent 432 MiB heap-used, 48 MiB external/array-buffer, 64 MiB remaining
native, and 544 MiB RSS gates remain authoritative; the larger cgroup limit
prevents an OOM kill from hiding diagnostic evidence. An overrun requires lowering the response limit or
implementing a bounded incremental parser, not silently raising limits.

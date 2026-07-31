# Performance Requirements - U02 Charge Domain Routing and BFF

## Scope and measurement boundary

These provisional local targets quantify only the Charge Next.js BFF and nginx
mount selected in U02's functional design. They do not replace U01 Rate admin
targets, NFR-001's pricing p99 <= 800 ms, or any downstream domain endpoint
target. No production SLA is claimed.

`BFF overhead` is measured as elapsed browser-facing BFF/proxy time minus the
elapsed time for the same request's correlation-linked child backend span, using
monotonic clocks on the same isolated host. Both raw values and the signed
derived delta are retained. A missing/duplicate child span, correlation mismatch,
or negative delta invalidates and fails the complete run; no value is clamped.
The 2500 ms backend deadline is a failure bound, not a latency objective.

## Local acceptance workload

The checked-in driver uses the `linercore-wave-a` stack at 18088, 10 concurrent
clients, 20 discarded warm-up calls per route, and at least 100 measured calls
for each of these families:

| ID | Family and fixed mix | Target |
| --- | --- | --- |
| PERF-U02-001 | read forwarding: 25 Rate list, 25 Rate detail, 25 Agreement list, 25 Agreement detail | every route and aggregate BFF overhead p95 <= 100 ms and p99 <= 200 ms |
| PERF-U02-002 | mutation forwarding: exactly 10 calls for each of the ten route policies listed below (100 total) | every route and aggregate BFF overhead p95 <= 100 ms and p99 <= 200 ms |
| PERF-U02-003 | root 308, deep-link HTML, base-path asset, and health: at least 100 each | zero wrong-location, truncated-path, asset-prefix, or schema failures; report p50/p95/p99/max |

Mutation samples use unique fixture identities and client request UUIDs except
for an explicit retry test. An unexpected status remains in the sample set and
fails the run. A fast route cannot hide a slow route through aggregation.

The ten mutation route policies are exact: `POST /api/rates`,
`PUT /api/rates/{rateId}`, `POST /api/rates/{rateId}/versions`,
`POST /api/rates/{rateId}/versions/{versionId}/approve`,
`POST /api/charge-agreements`, `PUT /api/charge-agreements/{agreementId}`,
`POST /api/charge-agreements/{agreementId}/versions`,
`POST /api/charge-agreements/{agreementId}/versions/{versionId}/approve`,
`POST /api/charge-agreements/{agreementId}/suspend`, and
`POST /api/charge-agreements/{agreementId}/expire`. All are browser-facing paths
under the Next base path. Manual-case evidence is read-only and is deliberately
absent from the mutation family.

## Resource and payload bounds

- Browser mutation content length and decoded UTF-8 JSON body are each <=32 KiB.
- Backend JSON is read through a bounded stream and rejected above 512 KiB;
  buffering must not exceed the configured bound plus fixed parser overhead.
- Query keys, duplicate scalar keys, identifier length, `returnUrl` length, and
  page size remain bounded by the functional rules.
- Each forwarding attempt has one 2500 ms backend deadline and no automatic
  mutation retry. No commercial cache, queue, RTK store, or open-ended body
  accumulation is introduced.
- A 10-client mixed run records process RSS/heap, event-loop delay, open
  connections, in-flight requests, timeout count, response bytes, and error
  count. After input stops and 60 seconds of quiescence, in-flight requests must
  be zero, upstream connections must be no more than the pre-run idle baseline
  plus two, and `heapUsed` and RSS must each be no more than the greater of 120%
  of their pre-run idle baseline or that baseline plus 32 MiB. OOM/restart,
  failed span matching, or breach of any bound fails the run.

## Reproducibility and evidence

One checked-in driver fixes seed, warm-up, concurrency, route mix, payload sizes,
backend delay fixture, and nearest-rank percentile calculation. Raw JSONL/CSV
contains route ID, family, sample ID, correlation ID, BFF start/end, matched
backend start/end, status/code, request/response bytes, and expected outcome.
Sensitive headers, cookies, subjects, commercial values, and bodies are absent.

The report identifies commit, OS/CPU/RAM, Node/nginx versions, Compose project,
host port, and container identities. It keeps domain end-to-end samples separate
from derived BFF overhead. U06 owns the integrated live proof and comparison to
the pricing p99 gate.

## Validation matrix

| Requirement | Primary validation |
| --- | --- |
| PERF-U02-001/002 | deterministic local load driver plus correlated backend timing fixture |
| PERF-U02-003 | nginx/Next route and asset probe matrix |
| payload/resource bounds | boundary tests at limit, limit+1, slow/oversized stream, and 10-client resource sample |

## Upstream coverage

This artifact consumes `business-logic-model.md`, `business-rules.md`,
`requirements.md`, and the brownfield `technology-stack.md`; it refines their
route, payload, timeout, pricing-separation, and isolated-evidence constraints.

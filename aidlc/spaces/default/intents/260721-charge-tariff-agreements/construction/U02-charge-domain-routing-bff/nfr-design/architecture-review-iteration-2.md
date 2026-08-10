# Architecture Review - U02 NFR Design - Iteration 2

## Verdict

**NOT-READY**

No Critical findings. One High finding remains after the final permitted review:
the 20-permit memory bound excludes pre-permit request parsing and post-permit
slow-client response retention, and the parsed-graph estimate is not enforced by
the byte limit.

## Lead consistency check after review limit

This is not a third review and does not replace the NOT-READY verdict. The lead
correction acquires admission before body consumption and releases only after
browser delivery, cancellation, or a five-second egress deadline. The measured
budget is 24 MiB per admission: 1 MiB native chunks, 513 KiB limit+1 area,
1 MiB decoded text, 16 MiB parsed graph, 2 MiB normalized graph, 1 MiB queued
output, and 2.5 MiB margin. Twenty admissions yield 480 MiB plus 64 MiB runtime
margin = 544 MiB. Adversarial max-size/high-node-count fixtures must remain
within the 16/24 MiB ceilings or force a lower limit/incremental parser. Public
origins are normalized to exact HTTPS or explicit-local tuples without
path/query/fragment.

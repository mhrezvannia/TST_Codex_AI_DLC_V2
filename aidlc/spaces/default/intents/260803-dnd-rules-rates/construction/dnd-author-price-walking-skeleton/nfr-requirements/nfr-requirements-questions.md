# NFR Requirements Questions - dnd-author-price-walking-skeleton

## Q1. Warm-local evaluation load profile

Which load profile should make the provisional end-to-end p99 <= 1.5 seconds measurable for the walking skeleton?

- A. Use 5 concurrent callers, 50 warm-up requests, then 500 measured requests; record host, build and percentile distribution. (Recommended)
- B. Use one caller, 20 warm-up requests, then 200 measured requests.
- C. Defer the exact concurrency and sample size to live acceptance owners.
- X. Other (please specify)

[Answer]:

## Q2. Local restart recovery objective

What measurable reliability target should apply to committed terms, receipts and audit evidence on the existing Compose volumes?

- A. Zero committed-data loss across a graceful Charge restart, with the representative read/evaluation path healthy again within 60 seconds; this is not a production SLA. (Recommended)
- B. Zero committed-data loss, with no recovery-time target.
- C. Treat successful container restart alone as sufficient evidence.
- X. Other (please specify)

[Answer]:

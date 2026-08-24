# NFR Requirements Questions - dnd-exact-historical-calculation

## Q5. Internal latency budgets

Should the 1.5-second end-to-end target include diagnostic sub-budgets for exact calculation and required provider work?

- A. Yes: pure calculation p99 <= 10 ms, Charge database/evidence work p99 <= 300 ms, Reference Data call p99 <= 750 ms, while only the end-to-end p99 <= 1.5 seconds is the release target. (Recommended)
- B. Record component spans without numeric sub-budgets; gate only on end-to-end p99.
- C. Gate each component independently and ignore the combined end-to-end percentile.
- X. Other (please specify)

[Answer]:

## Q6. Reference Data retry posture

What reliability behavior should apply when the authoritative port-timezone lookup is unavailable?

- A. Do not retry inside the evaluation request and never guess/cache a timezone; fail as 503 within the end-to-end budget and rely on safe idempotent caller retry. (Recommended)
- B. Permit one bounded in-request retry before returning 503.
- C. Use the last known timezone during an outage.
- X. Other (please specify)

[Answer]:

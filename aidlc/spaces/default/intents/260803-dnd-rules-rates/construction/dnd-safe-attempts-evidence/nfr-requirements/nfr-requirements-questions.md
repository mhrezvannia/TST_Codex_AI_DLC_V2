# NFR Requirements Questions - dnd-safe-attempts-evidence

## Q7. Evidence-query capacity target

What bounded dataset and latency target should validate the authorised audit search?

- A. At 100,000 synthetic attempt rows, selective page-25/page-50 queries meet p95 <= 750 ms and p99 <= 1.5 seconds on the warm local stack, with denial performing no query/count. (Recommended)
- B. At 10,000 rows, require only p99 <= 1.5 seconds.
- C. Record query plans without a numeric dataset or latency target.
- X. Other (please specify)

[Answer]:

## Q8. W3-01 retention boundary

What data-lifecycle rule should W3-01 apply to bounded attempt evidence?

- A. Add no purge/retention mechanism in W3-01; preserve evidence under the existing Charge data lifecycle and Compose volumes, prohibit excess payloads, and record production retention as a later policy decision. (Recommended)
- B. Implement a 90-day purge in W3-01.
- C. Store only successful attempt evidence.
- X. Other (please specify)

[Answer]:

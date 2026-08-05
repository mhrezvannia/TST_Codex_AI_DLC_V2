# NFR Design Questions - U03 Authorized Degraded Journey Access

U03's approved NFR requirements already fix fresh authorization, last-known
read behavior, Retry recovery, bounded concurrency, and the no-cache boundary.

## Q1. Authorization failure pattern

How should Identity and Reference Data failures be handled?

- A. Fail closed for Identity; allow only authorized persisted last-known reads when Reference Data is unavailable; disable capture and use typed 403/503 envelopes. (recommended)
- B. Use cached authorization and serve protected data during Identity outage.
- C. Return generic 404 for all dependency failures.
- X. Other (please specify)

[Answer]: Fail closed + last-known (Recommended)

## Q2. Capability hint pattern

How should the UI capability hint relate to capture authority?

- A. Compute a fresh server-side hint after read ALLOW, but reevaluate capture authorization on every POST; the hint never authorizes. (recommended)
- B. Treat a prior GET hint as sufficient POST authority.
- C. Let hidden/disabled controls decide authorization.
- X. Other (please specify)

[Answer]: Hint only, POST reevaluates (Recommended)

## Q3. Degraded freshness pattern

How should authorized last-known data be presented and recovered?

- A. Label persisted facts `last-known` with dependency/reason/checked time, disable capture, and require user-triggered fresh Retry; no automatic replay. (recommended)
- B. Label outage data as fresh and keep capture enabled.
- C. Hide the dependency state and retry silently.
- X. Other (please specify)

[Answer]: Label + user Retry (Recommended)

# Functional Design Questions - U03 Application Service and Ports

## Answers

| Question | Answer |
| --- | --- |
| Which use cases are required? | Create, update, approve, suspend, expire, detail, search, and active lookup. |
| Which ports isolate infrastructure? | Repository, reference validator/client, authorization client, ID generator, clock, and event publisher. |
| How is active lookup resolved? | Query approved active candidates, filter by customer/lane or locations/commodity/date, and return match or deterministic no-match. |
| How are permissions handled locally? | Use an authorization port that can allow local bypass only under development-local conditions. |

## Source Alignment

Answered from `component-methods.md`, `services.md`, `requirements.md`, `stories.md`, and `unit-of-work.md`.

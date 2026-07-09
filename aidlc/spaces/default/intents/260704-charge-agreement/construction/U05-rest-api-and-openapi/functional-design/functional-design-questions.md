# Functional Design Questions - U05 REST API and OpenAPI

## Answers

| Question | Answer |
| --- | --- |
| Which endpoints are required? | Search, create, detail, update, approve, suspend, expire, and active lookup. |
| How are errors normalized? | Validation 400, forbidden 403, not-found 404, version conflict 409, upstream unavailable 503. |
| What contract supports Booking? | Active lookup endpoint returns matched result or deterministic no-match payload. |
| How are correlation IDs handled? | Accept incoming correlation header or generate one and echo it in responses/errors. |

## Source Alignment

Answered from `requirements.md`, `component-methods.md`, `services.md`, `unit-of-work.md`, and `unit-of-work-story-map.md`.

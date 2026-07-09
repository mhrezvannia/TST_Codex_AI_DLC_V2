# Tech Stack Decisions - U04

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Decisions

Use Postgres 15 and the existing Spring Boot data-access style. Support in-memory fakes for application tests.

## Rationale

Postgres is already part of Shared Platform local runtime and Compose.

## Review

Verdict: READY

Inline architecture review completed because the configured reviewer subagent model is unavailable. U04 NFRs cover transactional integrity, search performance, and reference-ID storage.

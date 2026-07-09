# Tech Stack Decisions - U05

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Decisions

Use Spring Boot REST controllers and OpenAPI 3.0.3 contracts under existing `contracts/openapi` conventions.

## Rationale

Matches existing service contracts and keeps Booking handoff language standard.

## Review

Verdict: READY

Inline architecture review completed because the configured reviewer subagent model is unavailable. U05 NFRs define API latency, error, correlation, and active-lookup behavior.

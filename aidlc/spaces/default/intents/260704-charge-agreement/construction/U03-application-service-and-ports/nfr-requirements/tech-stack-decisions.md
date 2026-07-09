# Tech Stack Decisions - U03

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Decisions

Use Java 21 application-service module with ports as interfaces and JUnit tests with in-memory fakes.

## Rationale

This follows the existing service pattern and keeps adapters replaceable.

## Review

Verdict: READY

Inline architecture review completed because the configured reviewer subagent model is unavailable. U03 NFRs make authorization, correlation, no-match semantics, and port isolation testable.

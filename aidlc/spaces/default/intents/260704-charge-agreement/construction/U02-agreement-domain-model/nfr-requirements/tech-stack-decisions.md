# Tech Stack Decisions - U02

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Decisions

Use Java 21 records/classes and JUnit Jupiter. Do not add Lombok or Spring to `domain-core`.

## Rationale

Matches existing hexagonal backend style and keeps the commercial rules portable.

## Review

Verdict: READY

Inline architecture review completed because the configured reviewer subagent model is unavailable. U02 NFRs protect domain purity and testability.

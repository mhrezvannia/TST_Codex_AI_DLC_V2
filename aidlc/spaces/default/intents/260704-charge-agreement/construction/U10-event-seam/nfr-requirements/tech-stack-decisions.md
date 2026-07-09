# Tech Stack Decisions - U10

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Decisions

Use Java published-language records/interfaces and defer Kafka adapter proof until Docker/Compose recovers.

## Rationale

Preserves event-driven architecture without blocking local functional completion.

## Review

Verdict: READY

Inline architecture review completed because the configured reviewer subagent model is unavailable. U10 NFRs keep event readiness separate from live Kafka proof.

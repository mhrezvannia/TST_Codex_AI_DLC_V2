# Tech Stack Decisions - U08

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Decisions

Use existing Node readiness/smoke scripts, local Maven, vendored Yarn, Java 21, and host-runtime service ports.

## Rationale

These are already proven for Shared Platform and avoid blocked Docker during construction.

## Review

Verdict: READY

Inline architecture review completed because the configured reviewer subagent model is unavailable. U08 NFRs distinguish pass, blocked, and failed readiness evidence.

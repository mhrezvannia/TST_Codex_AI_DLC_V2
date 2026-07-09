# Logical Components - U04

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Components

| Component | Failure domain |
| --- | --- |
| Dataaccess adapter | Repository implementation. |
| Postgres schema | Durable agreement state. |
| In-memory adapter | Tests/local fallback only. |

## Review

Verdict: READY

Inline architecture review completed because the configured reviewer subagent model is unavailable.

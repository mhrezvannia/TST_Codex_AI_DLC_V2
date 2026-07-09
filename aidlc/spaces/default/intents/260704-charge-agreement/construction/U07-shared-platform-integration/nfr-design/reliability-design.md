# Reliability Design - U07

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Design

Reference failures produce set-specific error state and keep drafts intact. Backend distinguishes upstream-unavailable from invalid reference ID.

## Recovery

Retry reference load without resetting agreement form state.

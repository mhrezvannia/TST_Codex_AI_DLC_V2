# Reliability Design - U06

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Design

Keep editor draft state local during failed requests. Show non-destructive banners for BFF/API/reference failures.

## Recovery

Users can retry save/status/lookup actions without losing current form input.

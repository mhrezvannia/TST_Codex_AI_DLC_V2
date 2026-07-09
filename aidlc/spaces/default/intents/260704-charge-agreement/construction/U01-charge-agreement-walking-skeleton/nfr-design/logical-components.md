# Logical Components - U01

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Components

| Component | Failure domain |
| --- | --- |
| `charge-agreement-service` | Backend skeleton process on `8084`. |
| `apps/charge-agreements` | UI process on `3002`. |
| Local reverse proxy | Browser route `/charge-agreements/`. |

## Review

Verdict: READY

Inline architecture review completed because the configured reviewer subagent model is unavailable.

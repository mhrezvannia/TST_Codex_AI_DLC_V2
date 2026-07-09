# Logical Components - U03

## Source Alignment

Consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Components

| Component | Failure domain |
| --- | --- |
| Application service | Use-case orchestration. |
| Repository port | Storage boundary. |
| Reference/auth ports | Shared Platform dependency boundary. |
| Event publisher port | Optional async seam. |

## Review

Verdict: READY

Inline architecture review completed because the configured reviewer subagent model is unavailable.

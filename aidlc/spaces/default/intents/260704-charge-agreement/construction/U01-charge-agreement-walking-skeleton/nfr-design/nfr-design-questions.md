# NFR Design Questions - U01

## Answers

| Question | Answer |
| --- | --- |
| Which resilience pattern applies? | Keep health/module-info independent of downstream services. |
| Which security pattern applies? | Visible local-bypass banner and no secrets in module-info. |
| Which logical boundary matters? | Separate backend service, UI app, and reverse-proxy route. |

## Source Alignment

Answered from `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

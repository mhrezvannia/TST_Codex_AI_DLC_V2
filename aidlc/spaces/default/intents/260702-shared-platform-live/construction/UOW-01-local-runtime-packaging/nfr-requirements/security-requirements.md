# Security Requirements - UOW-01 Local Runtime Packaging

## Context

Consumes `business-logic-model`, `business-rules`, `requirements`, and `technology-stack`.

## Controls

- Do not print secret values from env files or process environment.
- Report only secret presence/absence and configuration key names.
- Validate local-only switches such as `AUTH_BYPASS` are visibly marked.
- Do not create public cloud resources or credentials in this unit.

## Threats

| Threat | Requirement |
| --- | --- |
| Secret disclosure in logs | Mask values and avoid dumping env files. |
| False green security state | Mark unknown/unavailable checks as blocked or warning. |


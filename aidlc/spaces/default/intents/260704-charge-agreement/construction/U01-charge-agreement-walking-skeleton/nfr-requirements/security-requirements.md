# Security Requirements - U01

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Controls

| Control | Requirement |
| --- | --- |
| Local bypass | Development-only and visible in the UI status banner. |
| No sensitive data | Skeleton endpoint exposes only module metadata. |
| Dependency boundary | Domain and container wiring follow existing Spring Boot patterns. |

## Threat Notes

Do not allow local-bypass settings to become safe-looking production defaults.

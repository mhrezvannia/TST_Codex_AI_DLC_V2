# Security Requirements - UOW-03 Identity Authorization

## Context

Consumes `business-logic-model`, `business-rules`, `requirements`, and `technology-stack`.

## Controls

- Unknown subject denies by default.
- Role assignment requires `identity-roles:assign`.
- Authorization audit records denials and role changes.
- Correlation id is required for all authorization decisions.
- Only active assignments grant permissions.

## Compliance

- Party/customer sensitive reference work requires explicit role/permission traceability.
- Audit evidence must support local troubleshooting and future compliance review.


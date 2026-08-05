# Security Design - U02 Reference Validation

## Adapter Boundary

Reference set/path is selected from enum configuration, never concatenated user URLs. Outbound interceptor adds service ID/token/correlation from server configuration. Reference Data auth filter performs constant-time token validation and maps only `reference:read`; local profile guard rejects non-local startup.

DTO mapper allow-lists identity/status/version and voyage route attributes, enforces response/body limits, and discards customer/unrelated attributes. Safe exception mapper converts transport/contract failures without raw body/host/token. BFF strips spoofed headers and browser never reaches provider.

## Verification

Adapter tests use forged paths/headers, malformed/oversized JSON, denied role, PII canary, timeout, and redacted logs. Same-origin UI and escaped field messages prevent injection display.

## Source Coverage

Design implements `security-requirements.md` with `performance-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and U02 `business-logic-model.md`.

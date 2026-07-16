# Incident Response Memory

## Interpretations

- 2026-07-16T15:55:55Z - Treated the blocked live acceptance run as the concrete incident scenario; W1 incident response needs to help the next runner resolve Docker image pull and nginx smoke blockers without weakening the release gate.

## Deviations

- 2026-07-16T15:55:55Z - Used local runbooks instead of SSM Automation and AWS Incident Manager artifacts; the active deployment architecture is local Compose with retained evidence, not production AWS.

## Tradeoffs

- 2026-07-16T15:55:55Z - Made direct app/service health diagnostic-only; accepting direct probes would hide nginx/user-path failures and conflict with the live acceptance contract.

## Open questions

- 2026-07-16T15:55:55Z - Confirm the human owner names for Booking, CMM, Charge, platform, and security before this matrix is used outside the local W1 run.

# Log Queries

## Inputs

Log queries consume `performance-design`, `security-design`, `reliability-design`, `monitoring-design`, and `infrastructure-services`.

## Local Queries

Reference Data BFF upstream failures:

```text
service="apps-reference-data" status=503 correlationId=*
```

Authorization denials:

```text
service="identity-service" event="AUTHORIZATION_DECISION" result="DENY"
```

Seed apply failures:

```text
artifact="seed-apply-attempt.json" status="failed"
```

Contract verification failures:

```text
artifact="contracts-live-verification.json" status="failed"
```

Outbox publication failures:

```text
service="reference-data-service" outboxStatus=("FAILED_PERMANENT" OR "RECOVERY_REQUIRED")
```

## Retention

Local logs are development evidence. Hosted/on-prem retention must be defined before production-like operation; default recommendation is 30 days for application logs and 90 days for audit/security events.

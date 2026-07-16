# Security Design - U06 Replay and Restart Safety

## Protected Controls

Replay CLI/protected local endpoint validates separate replay token/role, actor, reason and coordinates. Environmental mode republishes original bytes; correction mode parses canonical schema, requires same envelope ID, records original/corrected hashes and field diff, then publishes. Neither mode has DB credentials/table update behavior.

Fault seams are constructor-injected test collaborators/default no-op and absent from production controllers/config. Compose scripts call Docker/Kafka controls, redact commands/environment, and hash evidence/backups. Tests prove normal tokens cannot replay, tampering fails, audit is mandatory, and no fault endpoint exists.

## Source Coverage

Design implements `security-requirements.md` with `performance-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and U06 `business-logic-model.md`.
